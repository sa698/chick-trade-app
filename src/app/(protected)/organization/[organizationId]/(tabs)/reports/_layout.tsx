import { Stack } from "expo-router";

export default function PaymentsLayout() {
  return (
    <Stack>
      {/* <Stack.Screen name="index" options={{ title: "Reports" }} /> */}
      <Stack.Screen name="outstanding" options={{ title: "Outstanding" }} />
    </Stack>
  );
}
