import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ExpanceCardForm from "./ExpanceCardForm";
 

interface ExpenseSectionProps {
  orderId: string;
  orderDate: string;
  expance: any[]; // Master list of expense types
  data: any[];    // Current expense entries
}

export default function ExpenseSection({
  orderId,
  orderDate,
  expance,
  data: initialData,
}: ExpenseSectionProps) {
  const [entries, setEntries] = useState(initialData || []);
  const [isEditing, setIsEditing] = useState(false);

  const handleSuccess = (newEntry: any) => {
    setEntries((prev) => [newEntry, ...prev]);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {/* -------- FORM -------- */}
      {/* <ExpanceCardForm
        orderId={orderId}
        orderDate={orderDate}
        expanceMaster={expance}
        isEditing={isEditing}
        enableEditing={() => setIsEditing(true)}
        disableEditing={() => setIsEditing(false)}
        onSuccess={handleSuccess}
      /> */}

      {/* -------- LIST -------- */}
      <View style={styles.listContainer}>
        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded for this order.</Text>
          </View>
        ) : (
          entries.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.expanceName || "Other Expense"}</Text>
                <Text style={styles.amount}>₹ {item.amount}</Text>
              </View>
              {item.desc ? <Text style={styles.desc}>{item.desc}</Text> : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 20 },
  listContainer: { marginTop: 8 },
  emptyContainer: {
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyText: { textAlign: "center", color: "#9ca3af", fontSize: 14 },
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
    alignItems: "center",
  },
  title: { fontWeight: "700", fontSize: 16, color: "#1f2937" },
  amount: { fontWeight: "700", color: "#dc2626", fontSize: 16 }, // Red for expenses
  desc: { marginTop: 6, fontSize: 13, color: "#6b7280", fontStyle: "italic" },
});