import { Text, Pressable, StyleSheet, PressableProps } from "react-native";

type CustomButtonProps = {
  text: string;
  disabled?: boolean;
} & PressableProps;

const CustomButton = ({ text, disabled, ...props }: CustomButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,          // style when disabled
        pressed && !disabled && styles.pressed // optional pressed effect
      ]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4353FD",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabled: {
    backgroundColor: "#a0a0a0", // gray background when disabled
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.8, // optional visual feedback when pressed
  },
});
