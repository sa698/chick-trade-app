import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import BottomSheet from "@gorhom/bottom-sheet";
import CreateOrderSheet from "./components/CreateOrderSheet";
import CustomButton from "@/components/CustomButtom";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have expo-icons
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
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.orderCard}
      onPress={() =>
        router.push(`/organization/${organizationId}/sales/${item.id}`)
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#6366f1" />
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube" size={18} color="#4f46e5" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Product</Text>
            <Text style={styles.infoValue}>{item.product.name}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { marginTop: 12 }]}>
          <View style={[styles.iconCircle, { backgroundColor: "#f0fdf4" }]}>
            <Ionicons name="bus" size={18} color="#16a34a" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoValue}>{item.vehicle.name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Manage your trade</Text>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() => sheetRef.current?.expand()}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          onEndReached={() =>
            hasMore && !isFetchingNextPage && fetchOrders(page + 1)
          }
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4f46e5"
            />
          }
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <ActivityIndicator style={{ margin: 20 }} color="#4f46e5" />
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found</Text>
          }
        />
      )}

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
          onClose={() => sheetRef.current?.close()}
          onSuccess={() => {
            sheetRef.current?.close();
            onRefresh();
          }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1e293b" },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerAddBtn: {
    backgroundColor: "#4f46e5",
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  listContainer: { padding: 20, paddingBottom: 100 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  dateText: { fontSize: 13, fontWeight: "600", color: "#6366f1" },
  cardContent: { gap: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: { fontSize: 15, color: "#334155", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
});
