import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

interface Item {
  name: string;
  balance: number;
}

const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";

export const OutstandingList = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();

  const organizationId = params.organizationId as string;

  console.log("Organization ID in OutstandingList:", organizationId);
  useEffect(() => {
    if (!organizationId) return; // ensure values exist
    fetchOutstanding();
  }, [organizationId]);

  const fetchOutstanding = async () => {
    const token = await getToken();
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/api/${organizationId}/reports/sup-out`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Outstanding API response:", res.data);
      setData(res.data.result ?? []);
    } catch (error) {
      console.error("Outstanding API error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...data].sort((a, b) => b.balance - a.balance);
  const total = sortedData.reduce((sum, i) => sum + i.balance, 0);

  const renderItem = ({ item, index }: any) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.index]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.name]}>{item.name}</Text>
      <Text style={[styles.cell, styles.amount]}>₹ {item.balance}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.index]}>#</Text>
        {/* <Text style={[styles.cell, styles.name]}>
          {type === "CUS" ? "Customer" : "Supplier"}
        </Text> */}
        <Text style={[styles.cell, styles.amount]}>Outstanding</Text>
      </View>

      <FlatList
        data={sortedData}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        ListFooterComponent={() => (
          <View style={[styles.row, styles.footer]}>
            <Text style={[styles.cell, styles.index]} />
            <Text style={[styles.cell, styles.name, styles.footerText]}>
              Total
            </Text>
            <Text style={[styles.cell, styles.amount, styles.footerText]}>
              ₹ {total.toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  header: { backgroundColor: "#f1f5f9" },
  footer: { backgroundColor: "#fafafa" },
  cell: { fontSize: 14 },
  index: { width: "10%" },
  name: { width: "60%", fontWeight: "500" },
  amount: { width: "30%", textAlign: "right", fontWeight: "600" },
  footerText: { fontWeight: "700" },
  loader: { padding: 40, alignItems: "center" },
});
export default OutstandingList;
