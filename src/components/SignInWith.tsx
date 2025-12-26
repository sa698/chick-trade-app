// import React, { useCallback, useEffect } from "react";
// import * as WebBrowser from "expo-web-browser";
// import * as AuthSession from "expo-auth-session";
// import { useSignIn, useOAuth, useOrganizationList } from "@clerk/clerk-expo";

// import { router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import CustomButton from "./CustomButtom";

// // warm up browser for faster OAuth
// export const useWarmUpBrowser = () => {
//   useEffect(() => {
//     void WebBrowser.warmUpAsync();
//     return () => {
//       void WebBrowser.coolDownAsync();
//     };
//   }, []);
// };

// WebBrowser.maybeCompleteAuthSession();

// export default function SignInWith() {
//   const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
//   const { setActive, isLoaded: signInLoaded } = useSignIn();
//   const { userMemberships, isLoaded: orgLoaded } = useOrganizationList();

//   const onPress = useCallback(async () => {
//     try {
//       const { createdSessionId, setActive } = await startOAuthFlow({
//         redirectUrl: AuthSession.makeRedirectUri(),
//       });

//       if (createdSessionId && setActive) {
//         // Activate the session
//         await setActive({ session: createdSessionId });

//         // Wait for orgs to load
//         if (!orgLoaded) return;

//         const membership = userMemberships.data?.[0];

//         // No org → go to select-org
//         if (!membership) {
//           router.replace("/select-org");
//           return;
//         }

//         const orgId = membership.organization.id;

//         // Save orgId
//         await AsyncStorage.setItem("organizationId", orgId);

//         // Redirect to org dashboard
//         router.replace(`/organization/${orgId}`);
//       }
//     } catch (e) {
//       console.error("OAuth error", e);
//     }
//   }, [startOAuthFlow, setActive, orgLoaded, userMemberships]);

//   return <CustomButton text="Sign in with Google" onPress={onPress} />;
// }
// import * as AuthSession from "expo-auth-session";
// import { useOAuth } from "@clerk/clerk-expo";
// import CustomButton from "./CustomButtom";

// export default function SignInWith() {
//   const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

//   const onPress = async () => {
//     const { createdSessionId, setActive } = await startOAuthFlow({
//       redirectUrl: AuthSession.makeRedirectUri(),
//     });

//     if (createdSessionId) {
//       // await setActive({ session: createdSessionId });
//       // ❌ DO NOT REDIRECT
//     }
//   };

//   return <CustomButton text="Sign in with Google" onPress={onPress} />;
// }
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import CustomButton from "./CustomButtom";
import { Alert } from "react-native";
import { Link, router } from "expo-router";
// Required for OAuth redirect handling
WebBrowser.maybeCompleteAuthSession();

export default function SignInWith() {
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });

  const onPress = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      // ✅ ONLY activate session
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // ❌ No navigation here
        // app/index.tsx will redirect correctly

             router.replace("/select-org");
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      Alert.alert("Login failed", "Unable to sign in with Google");
    }
  };

  return (
    <CustomButton
      text="Sign in with Google"
      onPress={onPress}
    />
  );
}
