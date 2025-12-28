import React, { forwardRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
// ADD SubmitHandler to the import below
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import CustomComboBox from "@/components/CustomComboBox";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButtom";

interface Expance {
  id: string;
  name: string;
}

interface ExpanceCardFormProps {
  listId: string;
  orderDate: string;
  expance: Expance[];
  initialData?: any;
  onCancel: () => void;
  onSuccess: (updatedSale: any) => void;
}

const salesFormSchema = z.object({
  expanceId: z.string().min(1, "Expance is required"),
  listId: z.string(),
  orderDate: z.string(),
 amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  desc: z.string().optional(),
});

type SalesFormValues = z.output<typeof salesFormSchema>;

const API_BASE = "https://chick-trade-15.vercel.app";

const ExpanceCardForm = forwardRef<View, ExpanceCardFormProps>(
  ({ listId, orderDate, expance, initialData, onCancel, onSuccess }, ref) => {
    const [loading, setLoading] = useState(false);
    const { organizationId } = useLocalSearchParams<{
      organizationId: string;
    }>();
    const { getToken } = useAuth();

    const isEditing = !!initialData;

    const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { errors },
    } = useForm<SalesFormValues>({
      resolver: zodResolver(salesFormSchema) as any,
      mode: "onTouched",
      defaultValues: {
        expanceId: initialData?.expance?.id || "",
        listId: initialData?.listId || listId,
        orderDate: initialData?.orderDate || orderDate,
        desc: initialData?.desc || "",
        amount: initialData?.amount || 0,
      },
    });

    useEffect(() => {
      if (initialData) {
        reset({
          expanceId: initialData.expance?.id,
          listId: initialData.listId,
          orderDate: initialData.orderDate,
          desc: initialData.desc,
          amount: initialData.amount,
        });
      }
    }, [initialData, reset]);

    // FIXED: Changed SubmitHandler type to SalesFormValues
    const onSubmit: SubmitHandler<SalesFormValues> = async (data) => {
      if (!organizationId) return;

      try {
        setLoading(true);
        const token = await getToken();

        const url = isEditing
          ? `${API_BASE}/api/${organizationId}/card-expence/${initialData.id}`
          : `${API_BASE}/api/${organizationId}/card-expence`;

        const response = isEditing
          ? await axios.patch(url, data, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await axios.post(url, data, {
              headers: { Authorization: `Bearer ${token}` },
            });

        onSuccess(response.data);
        Alert.alert("Success", isEditing ? "Expance updated" : "Expance added");
      } catch (err: any) {
        Alert.alert("Error", "Could not save expance info");
      } finally {
        setLoading(false);
      }
    };

    return (
      <View ref={ref} style={styles.container}>
        <Text style={styles.formTitle}>
          {isEditing ? "Edit Expance Entry" : "New Expance Entry"}
        </Text>

        <Text style={styles.label}>Category</Text>
        <CustomComboBox
          control={control}
          name="expanceId"
          options={expance.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select Category"
        />

        <Text style={styles.label}>Amount</Text>
        <CustomInput
          control={control}
          name="amount"
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
     <Text style={styles.label}>Description</Text>
        <CustomInput
          control={control}
          name="desc"
          placeholder="Optional details..."
          keyboardType="default"
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancel]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ flex: 1.5 }}>
            <CustomButton
              text={
                loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Expance"
                  : "Add Expance"
              }
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    );
  }
);

// ... (Styles remain the same)
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    color: "#4b5563",
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 10 },
  rowItem: { flex: 1 },
  readOnlyBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    justifyContent: "center",
    height: 48,
  },
  readOnlyText: { color: "#059669", fontWeight: "700", fontSize: 15 },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
    alignItems: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancel: { backgroundColor: "#f3f4f6" },
  cancelText: { color: "#374151", fontWeight: "700" },
});

export default ExpanceCardForm;
