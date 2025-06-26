import { StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import { AppNavigator } from "./AppNavigator";
import CoachChat from "../components/UserList/CoachChat";
import GroupChat from "../components/UserList/GroupChat";
import ForumChat from "../components/UserList/ForumChat";
import { checkLoginStatus } from "../services/auth.services";
const RootStackLayout = () => {
  const Stack = createNativeStackNavigator();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null means "loading"

  useEffect(() => {
    checkLoginStatus().then((loggedIn) => {
      setIsLoggedIn(loggedIn);
    });
  }, []);

  // Show nothing or a splash/loading screen while checking login status
  if (isLoggedIn === null) {
    return null; // Or a loading indicator component
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "AppNavigator" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AppNavigator" component={AppNavigator} />
        <Stack.Screen name="CoachChat" component={CoachChat} />
        <Stack.Screen name="GroupChat" component={GroupChat} />
        <Stack.Screen name="ForumChat" component={ForumChat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStackLayout;

const styles = StyleSheet.create({});
