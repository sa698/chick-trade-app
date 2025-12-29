// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useForm, Controller, SubmitHandler } from "react-hook-form";
// import { useAuth } from "@clerk/clerk-expo";
// import axios from "axios";
// import CustomComboBox from "@/components/CustomComboBox";
// import CustomInput from "@/components/CustomInput";
// import { useLocalSearchParams } from "expo-router";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import CustomButton from "@/components/CustomButtom";

// interface Customer {
//   id: string;
//   name: string;
// }

// interface SalesFormProps {
//   listId: string;
//   orderDate: string;
//   customer: Customer[];
//   onCancel: () => void;
//   onSuccess: (newSale: any) => void;
// }

// // 1. Define the Schema with strict number coercion
// const salesFormSchema = z.object({
//   customerId: z.string().min(1, "Customer is required"),
//   listId: z.string(),
//   orderDate: z.string(),
//   box: z.coerce.number().min(1, "Box count required"),
//   price: z.coerce.number().min(1, "Rate is required"),
//   weight: z.coerce.number().min(0.01, "Weight is required"),
//   amount: z.number(),
//   paid: z.coerce.number().min(0).optional().default(0),
// });

// // 2. Derive the Output type (what is sent to the API)
// type SalesFormValues = z.output<typeof salesFormSchema>;

// const API_BASE = "https://chick-trade-15.vercel.app";

// export default function SalesForm({
//   listId,
//   orderDate,
//   customer,
//   onCancel,
//   onSuccess,
// }: SalesFormProps) {
//   const { getToken } = useAuth();
//   const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
//   const [loading, setLoading] = useState(false);

//   // 3. Setup useForm with the derived type
//   const {
//     control,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<SalesFormValues>({
//     resolver: zodResolver(salesFormSchema) as any, // Cast as any to resolve the Resolver type mismatch
//     mode: "onTouched",
//     defaultValues: {
//       customerId: "",
//       listId: listId,
//       orderDate: orderDate,
//       price: "" as any, // Empty string allows the "Required" validation to trigger
//       box: 1,
//       weight: "" as any,
//       amount: 0,
//       paid: 0,
//     },
//   });

//   const price = watch("price");
//   const weight = watch("weight");

//   // 4. Handle Auto-Calculation
//   useEffect(() => {
//     const p = Number(price) || 0;
//     const w = Number(weight) || 0;
//     const calculatedAmount = Number((p * w).toFixed(2));

//     setValue("amount", calculatedAmount, {
//       shouldValidate: true,
//     });
//   }, [price, weight, setValue]);

//   // 5. Submit Handler
//   const onSubmit: SubmitHandler<SalesFormValues> = async (data) => {
//     if (!organizationId) {
//       Alert.alert("Error", "Organization context missing");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await getToken();

//       const res = await axios.post(
//         `${API_BASE}/api/${organizationId}/card`,
//         data,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       onSuccess(res.data);
//       console.log("Sale added successfully");
//     } catch (err: any) {
//       const errorMsg = err.response?.data || err.message;
//       console.error("Submission Error:", errorMsg);
//       Alert.alert(
//         "Error",
//         typeof errorMsg === "string" ? errorMsg : "Check your server logs"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Customer</Text>
//       <CustomComboBox
//         control={control}
//         name="customerId"
//         options={customer.map((c) => ({ label: c.name, value: c.id }))}
//         placeholder="Select Customer"
//       />

//       {/* Hidden system fields */}
//       <Controller control={control} name="listId" render={() => <></>} />
//       <Controller control={control} name="orderDate" render={() => <></>} />

//       <View style={styles.row}>
//         <View style={styles.rowItem}>
//           <Text style={styles.label}>Box</Text>
//           <CustomInput
//             control={control}
//             name="box"
//             placeholder="0"
//             keyboardType="number-pad"
//           />
//         </View>

//         <View style={styles.rowItem}>
//           <Text style={styles.label}>Weight (kg)</Text>
//           <CustomInput
//             control={control}
//             name="weight"
//             placeholder="0.00"
//             keyboardType="decimal-pad"
//           />
//         </View>
//       </View>

//       <View style={styles.row}>
//         <View style={styles.rowItem}>
//           <Text style={styles.label}>Rate / Price</Text>
//           <CustomInput
//             control={control}
//             name="price"
//             placeholder="0.00"
//             keyboardType="decimal-pad"
//           />
//         </View>

