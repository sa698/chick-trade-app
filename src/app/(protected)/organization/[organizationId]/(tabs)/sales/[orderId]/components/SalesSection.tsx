import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SalesForm from "./SalesForm";
import CustomButton from "@/components/CustomButtom";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
interface Customer {
  id: string;
  name: string;
}
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

export default function SalesSection({
  orderDate,
  customer,
  data,
}: SectionProps) {
  const [sales, setSales] = useState<Sale[]>(data.card || []);
  const [addingSales, setAddingSales] = useState(false);

  // State for Double Tap & Editing
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  // Keep state in sync with data prop updates
  useEffect(() => {
    if (data.card) setSales(data.card);
  }, [data.card]);

  const handleSuccess = (updatedOrNewSale: Sale) => {
    if (editingSale) {
      // Update existing item in local state
      setSales((prev) =>
        prev.map((s) => (s.id === updatedOrNewSale.id ? updatedOrNewSale : s))
      );
    } else {
      // Add new item to the top of the list
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
  const totals = useMemo(() => {
    return sales.reduce(
      (acc, item) => ({
        boxes: acc.boxes + (Number(item.box) || 0),
        weight: acc.weight + (Number(item.weight) || 0),
        amount: acc.amount + (Number(item.amount) || 0),
        paid: acc.paid + (Number(item.paid) || 0),
      }),
      { boxes: 0, weight: 0, amount: 0, paid: 0 }
    );
  }, [sales]);
  return (
    <View style={styles.container}>
      {/* Header with Title and Add Button */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{data.title}</Text>
        {!addingSales && (
          <CustomButton
            text="＋Add Sale"
            variant="danger"
            onPress={() => {
              setEditingSale(null);
              setAddingSales(true);
            }}
            style={styles.smallButton}
          />
        )}
      </View>

      {/* Conditional Form Rendering (New or Edit) */}
      {addingSales && (
        <SalesForm
          listId={data.id}
          orderDate={orderDate}
          customer={customer}
          initialData={editingSale}
          onCancel={() => {
            setAddingSales(false);
            setEditingSale(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* FIX: Replaced FlatList with map to solve the 
        "VirtualizedLists should never be nested" error.
      */}

      <View style={styles.listContainer}>
        {sales.length > 0 ? (
          sales.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleDoubleTap(item)}
            >
              <View style={styles.card}>
                {/* LINE 1: Name and Total Amount */}
                <View style={styles.mainRow}>
                  <Text style={styles.customerName} numberOfLines={1}>
                    {item.customer?.name}
                  </Text>
                  <Text style={styles.amountText}>
                    ₹{item.amount.toLocaleString()}
                  </Text>
                </View>

                {/* LINE 2: The Math (Box - Weight x Rate) */}
                <View style={styles.subRow}>
                  <View style={styles.mathContainer}>
                    <Text style={styles.mathText}>
                      {item.box} <Text style={styles.mathLabel}>Box</Text> •
                      {item.weight} <Text style={styles.mathLabel}>kg</Text> ×
                      {item.price}
                    </Text>
                  </View>

                  {/* Right side: Paid Badge (if exists) */}
                  {item.paid !== undefined && item.paid > 0 && (
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>Paid ₹{item.paid}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No sales recorded. Double click an item to edit.
            </Text>
          </View>
        )}
      </View>
      {sales.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryStat}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={18}
                color="#64748b"
              />
              <View>
                <Text style={styles.statLabel}>Qty</Text>
                <Text style={styles.statValue}>
                  ({totals.boxes}) {totals.weight.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryStat}>
              <Ionicons name="cash-outline" size={18} color="#059669" />
              <View>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={[styles.statValue, { color: "#059669" }]}>
                  ₹{totals.amount.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryStat}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={18}
                color="#16a34a"
              />
              <View>
                <Text style={styles.statLabel}>Paid</Text>
                <Text style={[styles.statValue, { color: "#16a34a" }]}>
                  ₹{totals.paid.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  heading: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  smallButton: { paddingVertical: 5, paddingHorizontal: 10,     },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8, // Reduced margin
    borderWidth: 1,
    borderColor: "#f1f5f9",
    // Subtler shadow
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
    marginRight: 10,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#059669",
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mathContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mathText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  mathLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "lowercase",
  },
  paidBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  paidText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
   
  },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 14 },
  summaryGrid: { flexDirection: "row", alignItems: "center" ,},
  summaryStat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 5,
  },
});
