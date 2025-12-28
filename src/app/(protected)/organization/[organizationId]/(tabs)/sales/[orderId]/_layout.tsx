import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Slot, Redirect, useLocalSearchParams, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function OrderIdLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  
  // Get the date from the URL parameters
  const { date } = useLocalSearchParams<{ date?: string }>();

  // Format the date for the header title
  const displayDate = date 
    ? new Date(date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) 
    : "Order Details";

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
      {/* Stack.Screen allows us to configure the 
          Native Header provided by Expo Router 
      */}
      <Stack.Screen
        options={{ 
          title: displayDate, // Sets the Header Name as the Order Date
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 18,
            color: "#1e293b",
          },
          headerShadowVisible: false, // Cleaner, modern look
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => Alert.alert("Options", "What would you like to do?")}
              style={styles.optionButton}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#4f46e5" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Page content */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  content: { 
    flex: 1 
  },
  optionButton: {
    padding: 8,
    marginRight: -8, // Aligns better with the edge of the screen
  },
});