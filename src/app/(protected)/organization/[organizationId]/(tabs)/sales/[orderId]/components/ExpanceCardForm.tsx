import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";

interface Expance {
  id: string;
  name: string;
}

interface ExpanceCardFormProps {
  listId: string;
  orderDate: string;
  expance: Expance[];
  onCancel: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  expanceId: z.string().min(1, "Expense category is required"),
  listId: z.string(),
  orderDate: z.string(),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  desc: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const API_BASE = "https://chick-trade-15.vercel.app";

export default function ExpanceCardForm({
  listId,
  orderDate,
  expance,
  onCancel,
  onSuccess,
}: ExpanceCardFormProps) {
  const { getToken } = useAuth();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // resolver: zodResolver(formSchema), // Re-enabled resolver
    defaultValues: {
      expanceId: "",
      listId,
      orderDate,
      amount: 0,
      desc: "",
    },
  });

  const selectedExpanceId = watch("expanceId");

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const token = await getToken();

      await axios.post(
        `${API_BASE}/api/${organizationId}/card-expence`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while saving the expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add New Expense</Text>

      {/* Expense Select Chips */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.optionsContainer}>
        {expance.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.option,
              selectedExpanceId === item.id && styles.optionActive,
            ]}
            onPress={() => setValue("expanceId", item.id)}
          >
            <Text style={[
              styles.optionText,
              selectedExpanceId === item.id && styles.optionTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.expanceId && (
        <Text style={styles.error}>{errors.expanceId.message}</Text>
      )}

      {/* Amount Input */}
      <Text style={styles.label}>Amount (₹)</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={value === 0 ? "" : value.toString()}
            onChangeText={onChange}
          />
        )}
      />
      {errors.amount && (
        <Text style={styles.error}>{errors.amount.message}</Text>
      )}

      {/* Remarks/Description Input */}
      <Text style={styles.label}>Remarks</Text>
      <Controller
        control={control}
        name="desc"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes..."
            multiline
            numberOfLines={3}
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Expense</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancel} 
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.btnTextSecondary}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 6,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    backgroundColor: "#f9fafb",
  },
  optionActive: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  optionText: {
    fontSize: 13,
    color: "#4b5563",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  submit: {
    flex: 2,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancel: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  btnTextSecondary: {
    color: "#4b5563",
    fontWeight: "600",
    fontSize: 15,
  },
});