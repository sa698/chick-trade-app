import {
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
  Text,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import ListContainer from "./components/list-container";
import { set } from "zod";
import OrderSummarySheet from "./components/OrderSummarySheet";

// import Summery from "./components/Summery";

export default function OrderIdScreen() {
  const { organizationId, orderId } = useLocalSearchParams<{
    organizationId: string;
    orderId: string;
  }>();

  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [orderDate, setOrderDate] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [expance, setExpance] = useState<any[]>([]);

  // const API_BASE =
  //   Platform.OS === "android"
  //     ? "http://10.0.2.2:3000"
  //     : "http://localhost:3000";
  const API_BASE = "https://chick-trade-15.vercel.app";

  useEffect(() => {
    if (!organizationId || !orderId) return;

    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await axios.get(
          `${API_BASE}/api/${organizationId}/order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrderDate(res.data.date);
        setLists(res.data.lists || []);
        setData(res.data || []);
      } catch (error) {
        console.error("Failed to load order details", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    supplierList();
    customerList();
    expanceList();
  }, [organizationId, orderId]);

  const supplierList = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      let res = await axios.get(`${API_BASE}/api/${organizationId}/supplier`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuppliers(res.data || []);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    }
  };
  const customerList = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      let res = await axios.get(`${API_BASE}/api/${organizationId}/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(res.data || []);
    } catch (error) {
      console.error("Failed to load c", error);
    }
  };
  const expanceList = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      let res = await axios.get(`${API_BASE}/api/${organizationId}/expance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpance(res.data || []);
    } catch (error) {
      console.error("Failed to load expance", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ListContainer
        orderDate={orderDate}
        customer={customers}
        supplier={suppliers}
        expance={expance}
        orderId={orderId}
        data={lists}
      />
      {/* <Text>Sales ID: {orderId}</Text> */}
      <View>
        <OrderSummarySheet order={data}   isAdmin={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
