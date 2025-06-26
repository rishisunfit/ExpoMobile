import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Auth from "../components/Auth";

const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Auth />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
