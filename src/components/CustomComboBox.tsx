import { Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { useState, useMemo } from "react";

type Option = { label: string; value: string };

type CustomComboBoxProps = {
  control: any;
  name: string;
  options: Option[];
  placeholder?: string;
   disabled?: boolean;
};

export default function CustomComboBox({
  control,
  name,
  options,
  placeholder = "Select supplier",
  disabled = false,
}: CustomComboBoxProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Pressable
            style={[
              styles.input,
              { borderColor: error ? "crimson" : "#ccc", opacity: disabled ? 0.6 : 1 },
            ]}
            onPress={() => !disabled && setVisible(true)} // prevent open if disabled
          >
            <Text style={value ? styles.valueText : styles.placeholder}>
              {options.find((o) => o.value === value)?.label || placeholder}
            </Text>
          </Pressable>

          {error && <Text style={styles.error}>{error.message}</Text>}

          {!disabled && (
            <Modal visible={visible} transparent animationType="fade">
              <Pressable
                style={styles.overlay}
                onPress={() => setVisible(false)}
              >
                <View style={styles.modal}>
                  <TextInput
                    placeholder="Search supplier..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                  />

                  <FlatList
                    data={filteredOptions}
                    keyExtractor={(item) => item.value}
                    style={{ maxHeight: 300 }}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.option}
                        onPress={() => {
                          onChange(item.value);
                          setVisible(false);
                          setSearch("");
                        }}
                      >
                        <Text>{item.label}</Text>
                      </Pressable>
                    )}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              </Pressable>
            </Modal>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
    container: {
    gap: 4,
 
  },
  input: { borderWidth: 1, padding: 12, borderRadius: 5, justifyContent: "center" },
  placeholder: { color: "#999" },
  valueText: { color: "#000" },
  error: { color: "red", minHeight: 18 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "#fff", borderRadius: 8, padding: 8 },
  searchInput: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 8 },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
