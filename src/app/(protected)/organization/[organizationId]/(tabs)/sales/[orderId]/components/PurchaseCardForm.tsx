import React, { forwardRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
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

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseCardFormProps {
  listId: string;
  orderDate: string;
  supplier: Supplier[];
  initialData?: any; 
  onCancel: () => void;
  onSuccess: (updatedSale: any) => void;
}

const salesFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  listId: z.string(),
  orderDate: z.string(),
  box: z.coerce.number().min(1, "Box count required"),
  price: z.coerce.number().min(1, "Rate is required"),
  weight: z.coerce.number().min(0.01, "Weight is required"),
  amount: z.number(),
});

type SalesFormValues = z.output<typeof salesFormSchema>;

const API_BASE = "https://chick-trade-15.vercel.app";

const PurchaseCardForm = forwardRef<View, PurchaseCardFormProps>(
  ({ listId, orderDate, supplier, initialData, onCancel, onSuccess }, ref) => {
    const [loading, setLoading] = useState(false);
    const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
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
        supplierId: initialData?.supplier?.id || "",
        listId: initialData?.listId || listId,
        orderDate: initialData?.orderDate || orderDate,
        price: initialData?.price || ("" as any),
        box: initialData?.box || 1,
        weight: initialData?.weight || ("" as any),
        amount: initialData?.amount || 0,
      },
    });

    useEffect(() => {
      if (initialData) {
        reset({
          supplierId: initialData.supplier?.id,
          listId: initialData.listId,
          orderDate: initialData.orderDate,
          price: initialData.price,
          box: initialData.box,
          weight: initialData.weight,
          amount: initialData.amount,
        });
      }
    }, [initialData, reset]);

    const price = watch("price");
    const weight = watch("weight");

    useEffect(() => {
      const p = Number(price) || 0;
      const w = Number(weight) || 0;
      setValue("amount", Number((p * w).toFixed(2)), { shouldValidate: true });
    }, [price, weight, setValue]);

    // FIXED: Changed SubmitHandler type to SalesFormValues
    const onSubmit: SubmitHandler<SalesFormValues> = async (data) => {
      if (!organizationId) return;

      try {
        setLoading(true);
        const token = await getToken();

        const url = isEditing
          ? `${API_BASE}/api/${organizationId}/card-purchase/${initialData.id}`
          : `${API_BASE}/api/${organizationId}/card-purchase`;

        const response = isEditing
          ? await axios.patch(url, data, { headers: { Authorization: `Bearer ${token}` } })
          : await axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } });

        onSuccess(response.data);
        Alert.alert("Success", isEditing ? "Purchase updated" : "Purchase added");
      } catch (err: any) {
        Alert.alert("Error", "Could not save purchase info");
      } finally {
        setLoading(false);
      }
    };

    return (
      <View ref={ref} style={styles.container}>
        <Text style={styles.formTitle}>{isEditing ? "Edit Purchase Entry" : "New Purchase Entry"}</Text>

        <Text style={styles.label}>Supplier</Text>
        <CustomComboBox
          control={control}
          name="supplierId"
          options={supplier.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select Supplier"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Box</Text>
            <CustomInput control={control} name="box" placeholder="0" keyboardType="number-pad" />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Weight (kg)</Text>
            <CustomInput control={control} name="weight" placeholder="0.00" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Rate / Price</Text>
            <CustomInput control={control} name="price" placeholder="0.00" keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Total Amount</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>₹ {watch("amount")?.toLocaleString() || "0"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ flex: 1.5 }}>
            <CustomButton
              text={loading ? "Saving..." : isEditing ? "Update Purchase" : "Add Purchase"}
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
  formTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 15 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 4, color: "#4b5563", textTransform: 'uppercase' },
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
  buttons: { flexDirection: "row", gap: 12, marginTop: 15, alignItems: "center" },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  cancel: { backgroundColor: "#f3f4f6" },
  cancelText: { color: "#374151", fontWeight: "700" },
});

export default PurchaseCardForm;
