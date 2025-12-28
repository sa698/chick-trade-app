import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import CustomButton from "@/components/CustomButtom";
// import PurchaseForm from "./PurchaseForm"; // You will create this next

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseItem {
  id: string;
  supplier: Supplier;
  qty: number;
  rate: number;
  amount: number;
}

interface PurchaseSectionProps {
  orderId: string;
  orderDate: string;
  supplier: Supplier[];
  data: any; // Data from the parent ListContainer
}

export default function PurchaseSection({
  orderId,
  orderDate,
  supplier,
  data,
}: PurchaseSectionProps) {
  // 1. Manage local list state (initialized from props)
  const [purchases, setPurchases] = useState<PurchaseItem[]>(data?.card || []);
  const [isAdding, setIsAdding] = useState(false);

  // Sync state if global data updates
  useEffect(() => {
    if (data?.card) setPurchases(data.card);
  }, [data?.card]);

  const handleSuccess = (newPurchase: PurchaseItem) => {
    setPurchases((prev) => [newPurchase, ...prev]);
    setIsAdding(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Purchases</Text>
        {!isAdding && (
          <CustomButton
            text="＋ Add Purchase"
            onPress={() => setIsAdding(true)}
            style={styles.smallButton}
          />
        )}
      </View>

      {/* ---- FORM ---- */}
      {isAdding && (
        <View style={styles.formWrapper}>
          {/* Note: Create PurchaseForm similar to SalesForm but with supplier selection */}
          <Text style={styles.placeholderText}>
            [PurchaseForm Component Here]
          </Text>
          <TouchableOpacity 
            onPress={() => setIsAdding(false)} 
            style={styles.cancelLink}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---- LIST ---- */}
      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.supplierName}>
                {item.supplier?.name || "Unknown Supplier"}
              </Text>
              <Text style={styles.amountText}>₹{item.amount}</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{item.qty}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rate</Text>
                <Text style={styles.detailValue}>{item.rate || 0}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No purchases recorded.</Text>
        )}
        scrollEnabled={false} // Let the parent container handle scrolling
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827" },
  smallButton: { paddingVertical: 6, paddingHorizontal: 12 },
  formWrapper: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  supplierName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  amountText: { fontSize: 16, fontWeight: "700", color: "#2563eb" }, // Blue for purchases
  detailsRow: { flexDirection: "row", gap: 20 },
  detailItem: { alignItems: "flex-start" },
  detailLabel: { fontSize: 11, color: "#6b7280", textTransform: "uppercase" },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#374151" },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
  cancelLink: { marginTop: 10, alignItems: "center" },
  cancelLinkText: { color: "#ef4444", fontWeight: "600" },
  placeholderText: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic'}
});