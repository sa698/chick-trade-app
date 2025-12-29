import {
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  PressableProps,
} from "react-native";

type ButtonVariant = "primary" | "outline" | "danger";

type CustomButtonProps = {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;

  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
} & PressableProps;

const CustomButton = ({
  text,
  disabled,
  loading,
  variant = "primary",
  containerStyle,
  textStyle,
  ...props
}: CustomButtonProps) => {
  return (
    <Pressable
      disabled={disabled || loading}
      {...props}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        containerStyle, // 👈 custom style from caller
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {text}
        </Text>
      )}
    </Pressable>
  );
};

export default CustomButton;
const styles = StyleSheet.create({
  base: {
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /* Variants */
  primary: {
    backgroundColor: "#4353FD",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4353FD",
  },
  danger: {
    backgroundColor: "#E53935",
  },

  /* Text */
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#4353FD",
  },
  dangerText: {
    color: "#fff",
  },

  /* States */
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
