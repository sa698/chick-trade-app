import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { PaymentForm } from "./components/payment-form";

// const API_BASE =
//   Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";

 const API_BASE = "https://chick-trade-15.vercel.app";

export default function PaymentVoucherDetail() {
  const { organizationId, paymentId } = useLocalSearchParams();
  const { getToken } = useAuth();

  const [voucher, setVoucher] = useState<any | null>(null);
  const [suppliers, setSuppliers] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch payment if editing
        if (paymentId) {
          const resVoucher = await axios.get(
            `${API_BASE}/api/${organizationId}/payment/${paymentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setVoucher(resVoucher.data);
        }

        // Fetch suppliers
        const resSuppliers = await axios.get(
          `${API_BASE}/api/${organizationId}/supplier`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuppliers(resSuppliers.data.map((c: any) => ({ label: c.name, value: c.id })));
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch data");
      } finally {
        setLoading(false);
        setLoadingSuppliers(false);
      }
    };

    fetchData();
  }, [organizationId, paymentId]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <PaymentForm
          initialData={voucher}
          suppliers={suppliers}
          loadingSuppliers={loadingSuppliers}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
