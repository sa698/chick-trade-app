import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_SIZE = width / 2 - 24;

export default function PaymentsHome() {
  const { organizationId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <PaymentCard
        title="Payment Voucher"
        icon="wallet-outline"
        onPress={() =>
          router.push(
            `/organization/${organizationId}/payments/payment-voucher`
          )
        }
      />

      <PaymentCard
        title="Receipt Voucher"
        icon="receipt-outline"
        onPress={() =>
          router.push(
            `/organization/${organizationId}/payments/receipt-voucher`
          )
        }
      />

      <PaymentCard
        title="Petty Cash"
        icon="cash-outline"
        onPress={() =>
          router.push(
            `/organization/${organizationId}/payments/petty-cash`
          )
        }
      />
    </View>
  );
}

/* ---------------- Card Component ---------------- */
function PaymentCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={42} color="#2563EB" />
      <Text style={styles.cardText}>{title}</Text>
    </Pressable>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,

    // Android shadow
    elevation: 6,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
});
