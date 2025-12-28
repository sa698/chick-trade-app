import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

interface SummeryProps {
  data: any[];
}

const Summery: React.FC<SummeryProps> = ({ data }) => {
  let customerWeight = 0;
  let supplierWeight = 0;
  let expanceAmount = 0;

  data?.forEach((item) => {
    if (item.title === "Sales" && item.card?.length) {
      item.card.forEach((c: any) => {
        if (c.weight) customerWeight += parseFloat(c.weight);
      });
    }
    if (item.title === "Purchase" && item.PurchaseCard?.length) {
      item.PurchaseCard.forEach((p: any) => {
        if (p.weight) supplierWeight += parseFloat(p.weight);
      });
    }
    if (item.title === "Expense" && item.ExpanceCard?.length) {
      item.ExpanceCard.forEach((e: any) => {
        if (e.amount) expanceAmount += parseFloat(e.amount);
      });
    }
  });

  const weightLoss = supplierWeight - customerWeight;

  return (
    <View style={styles.container}>
      {/* Sales */}
      <View style={[styles.card, { backgroundColor: "#f0fdf4" }]}>
        <View style={styles.headerLine}>
          <MaterialCommunityIcons name="scale-bathroom" size={12} color="#166534" />
          <Text style={[styles.label, { color: "#166534" }]} numberOfLines={1}>Sale</Text>
        </View>
        <Text style={[styles.value, { color: "#166534" }]} numberOfLines={1}>
          {customerWeight.toFixed(1)}k
        </Text>
      </View>

      {/* Purchase */}
      <View style={[styles.card, { backgroundColor: "#fef2f2" }]}>
        <View style={styles.headerLine}>
          <MaterialCommunityIcons name="truck-delivery" size={12} color="#991b1b" />
          <Text style={[styles.label, { color: "#991b1b" }]} numberOfLines={1}>Pur</Text>
        </View>
        <Text style={[styles.value, { color: "#991b1b" }]} numberOfLines={1}>
          {supplierWeight.toFixed(1)}k
        </Text>
      </View>

      {/* Weight Loss */}
      <View style={[styles.card, { backgroundColor: "#fffbeb" }]}>
        <View style={styles.headerLine}>
          <Ionicons name="trending-down" size={12} color="#92400e" />
          <Text style={[styles.label, { color: "#92400e" }]} numberOfLines={1}>Loss</Text>
        </View>
        <Text style={[styles.value, { color: "#92400e" }]} numberOfLines={1}>
          {weightLoss.toFixed(1)}k
        </Text>
      </View>

      {/* Expense */}
      <View style={[styles.card, { backgroundColor: "#eff6ff" }]}>
        <View style={styles.headerLine}>
          <FontAwesome5 name="money-bill-wave" size={10} color="#1e40af" />
          <Text style={[styles.label, { color: "#1e40af" }]} numberOfLines={1}>Exp</Text>
        </View>
        <Text style={[styles.value, { color: "#1e40af" }]} numberOfLines={1}>
          ₹{Math.round(expanceAmount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
    gap: 6, // Small gap between cards
    paddingHorizontal: 2,
  },
  card: {
    flex: 1, // This forces all cards to be the same width
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 13,
    fontWeight: "800",
  },
});

export default Summery;