import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

// import { CardFormUpdate } from "./card-form-update";
// import { PurchaseCardFormUpdate } from "./purchase-card-form-update";
// import { ExpanceCardFormUpdate } from "./expance-card-form-update";

import {
  CustomerSelect,
  SupplierSelect,
  ExpanceSelect,
} from "./list-container";

interface CardItemProps {
  data: any;
  index: number;
  customer?: CustomerSelect[];
  supplier?: SupplierSelect[];
  expance?: ExpanceSelect[];
  type: "Sales" | "Purchase" | "Expense";
  orderDate: string;
}

export const CardItem = ({
  data,
  customer,
  supplier,
  expance,
  type,
  orderDate,
}: CardItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* CARD */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(false)}
        onLongPress={() => setOpen(true)}
        style={styles.card}
      >
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {data.customer?.name || data.supplier?.name}
          </Text>

          <Text style={styles.qty}>
            {data.box} ({Number(data.weight).toFixed(2)}kg)
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.muted}>
            Paid: ₹{Number(data.paid || 0).toLocaleString()}
          </Text>
          <Text style={styles.muted}>
            Amount: ₹{Number(data.amount || 0).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* EDIT FORM */}
      {/* {open && (
        <View style={styles.formWrapper}>
          {type === "Sales" && (
            <CardFormUpdate
              cardData={data}
              orderDate={orderDate}
              customer={customer || []}
              setOpen={setOpen}
            />
          )}

          {type === "Purchase" && (
            <PurchaseCardFormUpdate
              cardData={data}
              orderDate={orderDate}
              supplier={supplier || []}
              setOpen={setOpen}
            />
          )}

          {type === "Expense" && (
            <ExpanceCardFormUpdate
              cardData={data}
              orderDate={orderDate}
              expance={expance || []}
              setOpen={setOpen}
            />
          )}
        </View>
      )} */}
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "70%",
  },
  qty: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  muted: {
    fontSize: 12,
    color: "#666",
  },
  formWrapper: {
    marginTop: 6,
  },
});
