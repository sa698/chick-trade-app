import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import { useAuth, useOrganization } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

/* ---------------- Types ---------------- */
interface PettyCash {
  id: string;
  amount: string;
  date: string;
  payment_type: string;
  description: string;
  pettyMaster: {
    id: string;
    name: string;
  };
}

const API_BASE = "https://chick-trade-15.vercel.app";
const PAGE_SIZE = 10;

export default function PettyCashIndex() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const [data, setData] = useState<PettyCash[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const formatAmount = (amount: string) => `₹${Number(amount).toLocaleString("en-IN")}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB");

  /* ---------------- Fetch Logic ---------------- */
  const fetchPettyCash = useCallback(
    async (pageToFetch: number, isRefreshing = false) => {
      if (!organizationId) return;

      try {
        if (isRefreshing) {
          setLoading(true);
        } else {
          setIsFetchingNextPage(true);
        }

        const token = await getToken();
        const res = await axios.get(
          `${API_BASE}/api/${organizationId}/petty-cash?page=${pageToFetch}&limit=${PAGE_SIZE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newItems = res.data.data ?? [];
        
        setData((prev) => (isRefreshing ? newItems : [...prev, ...newItems]));
        setHasMore(newItems.length === PAGE_SIZE);
        setPage(pageToFetch);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
        setIsFetchingNextPage(false);
      }
    },
    [organizationId, getToken]
  );

  useFocusEffect(
    useCallback(() => {
      fetchPettyCash(1, true);
    }, [organizationId])
  );

  const loadMore = () => {
    if (hasMore && !isFetchingNextPage && !loading && data.length > 0) {
      fetchPettyCash(page + 1);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this petty cash entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${API_BASE}/api/${organizationId}/petty-cash/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchPettyCash(1, true);
          } catch (err) {
            Alert.alert("Error", "Failed to delete record");
          }
        },
      },
    ]);
  };

  if (!organizationId || (loading && data.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ---------------- Header & Add Button ---------------- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Expense Tracker</Text>
          <Text style={styles.headerTitle}>Petty Cash</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push(`/organization/${organizationId}/payments/petty-cash/new`)
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- List ---------------- */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No petty cash records found</Text>
          </View>
        )}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#2563eb" />
          ) : (
            <View style={{ height: 40 }} />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.masterName} numberOfLines={1}>
                {item.pettyMaster?.name || "N/A"}
              </Text>
              <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
              
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.payment_type === "Cash" ? "#dcfce7" : "#e0f2fe" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.payment_type === "Cash" ? "#166534" : "#075985" },
                  ]}
                >
                  {item.payment_type}
                </Text>
              </View>
            </View>

            {item.description && (
              <Text style={styles.descriptionText} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/organization/${organizationId}/payments/petty-cash/${item.id}`)
                }
                style={styles.actionBtn}
              >
                <Ionicons name="create-outline" size={16} color="#2563eb" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerSubtitle: { fontSize: 13, color: "#64748b", fontWeight: "500", marginBottom: -2 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  addButton: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  masterName: { fontSize: 16, fontWeight: "700", color: "#1e293b", flex: 1, marginRight: 10 },
  amountText: { fontSize: 17, fontWeight: "800", color: "#e11d48" }, // Red for Petty Cash expenses
  cardBody: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  descriptionText: { marginTop: 12, color: "#64748b", fontSize: 13, lineHeight: 18 },
  actions: { 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    gap: 20, 
    marginTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: "#f8fafc", 
    paddingTop: 12 
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  editText: { color: "#2563eb", fontWeight: "600", fontSize: 14 },
  deleteText: { color: "#dc2626", fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#94a3b8", marginTop: 12, fontSize: 15, fontWeight: "500" },
});