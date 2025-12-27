import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have expo-vector-icons

import CustomDatePicker from "@/components/CustomDatePicker";
import CustomComboBox from "@/components/CustomComboBox";
import CustomInput from "@/components/CustomInput";
import { useAuth } from "@clerk/clerk-expo";

interface Props {
  organizationId: string;
  onSuccess: () => void;
  onClose: () => void; // Added onClose prop
  products: { label: string; value: string }[];
  vehicles: { label: string; value: string }[];
}

const OrderSchema = z.object({
  date: z.date(),
  productId: z.string().min(1, "Select product"),
  vehicleId: z.string().min(1, "Select vehicle"),
  description: z.string().optional(),
});

type OrderFormValues = z.infer<typeof OrderSchema>;

const API_BASE = "https://chick-trade-15.vercel.app";

export default function CreateOrderSheet({
  organizationId,
  onSuccess,
  onClose,
  products,
  vehicles,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      date: new Date(),
      productId: "",
      vehicleId: "",
      description: "",
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      // Ensure date is sent in a standard format
      await axios.post(`${API_BASE}/api/${organizationId}/order`, {
        ...data,
        date: data.date.toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      reset();
      onSuccess();
    } catch (e) {
      console.error("Order creation failed:", e);
      // Optional: Add alert or toast here for user feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* --- Close Button --- */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        disabled={loading}
      >
        <Ionicons name="close-circle" size={28} color="#9ca3af" />
      </TouchableOpacity>

      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Order</Text>

        <CustomDatePicker
          control={control}
          disabled={loading}
          name="date"
          placeholder="Select Date"
        />

        <CustomComboBox
          control={control}
          name="vehicleId"
          options={vehicles}
          disabled={loading}
          placeholder="Select Vehicle"
        />

        <CustomComboBox
          control={control}
          name="productId"
          options={products}
          disabled={loading}
          placeholder="Select Product"
        />

        <CustomInput
          control={control}
          name="description"
          disabled={loading}
          placeholder="Description (optional)"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 50, // Ensures it stays above other content
    padding: 5,
  },
  button: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});