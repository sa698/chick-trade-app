import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import { useAuth, useOrganization } from "@clerk/clerk-expo";

/* ---------------- Types ---------------- */
interface PettyCash {
  id: string;
  supplierId: string;
  amount: string;
  date: string;
  payment_type: string;
  description: string;
  pettyMaster: {
    id: string;
    name: string;
  };
}

/* ---------------- Helpers ---------------- */
const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB");

const formatAmount = (amount: string) =>
  `₹ ${Number(amount).toLocaleString("en-IN")}`;

export default function PettyCashIndex() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const [data, setData] = useState<PettyCash[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://chick-trade-15.vercel.app";

  // const API_BASE =
  //   Platform.OS === "web"
  //     ? "http://localhost:3000"
  //     : Platform.OS === "android"
  //     ? "http://10.0.2.2:3000"
  //     : "http://localhost:3000";

  /* ---------------- Fetch on page / org change ---------------- */
  useFocusEffect(
    useCallback(() => {
      if (organizationId) {
        fetchPayments(1); // reset to first page
        setPage(1);
      }
    }, [organizationId, page])
  );

  /* ---------------- Fetch API ---------------- */
  const fetchPayments = async (pageNumber: number) => {
    if (!organizationId) return;

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) return;

      
      const res = await axios.get(
        `${API_BASE}/api/${organizationId}/petty-cash?page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Reciept fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Loading org ---------------- */
  if (!organizationId) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={{ flex: 1,   }}>
        {/* ---------------- Header ---------------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Petty Cash 
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                `/organization/${organizationId}/payments/petty-cash/new`
              )
            }
          >
            <Text style={{ color: "#2563eb", }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- Loader ---------------- */}
        {loading && <ActivityIndicator size="large" />}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 5 }}
          ListEmptyComponent={() =>
            !loading && (
              <Text style={{ textAlign: "center", color: "#6b7280" }}>
                No Reciept vouchers found
              </Text>
            )
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              {/* Top Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600" }}>
                  {item.pettyMaster.name}
                </Text>

                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#16a34a",
                  }}
                >
                  {formatAmount(item.amount)}
                </Text>
              </View>

              {/* Middle Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "#6b7280", fontSize: 13 }}>
                  {formatDate(item.date)}
                </Text>

                <View
                  style={{
                    backgroundColor:
                      item.payment_type === "Cash" ? "#dcfce7" : "#e0f2fe",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        item.payment_type === "Cash" ? "#166534" : "#075985",
                    }}
                  >
                    {item.payment_type}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {item.description ? (
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  {item.description}
                </Text>
              ) : null}

              {/* ---------------- Edit / Delete Buttons ---------------- */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/organization/${organizationId}/payments/petty-cash/${item.id}`
                    )
                  }
                >
                  <Text style={{ color: "#2563eb", fontWeight: "600" }}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const token = await getToken();
                      await axios.delete(
                        `${API_BASE}/api/${organizationId}/reciept/${item.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      alert("Deleted successfully");
                      fetchPayments(page); // refresh list
                    } catch (err) {
                      console.error(err);
                      alert("Failed to delete");
                    }
                  }}
                >
                  <Text style={{ color: "red", fontWeight: "600" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* ---------------- List ---------------- */}
        {/* <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={() =>
            !loading && (
              <Text style={{ textAlign: "center", color: "#6b7280" }}>
                No Reciept vouchers found
              </Text>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/payments/Reciept-voucher/${item.id}?organizationId=${organizationId}`
                )
              }
              style={{
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              {/* Top Row */}

        {/* ---------------- Pagination ---------------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            disabled={page === 1 || loading}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Text style={{ opacity: page === 1 ? 0.4 : 1 }}>Prev</Text>
          </TouchableOpacity>

          <Text>
            Page {page} / {totalPages}
          </Text>

          <TouchableOpacity
            disabled={page === totalPages || loading}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={{ opacity: page === totalPages ? 0.4 : 1 }}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
});
