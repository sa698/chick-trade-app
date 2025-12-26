// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   StyleSheet,
// } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import { useEffect, useState } from "react";
// import axios from "axios";

// interface Order {
//   id: string;
//   date: string;
//   product: { id: string; name: string };
//   vehicle: { id: string; name: string };
// }

// export default function OrdersScreen() {
//   const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [error, setError] = useState<string | null>(null);
//   const [totalOrders, setTotalOrders] = useState(0);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get(
//         `${process.env.EXPO_PUBLIC_API_URL}/api/orders`,
//         {
//           params: {
//             organizationId,
//             page,
//           },
//         }
//       );

//       setOrders(res.data.orders);
//       setTotalOrders(res.data.totalOrders);
//     } catch (e) {
//       setError("Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [page]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>{error}</Text>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={orders}
//       keyExtractor={(item) => item.id}
//       refreshControl={
//         <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
//       }
//       contentContainerStyle={styles.listContainer}
//       renderItem={({ item }) => (
//         <View style={styles.card}>
//           <Text style={styles.productName}>{item.product.name}</Text>
//           <Text style={styles.vehicleName}>{item.vehicle.name}</Text>
//         </View>
//       )}
//       ListEmptyComponent={
//         <Text style={styles.emptyText}>No orders found</Text>
//       }
//     />
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorText: {
//     color: "#dc2626", // red-600
//     fontSize: 16,
//   },
//   listContainer: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 12,
//     // iOS shadow
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     // Android shadow
//     elevation: 3,
//   },
//   productName: {
//     fontWeight: "600",
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   vehicleName: {
//     color: "#6b7280", // gray-500
//     fontSize: 14,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280", // gray-500
//     marginTop: 40,
//     fontSize: 16,
//   },
// });
