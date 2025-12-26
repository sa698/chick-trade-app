import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <View>
      <Text>Profile</Text>

      <TouchableOpacity onPress={handleSignOut}>
        <Text style={{ color: "red" }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
