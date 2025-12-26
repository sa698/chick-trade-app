import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth, useOrganization } from "@clerk/clerk-expo";

export default function Index() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    if (!isSignedIn) return;

    if (organization?.id) {
      router.replace(`/organization/${organization.id}`);
    } else {
      router.replace("/select-org");
    }
  }, [isSignedIn, organization]);

  return null;
}
