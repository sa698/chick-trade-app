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
  hidden?: boolean;
  containerStyle?: object; // allow custom container style
} & TextInputProps;
const CustomInput = ({
  control,
  name,
  disabled = false,
  hidden = false,
  containerStyle,
  ...props
}: CustomInputProps) => {
  if (hidden) {
    return (
      <Controller
        control={control}
        name={name}
        render={() => <></>} // ✅ Empty fragment instead of null
      />
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onBlur, onChange },
        fieldState: { error },
      }) => (
        <View style={[styles.container, containerStyle]}>
          <TextInput
            {...props}
            editable={!disabled}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor="#888"
            style={[
              styles.input,
              props.style,
              { borderColor: error ? "crimson" : "#ccc" },
            ]}
          />
          {error ? (
            <Text style={styles.error}>{error.message}</Text>
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
    flexDirection: "column",
    gap: 4,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  error: {
    color: "crimson",
    fontSize: 12,
    minHeight: 18,
  },
});
