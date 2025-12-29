import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  order: any;
  isAdmin?: boolean;
}

export default function OrderSummarySheet({ order, isAdmin = true }: Props) {
  const [visible, setVisible] = useState(false);

  if (!order) return null;

  // ---- Extract Lists ----
  const salesList = order.lists?.find((l: any) => l.title === "Sales");
  const purchaseList = order.lists?.find((l: any) => l.title === "Purchase");
  const expenseList = order.lists?.find((l: any) => l.title === "Expense");

  const salesCards = salesList?.card ?? [];
  const purchaseCards = purchaseList?.PurchaseCard ?? [];
  const expenseCards = expenseList?.ExpanceCard ?? [];

  // ---- Calculations ----
  const totalSalesWeight = salesCards.reduce(
    (s: number, c: any) => s + Number(c.weight || 0),
    0
  );

  const totalSalesAmount = salesCards.reduce(
    (s: number, c: any) => s + Number(c.amount || 0),
    0
  );

  const totalPaid = salesCards.reduce(
    (s: number, c: any) => s + Number(c.paid || 0),
    0
  );

  const totalPurchaseWeight = purchaseCards.reduce(
    (s: number, c: any) => s + Number(c.weight || 0),
    0
  );

  const totalPurchaseAmount = purchaseCards.reduce(
    (s: number, c: any) => s + Number(c.amount || 0),
    0
  );

  const totalExpenseAmount = expenseCards.reduce(
    (s: number, c: any) => s + Number(c.amount || 0),
    0
  );

  const weightDiff = totalSalesWeight - totalPurchaseWeight;
  const profit =
    totalSalesAmount - totalPurchaseAmount - totalExpenseAmount;

  const orderDate = new Date(order.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const Card = ({ children }: any) => (
  <View style={styles.card}>{children}</View>
);

const Info = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#4f46e5" />
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ left, right, sub }: any) => (
  <View style={styles.row}>
    <View>
      <Text>{left}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
    <Text>{right}</Text>
  </View>
);

const Total = ({ label, value }: any) => (
  <View style={styles.total}>
    <Text style={{ fontWeight: "600" }}>{label}</Text>
    <Text style={{ fontWeight: "700" }}>₹ {value}</Text>
  </View>
);

const Metric = ({ label, value }: any) => (
  <View style={styles.metric}>
    <Text>{label}</Text>
    <Text style={{ fontWeight: "600" }}>{value}</Text>
  </View>
);

const Profit = ({ value }: any) => (
  <View style={styles.profit}>
    <Text style={styles.profitText}>Net Profit</Text>
    <Text
      style={[
        styles.profitValue,
        { color: value >= 0 ? "#16a34a" : "#dc2626" },
      ]}
    >
      ₹ {value}
    </Text>
  </View>
);

  // ---- UI ----
  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="stats-chart-outline" size={18} color="#fff" />
        <Text style={styles.triggerText}>Summary</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Order Summary</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Order Info */}
              <Card>
                <Info icon="calendar" label="Date" value={orderDate} />
                <Info
                  icon="cube"
                  label="Product"
                  value={order.product?.name}
                />
                <Info
                  icon="car"
                  label="Vehicle"
                  value={order.vehicle?.name}
                />
              </Card>

              {/* Sales */}
              <Section title="Sales">
                {salesCards.map((c: any, i: number) => (
                  <Row
                    key={c.id}
                    left={`${i + 1}. ${c.customer?.name}`}
                    right={`₹ ${c.amount}`}
                    sub={`${c.weight} Kg | Paid ₹${c.paid}`}
                  />
                ))}
                <Total label="Total Sales" value={totalSalesAmount} />
              </Section>

              {/* Purchase */}
              {isAdmin && (
                <Section title="Purchase">
                  {purchaseCards.map((c: any, i: number) => (
                    <Row
                      key={c.id}
                      left={`${i + 1}. ${c.supplier?.name}`}
                      right={`₹ ${c.amount}`}
                      sub={`${c.weight} Kg`}
                    />
                  ))}
                  <Total
                    label="Total Purchase"
                    value={totalPurchaseAmount}
                  />
                </Section>
              )}

              {/* Financial Summary */}
              {isAdmin && (
                <Section title="Summary">
                  <Metric label="Sales Weight" value={`${totalSalesWeight} Kg`} />
                  <Metric
                    label="Purchase Weight"
                    value={`${totalPurchaseWeight} Kg`}
                  />
                  <Metric
                    label="Weight Difference"
                    value={`${weightDiff} Kg`}
                  />
                  <Metric label="Paid" value={`₹ ${totalPaid}`} />
                  <Metric
                    label="Expenses"
                    value={`₹ ${totalExpenseAmount}`}
                  />

                  <Profit value={profit} />
                </Section>
              )}

              <Text style={styles.footer}>
                Generated on {new Date().toLocaleString("en-IN")}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    backgroundColor: "#a15b19ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  triggerText: { color: "#fff", fontWeight: "600" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },

  card: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  infoRow: { flexDirection: "row", gap: 8 },
  label: { fontSize: 12, color: "#555" },
  value: { fontWeight: "600" },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sub: { fontSize: 11, color: "#666" },

  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },

  metric: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  profit: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  profitText: { fontSize: 14, color: "#555" },
  profitValue: { fontSize: 20, fontWeight: "800" },

  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#777",
    marginVertical: 14,
  },
});
