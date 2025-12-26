// import {
//   StyleSheet,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   View,
// } from "react-native";

// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// import CustomButton from "@/components/CustomButtom";
// import CustomeInput from "@/components/CustomInput";
// import { Link } from "expo-router";
// import { useSignUp } from "@clerk/clerk-expo";

// const verifySchema = z.object({
//   code: z
//     .string({ message: "Code is required" })
//     .min(6, { message: "Code must be at least 6 characters long" }),
// });

// type VerifyFields = z.infer<typeof verifySchema>;
// const mapClerkErrorToFormField = (err: any) => {
//   switch (err.meta?.paramName) {
//     case "code":
//       return "code"; 
//     default:
//       return "root";
//   }
// };
// export default function VerifyScreen() {
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     setError
//   } = useForm({
//     resolver: zodResolver(verifySchema),
//   });
//   console.log(errors);

//   const { signUp, isLoaded,setActive } = useSignUp();

//   const onVerifyPressed = async (data: VerifyFields) => {
//    if (!isLoaded) return;
//     try {
//       const completeSignUp = await signUp?.attemptEmailAddressVerification({
//         code: data.code,
//       });

//       if(completeSignUp.status === "complete") {
//         // Navigate to the main app or home screen
//         console.log("Email verified and sign-up complete!");
//         setActive({ session: completeSignUp.createdSessionId });
//       }
//       else {
//         console.log("Unexpected sign-up status:", completeSignUp);
//         setError("root", { message: "Failed to verify email, try again later" });
//       }
//     } catch (err:any) {
//       if (mapClerkErrorToFormField(err)) {
//         err.errors.forEach((error: any) => {
//           const clerkField = mapClerkErrorToFormField(err);
//           console.log("Clerk error", err, clerkField);
//           setError(clerkField, {
//             message: error.longMessage,
//           });
//         });
//       } else {
//         setError("root", { message: "Failed to sign up, try again later" });
//         console.error("Unknown error", err);
//       }
//     }
//   };
//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <Text style={styles.title}>Verify your email</Text>

//       <View style={styles.form}>
//         <CustomeInput
//           control={control}
//           name="code"
//           placeholder="Email"
//           autoFocus
//           autoCapitalize="none"
//           keyboardType="number-pad"
//           autoComplete="one-time-code"
//           autoCorrect={false}
//         />
//       </View>

//       <CustomButton text={"Verify"} onPress={handleSubmit(onVerifyPressed)} />
//     </KeyboardAvoidingView>
//   );
// }
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSignUp, useOrganizationList } from "@clerk/clerk-expo";

import CustomButton from "@/components/CustomButtom";
import CustomeInput from "@/components/CustomInput";

const verifySchema = z.object({
  code: z.string().min(6, "Code must be 6 digits"),
});

type VerifyFields = z.infer<typeof verifySchema>;

export default function VerifyScreen() {
  const { control, handleSubmit, setError } = useForm<VerifyFields>({
    resolver: zodResolver(verifySchema),
  });

  const { signUp, isLoaded, setActive } = useSignUp();
  const { userMemberships, isLoaded: orgLoaded } = useOrganizationList();

  const onVerifyPressed = async (data: VerifyFields) => {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (result.status !== "complete") {
        setError("root", { message: "Verification failed" });
        return;
      }

      // Activate session
      await setActive({ session: result.createdSessionId });

      // Wait until orgs are loaded
      if (!orgLoaded) return;

      const membership = userMemberships?.data?.[0];

      // No organization → select-org
      if (!membership) {
        router.replace("/select-org");
        return;
      }

      // Organization exists
      const orgId = membership.organization.id;
      await AsyncStorage.setItem("organizationId", orgId);

      router.replace(`/organization/${orgId}`);
    } catch (err: any) {
      if (err?.errors) {
        setError("root", {
          message: err.errors[0]?.longMessage || "Verification error",
        });
      } else {
        setError("root", { message: "Something went wrong" });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Verify your email</Text>

      <View style={styles.form}>
        <CustomeInput
          control={control}
          name="code"
          placeholder="Verification Code"
          keyboardType="number-pad"
          autoComplete="one-time-code"
        />
      </View>

      <CustomButton text="Verify" onPress={handleSubmit(onVerifyPressed)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  form: {
    gap: 5,
  },
  link: {
    color: "#4353FD",
    fontWeight: "600",
  },
});
