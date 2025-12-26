import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth, useOrganization } from "@clerk/clerk-expo";

interface Order {
  id: string;
  date: string;
  product: { id: string; name: string };
  vehicle: { id: string; name: string };
}

export default function OrdersScreen() {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();
  const API_BASE = "https://chick-trade-15.vercel.app";
  // const API_BASE =
  //   Platform.OS === "web"
  //     ? "http://localhost:3000"
  //     : Platform.OS === "android"
  //     ? "http://10.0.2.2:3000"
  //     : "http://localhost:3000";

  const fetchOrders = useCallback(
    async (pageNumber: number, refreshing = false) => {
      if (!organizationId) return;

      try {
        if (refreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token = await getToken();
        if (!token) return;

        const res = await axios.get(
          `${API_BASE}/api/${organizationId}/order?page=${pageNumber}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (pageNumber === 1) {
          setOrders(res.data.orders);
        } else {
          setOrders((prev) => [...prev, ...res.data.orders]);
        }
        setTotalOrders(res.data.totalOrders);
        setError(null);
      } catch (err: any) {
        console.error("Order fetch error:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [organizationId, getToken]
  );

  useEffect(() => {
    if (!organizationId) return; // wait until organization is loaded
    fetchOrders(1);
  }, [organizationId]); // only run when organizationId changes

  const handleRefresh = () => {
    setPage(1);
    fetchOrders(1, true);
  };

  const handleLoadMore = () => {
    if (orders.length >= totalOrders || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={<Text style={styles.emptyText}>No orders found</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.dateText}>
            {new Date(item.date).toDateString()}
          </Text>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.vehicleName}>{item.vehicle.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 4,
  },
  vehicleName: {
    color: "#9ca3af",
    fontSize: 12,
  },
  dateText: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
    fontSize: 16,
  },
});
