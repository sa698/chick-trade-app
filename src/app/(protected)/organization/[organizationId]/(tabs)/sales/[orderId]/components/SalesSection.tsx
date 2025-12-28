
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import SalesForm from "./SalesForm";
import CustomButton from "@/components/CustomButtom";

interface Customer { id: string; name: string; }
interface Sale {
  id: string;
  customer: Customer;
  box: number;
  weight: number;
  price: number;
  amount: number;
  paid?: number;
  listId: string;
  orderDate: string;
}

interface SectionProps {
  orderId: string;
  orderDate: string;
  customer: Customer[];
  data: any;
}

export default function SalesSection({ orderDate, customer, data }: SectionProps) {
  const [sales, setSales] = useState<Sale[]>(data.card || []);
  const [addingSales, setAddingSales] = useState(false);
  
  // State for Double Tap & Editing
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  useEffect(() => {
    if (data.card) setSales(data.card);
  }, [data.card]);

  const handleSuccess = (updatedOrNewSale: Sale) => {
    if (editingSale) {
      // Update the item in the local list
      setSales((prev) => prev.map((s) => (s.id === updatedOrNewSale.id ? updatedOrNewSale : s)));
    } else {
      // Add new item to the list
      setSales((prev) => [updatedOrNewSale, ...prev]);
    }
    setAddingSales(false);
    setEditingSale(null);
  };

  const handleDoubleTap = (item: Sale) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      setEditingSale(item);
      setAddingSales(true);
    } else {
      setLastTap(now);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{data.title}</Text>
        {!addingSales && (
          <CustomButton
            text="＋ Add Sale"
            onPress={() => {
              setEditingSale(null);
              setAddingSales(true);
            }}
            style={styles.smallButton}
          />
        )}
      </View>

      {addingSales && (
        <SalesForm
          listId={data.id}
          orderDate={orderDate}
          customer={customer}
          initialData={editingSale} // NEW: Pass data for editing
          onCancel={() => {
            setAddingSales(false);
            setEditingSale(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleDoubleTap(item)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.customerName}>{item.customer?.name}</Text>
                <Text style={styles.amountText}>₹{item.amount}</Text>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Boxes</Text>
                  <Text style={styles.detailValue}>{item.box}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{item.weight} kg</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Rate</Text>
                  <Text style={styles.detailValue}>{item.price}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Double click an item to edit.</Text>
          </View>
        )}
      />
    </View>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827" },
  smallButton: { paddingVertical: 6, paddingHorizontal: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
  },
  customerName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  amountText: { fontSize: 16, fontWeight: "700", color: "#059669" },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  detailItem: { alignItems: "center" },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#374151" },
  paidBadge: {
    marginTop: 12,
    backgroundColor: "#ecfdf5",
    padding: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  paidText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 14 },
});
