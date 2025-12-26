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
import { PettyCashForm } from "./components/petty-form";
 
// const API_BASE =
//   Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";

 const API_BASE = "https://chick-trade-15.vercel.app";

export default function PettyCashVoucherDetail() {
  const { organizationId, pettyCashId } = useLocalSearchParams();
  const { getToken } = useAuth();

  const [voucher, setVoucher] = useState<any | null>(null);
  const [pettyMaster, setPettyMaster] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch receipt if editing
        if (pettyCashId) {
          const resVoucher = await axios.get(
            `${API_BASE}/api/${organizationId}/petty-cash/${pettyCashId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setVoucher(resVoucher.data);
        }

        // Fetch customers
        const pettyMaster = await axios.get(
          `${API_BASE}/api/${organizationId}/petty-master`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPettyMaster(pettyMaster.data.map((c: any) => ({ label: c.name, value: c.id })));
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch data");
      } finally {
        setLoading(false);
        setLoadingCustomers(false);
      }
    };

    fetchData();
  }, [organizationId, pettyCashId]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <PettyCashForm
          initialData={voucher}
          pettyMaster={pettyMaster}
          loadingCustomers={loadingCustomers}
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
