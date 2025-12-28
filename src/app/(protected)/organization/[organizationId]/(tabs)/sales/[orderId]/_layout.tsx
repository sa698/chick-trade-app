import { View, StyleSheet } from "react-native";
import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { BordNabar } from "./components/bord-navbar";

export default function OrderIdLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // ⛔ Wait for Clerk
  if (!isLoaded) return null;

  // 🔐 Auth guard (OK in layout)
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
      {/* Shared UI */}
      {/* <BordNabar /> */}

      {/* Page content */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
