import { Controller } from "react-hook-form";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  View,
} from "react-native";

type CustomInputProps = {
  control: any;
  name: string;
    disabled?: boolean;
} & TextInputProps;
const CustomInput = ({ control, name,  disabled = false, ...props }: CustomInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onBlur, onChange },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          <TextInput
            {...props}
              editable={!disabled}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={[
              styles.input,
              props.style,
              { borderColor: error ? "crimson" : "gray" },
            ]}
          />
          {error ? (
            <Text style={styles.error}>{error?.message}</Text>
          ) : (
            <View style={{ height: 18 }} />
          )}
        </View>
      )}
    />
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
  },
  error: {
    color: "red",
    minHeight: 18,
  },
});
