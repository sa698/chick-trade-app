import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";

import CustomDatePicker from "@/components/CustomDatePicker";
import CustomComboBox from "@/components/CustomComboBox";
import CustomInput from "@/components/CustomInput";

interface Props {
  organizationId: string;
  onSuccess: () => void;
  products: { label: string; value: string }[];
  vehicles: { label: string; value: string }[];
}

/* ---------------- SCHEMA ---------------- */
const OrderSchema = z.object({
  date: z.string().min(1, "Order date is required"),
  productId: z.string().min(1, "Select product"),
  vehicleId: z.string().min(1, "Select vehicle"),
  description: z.string().optional(),
});

type OrderFormValues = z.infer<typeof OrderSchema>;

export default function CreateOrderSheet({
  organizationId,
  onSuccess,
  products,
  vehicles,
}: Props) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      date: "",
      productId: "",
      vehicleId: "",
      description: "",
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);

      await axios.post(
        `https://chick-trade-15.vercel.app/api/${organizationId}/order`,
        data
      );

      reset();
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Order</Text>

      {/* Date */}
      <CustomDatePicker
        control={control}
        name="date"
        placeholder="Select Date"
      />
      {errors.date && (
        <Text style={styles.error}>{errors.date.message}</Text>
      )}

      {/* Vehicle */}
      <CustomComboBox
        control={control}
        name="vehicleId"
        options={vehicles}
        placeholder="Select Vehicle"
      />
      {errors.vehicleId && (
        <Text style={styles.error}>{errors.vehicleId.message}</Text>
      )}

      {/* Product */}
      <CustomComboBox
        control={control}
        name="productId"
        options={products}
        placeholder="Select Product"
      />
      {errors.productId && (
        <Text style={styles.error}>{errors.productId.message}</Text>
      )}

      {/* Description */}
      <CustomInput
        control={control}
        name="description"
        placeholder="Description (optional)"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
  },
});
