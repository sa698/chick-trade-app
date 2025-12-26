import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useOrganizationList } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function SelectOrg() {
  const { isLoaded, userMemberships, createOrganization, setActive } =
    useOrganizationList({
      userMemberships: { infinite: true },
    });

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <Text>Loading organizations...</Text>
      </View>
    );
  }

  const orgs = userMemberships?.data ?? [];

  const handleSelectOrg = async (orgId: string) => {
    try {
      await setActive({ organization: orgId }); // ✅ activate org
      router.replace(`/organization/${orgId}`); // ✅ clean URL
    } catch (error) {
      console.error("Failed to set active org:", error);
    }
  };

  const handleCreateOrg = async () => {
    try {
      const org = await createOrganization({ name: "My Organization" });
      await setActive({ organization: org.id });
      router.replace(`/organization/${org.id}`);
    } catch (error) {
      console.error("Failed to create org:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Organization</Text>

      {orgs.length === 0 && (
        <Text style={styles.emptyText}>No organizations found</Text>
      )}

      {orgs.map((membership) => (
        <TouchableOpacity
          key={membership.organization.id}
          style={styles.orgButton}
          onPress={() => handleSelectOrg(membership.organization.id)}
        >
          <Text style={styles.orgText}>
            {membership.organization.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.createButton} onPress={handleCreateOrg}>
        <Text style={styles.createText}>+ Create Organization</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  orgButton: {
    padding: 14,
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },
  orgText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 12,
  },
  createButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2563EB",
    marginTop: 16,
  },
  createText: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  },
});
