 
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function ProtectedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
