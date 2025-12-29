import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { z } from "zod";

import CustomInput from "@/components/CustomInput";
import CustomComboBox from "@/components/CustomComboBox";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomButton from "@/components/CustomButtom";

/* ---------------- Zod Schema ---------------- */
const paymentSchema = z.object({
  date: z.date(),
  payment_type: z.string().min(1, "Payment type is required"),
  supplierId: z.string().min(1, "Customer is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Voucher {
  id: string;
  supplierId: string;
  payment_type: string;
  amount: number;
  description?: string;
  date: string;
}

interface PaymentFormProps {
  initialData?: any | null;
  suppliers?: any | null;
  loadingSuppliers?: boolean;
}

/* ---------------- API Base ---------------- */
// const API_BASE =
//   Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";

     const API_BASE = "https://chick-trade-15.vercel.app";
/* ---------------- Payment Form ---------------- */
export default function PaymentForm({
  initialData,
  suppliers,
  loadingSuppliers,
}: PaymentFormProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getToken } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;

  const title = initialData ? "Edit Payment" : "Create Payment";
  const description = initialData
    ? "Edit existing payment."
    : "Create a new payment.";
  const toastMessage = initialData ? "Payment updated." : "Payment created.";
  const action = initialData ? "Save changes" : "Create";

  const { control, handleSubmit, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData
      ? {
          date: new Date(initialData.date),
          payment_type: initialData.payment_type,
          supplierId: initialData.supplierId,
          amount: initialData.amount.toString(),
          description: initialData.description || "",
        }
      : {
          date: new Date(),
          payment_type: "",
          supplierId: "",
          amount: "",
          description: "",
        },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    if (!params.organizationId || submitting) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = { ...data, amount: Number(data.amount) };

      if (isEdit) {
        await axios.patch(
          `${API_BASE}/api/${params.organizationId}/payment/${initialData?.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Success", "Payment updated!");
      } else {
        await axios.post(
          `${API_BASE}/api/${params.organizationId}/payment`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Alert.alert("Success", "Payment created!");
      }

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomDatePicker
        control={control}
        name="date"
        placeholder="Select Date"
      />

      <CustomComboBox
        control={control}
        name="supplierId"
        options={suppliers}
        placeholder={loadingSuppliers ? "Loading..." : "Select Supplier"}
        disabled={loadingSuppliers}
      />

      <CustomComboBox
        control={control}
        name="payment_type"
        options={[
          { label: "Cash", value: "Cash" },
          { label: "Bank", value: "Bank" },
          { label: "G-pay", value: "G-pay" },
        ]}
        placeholder="Select Payment Type"
      />

      <CustomInput
        control={control}
        name="amount"
        placeholder="Amount"
        keyboardType="numeric"
      />
      <CustomInput
        control={control}
        name="description"
        placeholder="Description (optional)"
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <CustomButton text="Cancel" onPress={() => router.back()} />
        {/* {isEdit && <CustomButton text="Delete" onPress={onDelete}   />} */}
        <CustomButton
          text={
            submitting
              ? "Saving..."
              : isEdit
              ? "Save Changes"
              : "Create Payment"
          }
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    gap: 12,
  },
});
