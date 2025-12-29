import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { z } from "zod";
import { useAuth } from "@clerk/clerk-expo";
import CustomDatePicker from "@/components/CustomDatePicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomComboBox from "@/components/CustomComboBox";

/* ---------------- Types ---------------- */

interface Entry {
  id: string;
  date: string;
  description: string;
  amount: string;
  entryType: "DEBIT" | "CREDIT";
}

/* ---------------- Zod Schema ---------------- */

const statementSchema = z
  .object({
    from: z.date(),
    to: z.date(),
    customerId: z.string().min(1, "Please select a customer"),
  })
  .refine((data) => data.from <= data.to, {
    message: "From date must be before or equal to To date",
    path: ["to"],
  });

type StatementFormValues = z.infer<typeof statementSchema>;

/* ---------------- Constants ---------------- */

// const API_BASE =
//   Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";

const API_BASE = "https://chick-trade-15.vercel.app";
/* ---------------- Screen ---------------- */

export default function CustomerStatement() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const { getToken } = useAuth();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [opening, setOpening] = useState(0);
  const [openingType, setOpeningType] = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);

  const { control, handleSubmit } = useForm<StatementFormValues>({
    resolver: zodResolver(statementSchema),
    defaultValues: {
      from: new Date(),
      to: new Date(),
      customerId: "",
    },
  });

  const fetchCustomers = async () => {
    if (!organizationId) return;
    setLoadingCustomers(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/${organizationId}/customer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.map((c: any) => ({ label: c.name, value: c.id })));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchStatement = handleSubmit(async (data) => {
    if (!organizationId) return;
    setLoadingStatement(true);
    setError(null);

    try {
      const token = await getToken();
      const res = await axios.get(
        `${API_BASE}/api/${organizationId}/reports/customer-statement`,
        {
          params: {
            from: data.from.toISOString(),
            to: data.to.toISOString(),
            customerId: data.customerId,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEntries(res.data.entries);
      setOpening(res.data.opening_balance);
      setOpeningType(res.data.opening_type);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch statement");
    } finally {
      setLoadingStatement(false);
    }
  });

  /* ---------------- Balance Logic ---------------- */

  const balances = entries.reduce<number[]>((acc, entry) => {
    const prev = acc.length
      ? acc[acc.length - 1]
      : openingType === "DEBIT"
      ? opening
      : -opening;
    
    const currentVal = entry.entryType === "DEBIT" ? Number(entry.amount) : -Number(entry.amount);
    acc.push(prev + currentVal);
    return acc;
  }, []);

  /* ---------------- Sub-Components ---------------- */

  const TableHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, { flex: 0.4, fontWeight: "700" }]}>#</Text>
      <Text style={[styles.cell, { flex: 2, fontWeight: "700" }]}>Date/Desc</Text>
      <Text style={[styles.cellRight, { flex: 1, fontWeight: "700" }]}>Dr.</Text>
      <Text style={[styles.cellRight, { flex: 1, fontWeight: "700" }]}>Cr.</Text>
      <Text style={[styles.cellRight, { flex: 1.2, fontWeight: "700" }]}>Balance</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Ledger Statement</Text>

      {/* Filters */}
      <View style={styles.filterSection}>
        <CustomComboBox
          control={control}
          name="customerId"
          options={customers}
          placeholder={"Select Customer"}
          disabled={loadingCustomers}
        />
        <View style={styles.datePickerContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>From</Text>
            <CustomDatePicker control={control} name="from" placeholder="From" />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>To</Text>
            <CustomDatePicker control={control} name="to" placeholder="To" />
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.button, loadingStatement && styles.buttonDisabled]}
        onPress={fetchStatement}
        disabled={loadingStatement}
      >
        <Text style={styles.buttonText}>{loadingStatement ? "Processing..." : "Generate Statement"}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Opening Balance Row */}
      <TableHeader />
      <View style={[styles.row, { backgroundColor: "#F1F5F9" }]}>
        <Text style={[styles.cell, { flex: 2.4, fontStyle: "italic" }]}>Opening Balance</Text>
        <Text style={[styles.cellRight, { flex: 1 }]}></Text>
        <Text style={[styles.cellRight, { flex: 1 }]}></Text>
        <Text style={[styles.cellRight, { flex: 1.2, fontWeight: "700" }]}>
          ₹{opening.toFixed(2)} {openingType === "DEBIT" ? "Dr" : "Cr"}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isDebit = item.entryType === "DEBIT";
          const bal = balances[index];
          return (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 0.4, color: "#94A3B8" }]}>{index + 1}</Text>
              <View style={{ flex: 2 }}>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.descText} numberOfLines={1}>{item.description}</Text>
              </View>
              <Text style={[styles.cellRight, { flex: 1, color: "#059669" }]}>
                {isDebit ? `₹${Number(item.amount).toFixed(2)}` : "-"}
              </Text>
              <Text style={[styles.cellRight, { flex: 1, color: "#DC2626" }]}>
                {!isDebit ? `₹${Number(item.amount).toFixed(2)}` : "-"}
              </Text>
              <Text style={[styles.cellRight, { flex: 1.2, fontWeight: "600" }]}>
                ₹{Math.abs(bal).toFixed(2)} {bal >= 0 ? "Dr" : "Cr"}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          !loadingStatement ? <Text style={styles.empty}>No transaction history found</Text> : <ActivityIndicator style={{marginTop: 20}} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#1E293B" },
  filterSection: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 4 },
  datePickerContainer: { flexDirection: "row", marginTop: 10 },
  button: { backgroundColor: "#2563EB", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#DC2626", textAlign: "center", marginBottom: 10 },
  headerRow: { backgroundColor: "#E2E8F0", borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomWidth: 0 },
  row: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFF", alignItems: "center" },
  cell: { fontSize: 12, color: "#334155" },
  cellRight: { fontSize: 12, textAlign: "right", color: "#334155" },
  dateText: { fontSize: 11, fontWeight: "700", color: "#1E293B" },
  descText: { fontSize: 11, color: "#64748B" },
  empty: { textAlign: "center", marginTop: 40, color: "#94A3B8" },
});