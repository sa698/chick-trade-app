import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type CustomDatePickerProps = {
  control: any;
  name: string;
  placeholder?: string;
     disabled?: boolean;
};

const CustomDatePicker = ({
  control,
  name,
  placeholder = "Select Date",
    disabled = false,
}: CustomDatePickerProps) => {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.input, { borderColor: error ? "crimson" : "#ccc" }]}
            onPress={() => setShow(true)}
          >
            <Text style={value ? styles.valueText : styles.placeholder}>
              {value instanceof Date
                ? value.toLocaleDateString("en-GB")
                : placeholder}
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error.message}</Text>}

          {!disabled&& show && (
            <DateTimePicker
              value={value instanceof Date ? value : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (Platform.OS === "android") setShow(false);

                if (event.type !== "dismissed" && selectedDate) {
                  onChange(selectedDate); // ✅ Date, not string
                }
              }}
            />
          )}
        </View>
      )}
    />
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  container: { gap: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    justifyContent: "center",
  },
  placeholder: { color: "#999" },
  valueText: { color: "#000" },
  error: { color: "red", minHeight: 18 },
});
