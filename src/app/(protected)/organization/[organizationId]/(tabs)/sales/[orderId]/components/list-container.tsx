import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";

import SalesSection from "./SalesSection";
import PurchaseSection from "./PurchaseSection";
import ExpenseSection from "./ExpenseSection";
import Summery from "./summery";

/* Enable LayoutAnimation for Android */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = "Sales" | "Purchase" | "Expense";

interface ListContainerProps {
  data: any[];
  orderId: string;
  orderDate: string;
  customer: any[];
  supplier: any[];
  expance: any[]; // Changed from expance
}

export default function ListContainer({
  data,
  orderId,
  orderDate,
  customer,
  supplier,
  expance,
}: ListContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Sales");
  const [expanded, setExpanded] = useState(true);

  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  // Option 1: Exact Match (Fastest)
  // returns the object {id: "...", title: "Sales", ...}
  const salesData = useMemo(
    () => data.find((d) => d.title === "Sales"),
    [data]
  );

  // returns the object {id: "...", title: "Purchase", ...}
  const purchaseData = useMemo(
    () => data.find((d) => d.title === "Purchase"),
    [data]
  );

  // returns the object {id: "...", title: "Expense", ...}
  const expenseData = useMemo(
    () => data.find((d) => d.title === "Expense"),
    [data]
  );
  // Option 2: Case-Insensitive (Safest if API changes)

  const toggleExpand = () => {
    // Customizing the animation for a smoother experience
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    setExpanded((prev) => !prev);
  };

  // Helper to render current section
  const renderContent = () => {
    if (!expanded) return null;

    switch (activeTab) {
      case "Sales":
        return (
          <SalesSection
            orderId={orderId}
            orderDate={orderDate}
            customer={customer}
            data={salesData}
          />
        );
      case "Purchase":
        return (
          <PurchaseSection
            orderId={orderId}
            orderDate={orderDate}
            supplier={supplier}
            data={purchaseData}
          />
        );
      case "Expense":
        return (
          <ExpenseSection
            // orderId={orderId}
            orderDate={orderDate}
            expance={expance}
            data={expenseData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* ---------- TABS ---------- */}
      <View style={styles.tabs}>
        {(["Sales", "Purchase", "Expense"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          {/* Using a text symbol is fine, but Lucide-react-native Chevron is better if available */}
          <Text style={styles.expandText}>{expanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- CONTENT CONTAINER ---------- */}
      <View style={styles.contentWrapper}>{renderContent()}</View>
      {/* ---------- SUMMERY SECTION (AT BOTTOM) ---------- */}
      <View style={styles.footerContainer}>
        <Summery data={data} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f9fafb",
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#111827",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  activeTabText: {
    color: "#ffffff",
  },
  expandButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  expandText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },

  contentWrapper: {
    overflow: "hidden",
    flexGrow: 1, // Allows content to grow, but keeps footer at bottom
  },
  footerContainer: {
    marginTop: "auto", // Pushes the summary to the very bottom of the parent view
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
});
