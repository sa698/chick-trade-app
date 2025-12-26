// import { useEffect } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { router } from "expo-router";
// import {
//   useAuth,
//   useOrganizationList,
// } from "@clerk/clerk-expo";

// export default function Index() {
//   const { isSignedIn, isLoaded } = useAuth();
//   const { userMemberships, isLoaded: orgLoaded } = useOrganizationList();

//   useEffect(() => {
//     if (!isLoaded || !orgLoaded) return;

//     // Not signed in → go to sign-in
//     if (!isSignedIn) {
//       router.replace("/(auth)/sign-in");
//       return;
//     }

//     // Signed in but no org
//     const membership = userMemberships?.data?.[0];
//     if (!membership) {
//       router.replace("/select-org");
//       return;
//     }

//     // Signed in + org
//     router.replace(`/organization/${membership.organization.id}`);
//   }, [isLoaded, isSignedIn, orgLoaded]);

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <ActivityIndicator size="large" />
//     </View>
//   );
// }
 
import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth, useOrganizationList } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { userMemberships, isLoaded: orgLoaded } = useOrganizationList();

  useEffect(() => {
    // Wait for Clerk
    if (!isLoaded) return;

    // Not signed in → show sign-in page
    if (!isSignedIn) {
      router.replace("/(auth)/sign-in");
      return;
    }

    // Wait for orgs AFTER sign-in
    if (!orgLoaded) return;

    const membership = userMemberships?.data?.[0];

    // Signed in but no org
    if (!membership) {
      router.replace("/select-org");
      return;
    }

    // Signed in + org
    router.replace(`/organization/${membership.organization.id}`);
  }, [isLoaded, isSignedIn, orgLoaded, userMemberships]);

  // 👇 IMPORTANT: render nothing (no spinner)
  return null;
}
