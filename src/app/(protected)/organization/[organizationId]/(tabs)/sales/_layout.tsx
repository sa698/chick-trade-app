import { Stack } from "expo-router";

export default function PaymentsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Sales" }} />
      {/* <Stack.Screen name="payment-voucher" options={{ title: "Payment Voucher" }} />
      <Stack.Screen name="receipt-voucher" options={{ title: "Receipt Voucher" }} />
      <Stack.Screen name="petty-cash" options={{ title: "Petty Cash" }} /> */}
    </Stack>
  );
}