//         <View style={styles.rowItem}>
//           <Text style={styles.label}>Total Amount</Text>
//           <View style={styles.readOnlyBox}>
//             <Text style={styles.readOnlyText}>
//               ₹ {watch("amount")?.toLocaleString() || "0"}
//             </Text>
//           </View>
//         </View>
//       </View>
//       <View style={styles.rowItem}>
//         <Text style={styles.label}>Paid</Text>
//         <CustomInput
//           control={control}
//           name="paid"
//           placeholder="0.00"
//           keyboardType="decimal-pad"
//         />
//       </View>
//       <View style={styles.buttons}>
//         <TouchableOpacity
//           style={[styles.button, styles.cancel]}
//           onPress={onCancel}
//           disabled={loading}
//         >
//           <Text style={styles.cancelText}>Cancel</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1.5 }}>
//           <CustomButton
//             text={loading ? "Saving..." : "Add Sale"}
//             onPress={handleSubmit(onSubmit, (e) =>
//               console.log("Validation Errors:", e)
//             )}
//             disabled={loading}
//           />
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginVertical: 8,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//   },
//   label: { fontSize: 13, fontWeight: "700", marginBottom: 6, color: "#4b5563" },
//   error: { color: "#dc2626", fontSize: 11, marginTop: 2, fontWeight: "500" },
//   row: { flexDirection: "row", gap: 12, marginBottom: 14 },
//   rowItem: { flex: 1 },
//   readOnlyBox: {
//     backgroundColor: "#f9fafb",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#f3f4f6",
//     justifyContent: "center",
//     height: 48,
//   },
//   readOnlyText: { color: "#059669", fontWeight: "700", fontSize: 15 },
//   buttons: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   cancel: { backgroundColor: "#f3f4f6" },
//   cancelText: { color: "#374151", fontWeight: "700", fontSize: 15 },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import CustomComboBox from "@/components/CustomComboBox";
import CustomInput from "@/components/CustomInput";
import { useLocalSearchParams } from "expo-router";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@/components/CustomButtom";

interface Customer {
  id: string;
  name: string;
}

interface SalesFormProps {
  listId: string;
  orderDate: string;
  customer: Customer[];
  initialData?: any; // Add this for editing
  onCancel: () => void;
  onSuccess: (updatedSale: any) => void;
}

const salesFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  listId: z.string(),
  orderDate: z.string(),
  box: z.coerce.number().min(1, "Box count required"),
  price: z.coerce.number().min(1, "Rate is required"),
  weight: z.coerce.number().min(0.01, "Weight is required"),
  amount: z.number(),
  paid: z.coerce.number().min(0).optional().default(0),
});

type SalesFormValues = z.output<typeof salesFormSchema>;

const API_BASE = "https://chick-trade-15.vercel.app";

export default function SalesForm({
  listId,
  orderDate,
  customer,
  initialData, // Destructure initialData
  onCancel,
  onSuccess,
}: SalesFormProps) {
  const { getToken } = useAuth();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const [loading, setLoading] = useState(false);
  
  // Determine if we are in Edit Mode
  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema) as any,
    mode: "onTouched",
    defaultValues: {
      customerId: initialData?.customer?.id || "",
      listId: initialData?.listId || listId,
      orderDate: initialData?.orderDate || orderDate,
      price: initialData?.price || ("" as any),
      box: initialData?.box || 1,
      weight: initialData?.weight || ("" as any),
      amount: initialData?.amount || 0,
      paid: initialData?.paid || 0,
    },
  });

  // Re-populate form if initialData changes (for double-click logic)
  useEffect(() => {
    if (initialData) {
      reset({
        customerId: initialData.customer?.id,
        listId: initialData.listId,
        orderDate: initialData.orderDate,
        price: initialData.price,
        box: initialData.box,
        weight: initialData.weight,
        amount: initialData.amount,
        paid: initialData.paid || 0,
      });
    }
  }, [initialData, reset]);

  const price = watch("price");
  const weight = watch("weight");

  useEffect(() => {
    const p = Number(price) || 0;
    const w = Number(weight) || 0;
    setValue("amount", Number((p * w).toFixed(2)), { shouldValidate: true });
  }, [price, weight, setValue]);

  const onSubmit: SubmitHandler<SalesFormValues> = async (data) => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const token = await getToken();

      // Switch URL and Method based on mode
      const url = isEditing 
        ? `${API_BASE}/api/${organizationId}/card/${initialData.id}` 
        : `${API_BASE}/api/${organizationId}/card`;
      
      const response = isEditing 
        ? await axios.patch(url, data, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } });

      onSuccess(response.data);
      console.log("dasdasdsa",response.data)
      Alert.alert("Success", isEditing ? "Sale updated" : "Sale added");
    } catch (err: any) {
      Alert.alert("Error", "Could not save sale info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>{isEditing ? "Edit Sale Entry" : "New Sale Entry"}</Text>
      
      <Text style={styles.label}>Customer</Text>
      <CustomComboBox
        control={control}
        name="customerId"
        options={customer.map((c) => ({ label: c.name, value: c.id }))}
        placeholder="Select Customer"
      />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Box</Text>
          <CustomInput control={control} name="box" placeholder="1" keyboardType="number-pad" />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Weight (kg)</Text>
          <CustomInput control={control} name="weight" placeholder="0.00" keyboardType="decimal-pad" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Rate / Price</Text>
          <CustomInput control={control} name="price" placeholder="0.00" keyboardType="decimal-pad" />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Total Amount</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>₹ {watch("amount")?.toLocaleString() || "0"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rowItem}>
        <Text style={styles.label}>Paid Amount</Text>
        <CustomInput control={control} name="paid" placeholder="0.00" keyboardType="decimal-pad" />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ flex: 1.5 }}>
          <CustomButton
            text={loading ? "Saving..." : isEditing ? "Update Sale" : "Add Sale"}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 15 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 4, color: "#4b5563", textTransform: 'uppercase' },
  row: { flexDirection: "row", gap: 12, marginBottom: 10 },
  rowItem: { flex: 1 },
  readOnlyBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    justifyContent: "center",
    height: 48,
  },
  readOnlyText: { color: "#059669", fontWeight: "700", fontSize: 15 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 15, alignItems: "center" },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  cancel: { backgroundColor: "#f3f4f6" },
  cancelText: { color: "#374151", fontWeight: "700" },
});