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
const receiptSchema = z.object({
  date: z.date(),
  payment_type: z.string().min(1, "Payment type is required"),
  customerId: z.string().min(1, "Customer is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  description: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

interface Voucher {
  id: string;
  customerId: string;
  payment_type: string;
  amount: number;
  description?: string;
  date: string;
}

interface ReceiptFormProps {
  initialData?: any | null;
  customers?: any | null;
  loadingCustomers?: boolean;
}

/* ---------------- API Base ---------------- */
// const API_BASE =
//   Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";

     const API_BASE = "https://chick-trade-15.vercel.app";
/* ---------------- Receipt Form ---------------- */
export default function ReceiptForm({
  initialData,
  customers,
  loadingCustomers,
}: ReceiptFormProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getToken } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;

  const title = initialData ? "Edit Receipt" : "Create Receipt";
  const description = initialData
    ? "Edit existing receipt."
    : "Create a new receipt.";
  const toastMessage = initialData ? "Receipt updated." : "Receipt created.";
  const action = initialData ? "Save changes" : "Create";

  const { control, handleSubmit, reset } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: initialData
      ? {
          date: new Date(initialData.date),
          payment_type: initialData.payment_type,
          customerId: initialData.customerId,
          amount: initialData.amount.toString(),
          description: initialData.description || "",
        }
      : {
          date: new Date(),
          payment_type: "",
          customerId: "",
          amount: "",
          description: "",
        },
  });

  const onSubmit = async (data: ReceiptFormValues) => {
    if (!params.organizationId || submitting) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = { ...data, amount: Number(data.amount) };

      if (isEdit) {
        await axios.patch(
          `${API_BASE}/api/${params.organizationId}/reciept/${initialData?.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Success", "Receipt updated!");
      } else {
        await axios.post(
          `${API_BASE}/api/${params.organizationId}/reciept`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Alert.alert("Success", "Receipt created!");
      }

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit receipt");
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
        name="customerId"
        options={customers}
        placeholder={loadingCustomers ? "Loading..." : "Select Customer"}
        disabled={loadingCustomers}
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
              : "Create Receipt"
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
