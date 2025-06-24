import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "@rneui/themed";
import DashboardScreen from "../screens/DashboardScreen";
import WorkoutsScreen from "../screens/WorkoutsScreen";
import TodaysWorkoutScreen from "../screens/TodaysWorkoutScreen";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";
import WorkoutCompleteScreen from "../screens/WorkoutCompleteScreen";
import InboxScreen from "../screens/InboxScreen";
import NutritionScreen from "../screens/NutritionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutsMain" component={WorkoutsScreen} />
      <Stack.Screen name="TodaysWorkout" component={TodaysWorkoutScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName = "";
            if (route.name === "Home") iconName = "home";
            else if (route.name === "Workouts") iconName = "dumbbell";
            else if (route.name === "Inbox") iconName = "envelope";
            else if (route.name === "Nutrition") iconName = "utensils";
            else if (route.name === "Profile") iconName = "user";
            return (
              <Icon
                name={iconName}
                type="font-awesome-5"
                color={color}
                size={size}
              />
            );
          },
          tabBarActiveTintColor: "#10b981",
          tabBarInactiveTintColor: "#64748b",
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsStack} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
}
