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
import { Link, router } from "expo-router";
import {
  isClerkAPIResponseError,
  useSignIn,
  useOrganizationList,
} from "@clerk/clerk-expo";

import CustomButton from "@/components/CustomButtom";
import CustomeInput from "@/components/CustomInput";
import SignInWith from "@/components/SignInWith";

const signSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInData = z.infer<typeof signSchema>;

export default function SignIn() {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { userMemberships, isLoaded: orgLoaded } = useOrganizationList();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(signSchema),
  });

  const onSignInPressed = async (data: SignInData) => {
    if (!signInLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status !== "complete") {
        setError("root", { message: "Sign in not completed" });
        return;
      }

      // Activate session
      await setActive({ session: signInAttempt.createdSessionId });

      // Wait until organization list is loaded
      let membership;
      const timeout = Date.now() + 3000; // 3s max wait
      while (!orgLoaded) {
        if (Date.now() > timeout) break;
        await new Promise((res) => setTimeout(res, 100));
      }

      membership = userMemberships.data?.[0];

      // Redirect based on organization
      if (!membership) {
        router.replace("/select-org");
        return;
      }

      const orgId = membership.organization.id;
      await AsyncStorage.setItem("organizationId", orgId);
      router.replace(`/organization/${orgId}`);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach((error) =>
          setError("root", { message: error.longMessage })
        );
      } else {
        setError("root", { message: "Sign in failed" });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Sign in</Text>

      <CustomeInput
        control={control}
        name="email"
        placeholder="Email"
        keyboardType="email-address"
      />
      <CustomeInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
      />

      <CustomButton text="Sign in" onPress={handleSubmit(onSignInPressed)} />

      {errors.root && (
        <Text style={{ color: "crimson" }}>{errors.root.message}</Text>
      )}

      <Link href="/(auth)/sign-up" style={styles.link}>
        Don’t have an account? Sign up
      </Link>

      <SignInWith />
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
 