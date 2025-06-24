import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { StyleProp } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
interface MyTextInputProps extends TextInputProps {
  hidePassword?: boolean;
  toggleButton?: () => void;
  customstyle?: StyleProp<ViewStyle>;
  errors?: string;
}
const CustomTextInput: React.FC<MyTextInputProps> = ({
  errors,
  hidePassword,
  toggleButton,
  customstyle,
  ...restProps
}) => {
  return (
    <View>
      <TextInput
        style={styles.input}
        secureTextEntry={hidePassword}
        {...restProps}
      />
      <View style={styles.eyeIcon}>
        {toggleButton && typeof hidePassword === "boolean" && (
          <TouchableOpacity style={styles.eyeIcon} onPress={toggleButton}>
            {hidePassword ? (
              <AntDesign name="eye" size={22} color="grey" />
            ) : (
              <Ionicons name="eye-off-sharp" size={22} color="grey" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {errors && <Text style={styles.errorText}>{errors}</Text>}
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 18,
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 7,
  },
});
