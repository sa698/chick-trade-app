// // // import { useAuth } from "@clerk/clerk-expo";
// // // import { Redirect, Slot } from "expo-router";
 

// // // export default function ProtectedLayout() {
// // //   console.log("Protected layout rendered");
// // //   const { isSignedIn } = useAuth();

// // //   if (!isSignedIn) {
// // //     return <Redirect href={"/(auth)/sign-in"} />;
// // //   }
// // //   return <Slot />;
// // // }
// // import { useEffect } from "react";
// // import { Stack, useRouter, useSegments } from "expo-router";
// // import { useAuth, useOrganization } from "@clerk/clerk-expo";

// // export default function ProtectedLayout() {
// //   const { isLoaded, isSignedIn } = useAuth();
// //   const { organization } = useOrganization();
// //   const router = useRouter();
// //   const segments = useSegments();

// //   useEffect(() => {
// //     if (!isLoaded) return;

// //     // 1️⃣ Not logged in → Sign in
// //     if (!isSignedIn) {
// //       router.replace("/sign-in");
// //       return;
// //     }

// //     // 2️⃣ Logged in but no organization → Select org
// //     if (!organization?.id && !segments.includes("select-org")) {
// //       router.replace("/select-org");
// //       return;
// //     }
// //   }, [isLoaded, isSignedIn, organization, segments]);

// //   return <Stack screenOptions={{ headerShown: false }} />;
// // }
// // app/(protected)/_layout.tsx
// import { useEffect, useRef } from "react";
// import { Stack, useRouter, useSegments } from "expo-router";
// import { useAuth, useOrganization } from "@clerk/clerk-expo";

// export default function ProtectedLayout() {
//   const { isLoaded, isSignedIn } = useAuth();
//   const { organization } = useOrganization();
//   const router = useRouter();
//   const segments = useSegments();
//   const redirectedRef = useRef(false); // Prevent infinite loop

//   useEffect(() => {
//     if (!isLoaded || redirectedRef.current) return;

//     if (!isSignedIn) {
//       redirectedRef.current = true;
//       router.replace("/(auth)/sign-in");
//       return;
//     }

//     // if (!organization?.id && segments[1] !== "select-org") {
//     //   redirectedRef.current = true;
//     //   router.replace("/(protected)/select-org");
//     //   return;
//     // }

//         if (!organization?.id && !segments.includes("select-org")) {
//       router.replace("/select-org");
//       return;
//     }
//   }, [isLoaded, isSignedIn, organization?.id, segments]);

//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function ProtectedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
