import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import ExpanceCardForm from "./ExpanceCardForm";

interface ExpanceCategory {
  id: string;
  name: string;
}

interface ExpenseItem {
  id: string;
  expance: ExpanceCategory; // Matches the relation name from your Backend include
  amount: number;
  desc?: string;
  listId: string;
  orderDate: string;
}

interface ExpenseSectionProps {
  orderDate: string;
  expance: ExpanceCategory[]; // List of categories for the dropdown
  data: any;
}

export default function ExpenseSection({
  orderDate,
  expance,
  data,
}: ExpenseSectionProps) {
  // 1. Local list state - matching the key from your API response
  const [expenses, setExpenses] = useState<ExpenseItem[]>(data.ExpanceCard || []);
  const [isAdding, setIsAdding] = useState(false);

  // State for Double Tap & Editing
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  // Sync state if global data updates (e.g., after pull-to-refresh)
  useEffect(() => {
    if (data?.ExpanceCard) {
      setExpenses(data.ExpanceCard);
    }
  }, [data?.ExpanceCard]);

  const handleSuccess = (updatedOrNewExpense: ExpenseItem) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === updatedOrNewExpense.id ? updatedOrNewExpense : e
        )
      );
    } else {
      setExpenses((prev) => [updatedOrNewExpense, ...prev]);
    }
    setIsAdding(false);
    setEditingExpense(null);
  };

  const handleDoubleTap = (item: ExpenseItem) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      setEditingExpense(item);
      setIsAdding(true);
    } else {
      setLastTap(now);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Expenses</Text>
        {!isAdding && (
          <CustomButton
            text="＋ Add Expense"
            onPress={() => {
              setEditingExpense(null);
              setIsAdding(true);
            }}
            style={styles.smallButton}
          />
        )}
      </View>

      {/* ---- FORM (Shows for New or Edit) ---- */}
      {isAdding && (
        <ExpanceCardForm
          listId={data.id}
          orderDate={orderDate}
          expance={expance}
          initialData={editingExpense}
          onCancel={() => {
            setIsAdding(false);
            setEditingExpense(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* ---- LIST (Using map to avoid Nesting Error) ---- */}
      <View style={styles.listContainer}>
        {expenses.length > 0 ? (
          expenses.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleDoubleTap(item)}
            >
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.categoryName}>
                      {item.expance?.name || "General Expense"}
                    </Text>
                    {item.desc ? (
                      <Text style={styles.descText}>{item.desc}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.amountText}>₹{item.amount.toLocaleString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded. Double click an item to edit.</Text>
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
    alignItems: "flex-start",
  },
  categoryName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  descText: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  amountText: { fontSize: 16, fontWeight: "700", color: "#dc2626" }, // Red for expenses
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 14, textAlign: 'center' },
});