import React, { forwardRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

interface PurchaseCardFormProps {
  listId: string;
  orderDate: string;
  supplier: { id: string; name: string }[];
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
  onSuccess?: (newData: any) => void;
}

// 1. Validation Schema
const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  listId: z.string(),
  orderDate: z.string(),
  farm: z.string().optional(),
  box: z.preprocess((val) => (val === "" ? 0 : Number(val)), z.number().min(1, "Min 1 box")),
  weight: z.preprocess((val) => (val === "" ? 0 : Number(val)), z.number().min(0.1, "Weight required")),
  price: z.preprocess((val) => (val === "" ? 0 : Number(val)), z.number().min(0, "Price required")),
  amount: z.number(),
  avg: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
});

type FormValues = z.infer<typeof formSchema>;

const PurchaseCardForm = forwardRef<View, PurchaseCardFormProps>(
  ({ listId, orderDate, supplier, isEditing, enableEditing, disableEditing, onSuccess }, ref) => {
    const [loading, setLoading] = useState(false);
    const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

    const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { errors },
    } = useForm<FormValues>({
    //   resolver: zodResolver(formSchema),
      defaultValues: {
        supplierId: "",
        listId,
        orderDate,
        box: 1,
        weight: 0,
        price: 0,
        amount: 0,
        farm: "",
      },
    });

    const price = watch("price");
    const weight = watch("weight");

    // 2. Auto-calculation logic
    useEffect(() => {
      const total = (Number(price) || 0) * (Number(weight) || 0);
      setValue("amount", Number(total.toFixed(2)));
    }, [price, weight, setValue]);

    const onSubmit = async (data: FormValues) => {
      try {
        setLoading(true);
        // Ensure the API URL is correct for your environment
        const res = await axios.post(
          `https://chick-trade-15.vercel.app/api/${organizationId}/card-purchase`,
          data
        );
        
        Alert.alert("Success", "Purchase added successfully");
        reset();
        if (onSuccess) onSuccess(res.data);
        disableEditing();
      } catch (err: any) {
        console.error("Submit error", err.response?.data || err.message);
        Alert.alert("Error", "Could not save purchase. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    // 3. Render Add Button State
    if (!isEditing) {
      return (
        <TouchableOpacity style={styles.addButton} onPress={enableEditing}>
          <Text style={styles.addButtonText}>＋ Add New Purchase</Text>
        </TouchableOpacity>
      );
    }

    // 4. Render Form State
    return (
      <View ref={ref} style={styles.formCard}>
        <Text style={styles.sectionTitle}>New Purchase Entry</Text>

        {/* Supplier Selection */}
        <Text style={styles.label}>Select Supplier</Text>
        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => (
            <View style={styles.selectBox}>
              {supplier.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => field.onChange(s.id)}
                  style={[styles.option, field.value === s.id && styles.optionActive]}
                >
                  <Text style={[styles.optionText, field.value === s.id && styles.optionTextActive]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.supplierId && <Text style={styles.errorText}>{errors.supplierId.message}</Text>}

        {/* Farm Name */}
        <Text style={styles.label}>Farm Name</Text>
        <Controller
          control={control}
          name="farm"
          render={({ field }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g. Green Valley Farm"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        {/* Row 1: Box, Weight, Rate */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Boxes</Text>
            <Controller
              control={control}
              name="box"
              render={({ field }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(field.value || "")}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>

          <View style={styles.flex1}>
            <Text style={styles.label}>Weight (kg)</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(field.value || "")}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>

          <View style={styles.flex1}>
            <Text style={styles.label}>Rate</Text>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(field.value || "")}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>
        </View>

        {/* Row 2: Total Amount & Avg */}
        <View style={styles.row}>
          <View style={styles.flex2}>
            <Text style={styles.label}>Calculated Total</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.totalAmountText}>₹ {watch("amount")}</Text>
            </View>
          </View>

          <View style={styles.flex1}>
            <Text style={styles.label}>Avg Weight</Text>
            <Controller
              control={control}
              name="avg"
              render={({ field }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  value={field.value ? String(field.value) : ""}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit(onSubmit)} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Purchase</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={disableEditing}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  disabledInput: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    justifyContent: "center",
  },
  totalAmountText: {
    color: "#059669",
    fontWeight: "800",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  selectBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  option: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionActive: {
    backgroundColor: "#eff6ff",
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
  },
  optionTextActive: {
    fontWeight: "700",
    color: "#2563eb",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "#4b5563",
    fontWeight: "700",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
});

export default PurchaseCardForm;