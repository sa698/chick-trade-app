import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import BottomSheet from "@gorhom/bottom-sheet";
import CreateOrderSheet from "./components/CreateOrderSheet";

interface Order {
  id: string;
  date: string;
  product: { id: string; name: string };
  vehicle: { id: string; name: string };
}

interface Option {
  label: string;
  value: string;
}

const API_BASE = "https://chick-trade-15.vercel.app";
const PAGE_SIZE = 5;

export default function OrdersScreen() {
  const { organization } = useOrganization();
  const organizationId = organization?.id;
  const { getToken } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [vehicles, setVehicles] = useState<Option[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /** Bottom Sheet */
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["85%"], []);

  /** Core Fetch Logic */
  /** Optimized Fetch Logic */
  const fetchOrders = useCallback(
    async (pageToFetch: number, isRefreshing = false) => {
      if (!organizationId) return;

      // Prevent multiple simultaneous fetches for the same page
      if (!isRefreshing && isFetchingNextPage) return;

      try {
        if (isRefreshing) {
          setRefreshing(true);
        } else {
          setIsFetchingNextPage(true);
        }

        const token = await getToken();
        const res = await axios.get(`${API_BASE}/api/${organizationId}/order`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageToFetch,
            limit: PAGE_SIZE,
          },
        });

        const newOrders: Order[] = res.data.orders ?? [];

        setOrders((prev) => {
          const updatedList = isRefreshing
            ? newOrders
            : [...prev, ...newOrders];
          // Log this to your console to debug the count
          console.log(
            `Fetched Page ${pageToFetch}. Total Items: ${updatedList.length}`
          );
          return updatedList;
        });

        // CRITICAL: If newOrders.length is less than PAGE_SIZE, we are at the end.
        // If it's EXACTLY PAGE_SIZE, there might be more.
        setHasMore(newOrders.length === PAGE_SIZE);
        setPage(pageToFetch);
      } catch (err) {
        console.error("Fetch orders failed", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFetchingNextPage(false);
      }
    },
    [organizationId, getToken, isFetchingNextPage] // Added isFetchingNextPage to deps
  );

  const onEndReached = () => {
    // Trigger fetch for the NEXT page only if conditions are met
    if (hasMore && !isFetchingNextPage && !refreshing && orders.length > 0) {
      fetchOrders(page + 1, false);
    }
  };

  /** Initial Load */
  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      fetchOrders(1, true);
      fetchProducts();
      fetchVehicles();
    }
  }, [organizationId]);

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/${organizationId}/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data ?? [];
      setProducts(list.map((p: any) => ({ label: p.name, value: p.id })));
    } catch (err) {
      console.error("Fetch products failed", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/${organizationId}/vehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data ?? [];
      setVehicles(list.map((v: any) => ({ label: v.name, value: v.id })));
    } catch (err) {
      console.error("Fetch vehicles failed", err);
    }
  };

  const onRefresh = () => {
    setHasMore(true);
    fetchOrders(1, true);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Add Order Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => sheetRef.current?.expand()}
      >
        <Text style={styles.addButtonText}>＋ Add Order</Text>
      </TouchableOpacity>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.dateText}>
              {new Date(item.date).toDateString()}
            </Text>
            <Text style={styles.productName}>Product: {item.product.name}</Text>
            <Text style={styles.vehicleName}>Vehicle: {item.vehicle.name}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2} // Triggers when 20% from the bottom
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={() => {
          if (isFetchingNextPage) {
            return <ActivityIndicator style={{ marginVertical: 20 }} />;
          }
          if (!hasMore && orders.length > 0) {
            return <Text style={styles.endText}>No more orders to show</Text>;
          }
          return null;
        }}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={{ color: "#6b7280" }}>No orders found.</Text>
          </View>
        )}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={-1}
      >
        <CreateOrderSheet
          organizationId={organizationId!}
          products={products}
          vehicles={vehicles}
          onClose={() => sheetRef.current?.close()} // PASS THIS
          onSuccess={() => {
            sheetRef.current?.close();
            fetchOrders(1, true);
          }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  listContainer: { flexGrow: 1, padding: 10 },
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
  dateText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  productName: { color: "#4b5563", marginTop: 6 },
  vehicleName: { color: "#9ca3af", marginTop: 2 },
  addButton: {
    backgroundColor: "#111827",
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 10,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  endText: { textAlign: "center", color: "#9ca3af", marginVertical: 20 },
});
