import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import PurchaseCardForm from "./PurchaseCardForm";

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseItem {
  id: string;
  supplier: Supplier;
  qty: number;
  weight: number;
  box: number;
  price: number; // Changed from 'rate' to match common naming, update if needed
  amount: number;
  listId: string;
  orderDate: string;
}

interface PurchaseSectionProps {
  orderId: string;
  orderDate: string;
  supplier: Supplier[];
  data: any;
}

export default function PurchaseSection({
  orderDate,
  supplier,
  data,
}: PurchaseSectionProps) {
  // 1. Local list state
  const [purchases, setPurchases] = useState<PurchaseItem[]>(data.PurchaseCard || []);
  const [isAdding, setIsAdding] = useState(false);

  // State for Double Tap & Editing
  const [editingPurchase, setEditingPurchase] = useState<PurchaseItem | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  // Sync state if global data updates
  useEffect(() => {
    if (data?.PurchaseCard) {
      setPurchases(data.PurchaseCard);
    }
  }, [data?.PurchaseCard]);

  const handleSuccess = (updatedOrNewPurchase: PurchaseItem) => {
    if (editingPurchase) {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === updatedOrNewPurchase.id ? updatedOrNewPurchase : p
        )
      );
    } else {
      setPurchases((prev) => [updatedOrNewPurchase, ...prev]);
    }
    setIsAdding(false);
    setEditingPurchase(null);
  };

  const handleDoubleTap = (item: PurchaseItem) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      setEditingPurchase(item);
      setIsAdding(true);
    } else {
      setLastTap(now);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Purchases</Text>
        {!isAdding && (
          <CustomButton
            text="＋ Add Purchase"
            onPress={() => {
              setEditingPurchase(null);
              setIsAdding(true);
            }}
            style={styles.smallButton}
          />
        )}
      </View>

      {/* ---- FORM (Shows for New or Edit) ---- */}
      {isAdding && (
        <PurchaseCardForm
          listId={data.id}
          orderDate={orderDate}
          supplier={supplier}
          initialData={editingPurchase}
          onCancel={() => {
            setIsAdding(false);
            setEditingPurchase(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* ---- LIST (Using map to avoid Nesting Error) ---- */}
      <View style={styles.listContainer}>
        {purchases.length > 0 ? (
          purchases.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleDoubleTap(item)}
            >
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.customerName}>
                    {item.supplier?.name || "Unknown Supplier"}
                  </Text>
                  <Text style={styles.amountText}>₹{item.amount.toLocaleString()}</Text>
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
                    {/* Ensure 'price' matches your API field name */}
                    <Text style={styles.detailValue}>{(item as any).price || (item as any).rate}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No purchases found. Double click to add/edit.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827" },
  smallButton: { paddingVertical: 6, paddingHorizontal: 12 },
  listContainer: { marginTop: 4 },
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
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 14 },
});