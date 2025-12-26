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

import CustomButton from "@/components/CustomButtom";
import CustomeInput from "@/components/CustomInput";
import { Link, router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type SignUpData = z.infer<typeof signUpSchema>;

// Map Clerk error to form field
const mapClerkErrorToFormField = (err: any) => {
  switch (err.meta?.paramName) {
    case "email_address":
      return "email";
    case "password":
      return "password";
    default:
      return "root";
  }
};

export default function SignUp() {
  const { control, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  const { signUp, isLoaded } = useSignUp();

  const onSignUpPressed = async (data: SignUpData) => {
    if (!isLoaded) return;

    try {
      // Create new user
      await signUp?.create({
        emailAddress: data.email,
        password: data.password,
      });

      // Trigger email verification
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });

      // Navigate to verification screen
      router.push("/verify");

    } catch (err: any) {
      console.error("Sign up error:", err);

      // Handle structured Clerk errors
      if (err?.errors) {
        err.errors.forEach((error: any) => {
          const field = mapClerkErrorToFormField(error);
          setError(field as "email" | "password" | "root", {
            message: error.longMessage || error.message,
          });
        });
      } else {
        setError("root", { message: "Failed to sign up. Try again later." });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.form}>
        <CustomeInput
          control={control}
          name="email"
          placeholder="Email"
          autoFocus
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <CustomeInput
          control={control}
          name="password"
          placeholder="Password"
          secureTextEntry
        />
      </View>

      {errors.root && <Text style={{ color: "crimson" }}>{errors.root.message}</Text>}

      <CustomButton text="Sign up" onPress={handleSubmit(onSignUpPressed)} />

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign In
      </Link>
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
