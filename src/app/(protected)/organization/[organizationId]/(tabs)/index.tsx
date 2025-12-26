import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function OrganizationHome() {
  const { organizationId } = useLocalSearchParams();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in"); // go back to sign in
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        Organization Dashboard
      </Text>

      <Text>ID: {organizationId}</Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 20,
          paddingVertical: 12,
          paddingHorizontal: 24,
          backgroundColor: "#EF4444",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
