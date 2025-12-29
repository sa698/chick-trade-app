import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const TILE_SIZE = width / 3 - 20;

const REPORTS = [
  { title: "Customer Outstanding", icon: "wallet-outline", path: "customer-outstanding" },
  { title: "Supplier Outstanding", icon: "card-outline", path: "supplier-outstanding" },
  { title: "Customer Statement", icon: "wallet-outline", path: "customer-statement" },
  { title: "Receipt Voucher", icon: "receipt-outline", path: "receipt-voucher" },
  { title: "Payment Voucher", icon: "cash-outline", path: "payment-voucher" },
  { title: "Sales Report", icon: "stats-chart-outline", path: "sales" },
  { title: "Purchase Report", icon: "bag-outline", path: "purchase" },
  { title: "Day Book", icon: "calendar-outline", path: "day-book" },
  { title: "Ledger", icon: "book-outline", path: "ledger" },
  { title: "Cash Book", icon: "cash-outline", path: "cash-book" },
  { title: "Bank Book", icon: "card-outline", path: "bank-book" },
  { title: "Stock Summary", icon: "layers-outline", path: "stock-summary" },
  { title: "Item Wise Stock", icon: "cube-outline", path: "item-stock" },
  { title: "Profit & Loss", icon: "trending-up-outline", path: "profit-loss" },
  { title: "Balance Sheet", icon: "pie-chart-outline", path: "balance-sheet" },
  { title: "GST Report", icon: "document-text-outline", path: "gst" },
];

export default function PaymentsHome() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <View style={styles.container}>
      {REPORTS.map((item) => (
        <ReportTile
          key={item.path}
          title={item.title}
          icon={item.icon as any}
          onPress={() =>
            router.push(
              `/organization/${organizationId}/reports/${item.path}`
            )
          }
        />
      ))}
    </View>
  );
}

/* ---------------- Small Tile ---------------- */
function ReportTile({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Ionicons name={icon} size={26} color="#2563EB" />
      <Text numberOfLines={2} style={styles.tileText}>
        {title}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,

    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  tileText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
});
