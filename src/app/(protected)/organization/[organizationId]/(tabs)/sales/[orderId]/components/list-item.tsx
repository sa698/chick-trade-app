// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import DraggableFlatList from "react-native-draggable-flatlist";
// import { Package, Weight, IndianRupee } from "lucide-react-native";

// import CardItem from "./CardItem";
// import CardExpanceItem from "./CardExpanceItem";
// import CardForm from "./CardForm";
// import PurchaseCardForm from "./PurchaseCardForm";
// import ExpanceCardForm from "./ExpanceCardForm";

// interface ListItemProps {
//   data: any;
//   orderDate: string;
//   customer: any[];
//   supplier: any[];
//   expance: any[];
//   onLongPress?: () => void; // list drag handler
// }

// export default function ListItem({
//   data,
//   orderDate,
//   customer,
//   supplier,
//   expance,
//   onLongPress,
// }: ListItemProps) {
//   const [isEditing, setIsEditing] = useState(false);

//   const salesTotal = data?.card?.reduce(
//     (acc: any, item: any) => ({
//       box: acc.box + (item.box || 0),
//       weight: acc.weight + Number(item.weight || 0),
//       paid: acc.paid + Number(item.paid || 0),
//       amount: acc.amount + Number(item.amount || 0),
//     }),
//     { box: 0, weight: 0, paid: 0, amount: 0 }
//   );

//   const purchaseTotal = data?.PurchaseCard?.reduce(
//     (acc: any, item: any) => ({
//       box: acc.box + (item.box || 0),
//       weight: acc.weight + Number(item.weight || 0),
//     }),
//     { box: 0, weight: 0 }
//   );

//   const expenseTotal = data?.ExpanceCard?.reduce(
//     (acc: number, item: any) => acc + Number(item.amount || 0),
//     0
//   );

//   return (
//     <TouchableOpacity
//       onLongPress={onLongPress}
//       activeOpacity={0.9}
//       style={[
//         styles.container,
//         data.title === "Sales" && styles.sales,
//         data.title === "Purchase" && styles.purchase,
//         data.title === "Expense" && styles.expense,
//       ]}
//     >
//       {/* HEADER */}
//       <Text style={styles.header}>{data.title}</Text>

//       {/* SALES */}
//       {data.title === "Sales" && (
//         <DraggableFlatList
//           data={data.card || []}
//           keyExtractor={(item) => item.id}
//           onDragEnd={({ data }) => (data.card = data)}
//           renderItem={({ item, drag }) => (
//             <CardItem
//               data={item}
//               customer={customer}
//               orderDate={orderDate}
//               onLongPress={drag}
//             />
//           )}
//         />
//       )}

//       {/* PURCHASE */}
//       {data.title === "Purchase" && (
//         <DraggableFlatList
//           data={data.PurchaseCard || []}
//           keyExtractor={(item) => item.id}
//           onDragEnd={({ data }) => (data.PurchaseCard = data)}
//           renderItem={({ item, drag }) => (
//             <CardItem
//               data={item}
//               supplier={supplier}
//               orderDate={orderDate}
//               onLongPress={drag}
//             />
//           )}
//         />
//       )}

//       {/* EXPENSE */}
//       {data.title === "Expense" && (
//         <DraggableFlatList
//           data={data.ExpanceCard || []}
//           keyExtractor={(item) => item.id}
//           onDragEnd={({ data }) => (data.ExpanceCard = data)}
//           renderItem={({ item, drag }) => (
//             <CardExpanceItem
//               data={item}
//               expance={expance}
//               orderDate={orderDate}
//               onLongPress={drag}
//             />
//           )}
//         />
//       )}

//       {/* FOOTER TOTALS */}
//       {data.title === "Sales" && (
//         <View style={styles.footer}>
//           <Text>📦 {salesTotal.box}</Text>
//           <Text>⚖ {salesTotal.weight.toFixed(2)}kg</Text>
//           <Text>₹ Paid: {salesTotal.paid}</Text>
//           <Text>₹ Amount: {salesTotal.amount}</Text>
//         </View>
//       )}

//       {data.title === "Purchase" && (
//         <View style={styles.footer}>
//           <Text>📦 {purchaseTotal.box}</Text>
//           <Text>⚖ {purchaseTotal.weight.toFixed(2)}kg</Text>
//         </View>
//       )}

//       {data.title === "Expense" && (
//         <View style={styles.footer}>
//           <Text>₹ {expenseTotal}</Text>
//         </View>
//       )}

//       {/* FORMS */}
//       {data.title === "Sales" && (
//         <CardForm
//           orderDate={orderDate}
//           customer={customer}
//           listId={data.id}
//           isEditing={isEditing}
//           setIsEditing={setIsEditing}
//         />
//       )}

//       {data.title === "Purchase" && (
//         <PurchaseCardForm
//           orderDate={orderDate}
//           supplier={supplier}
//           listId={data.id}
//           isEditing={isEditing}
//           setIsEditing={setIsEditing}
//         />
//       )}

//       {data.title === "Expense" && (
//         <ExpanceCardForm
//           orderDate={orderDate}
//           expance={expance}
//           listId={data.id}
//           isEditing={isEditing}
//           setIsEditing={setIsEditing}
//         />
//       )}
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 12,
//     padding: 10,
//     marginBottom: 12,
//   },
//   header: {
//     fontWeight: "700",
//     fontSize: 14,
//     marginBottom: 6,
//   },
//   footer: {
//     marginTop: 8,
//     gap: 4,
//   },
//   sales: { backgroundColor: "#eef2ff" },
//   purchase: { backgroundColor: "#ecfdf5" },
//   expense: { backgroundColor: "#fef2f2" },
// });
