import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome6";
import DashboardScreen from "../screens/DashboardScreen";
import WorkoutsScreen from "../screens/WorkoutsScreen";
import TodaysWorkoutScreen from "../screens/TodaysWorkoutScreen";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";
import WorkoutCompleteScreen from "../screens/WorkoutCompleteScreen";
import InboxScreen from "../screens/InboxScreen";
import NutritionScreen from "../screens/NutritionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FreestyleWorkoutScreen from "../screens/FreestyleWorkoutScreen";
import ReorderScreen from "../screens/ReorderScreen";
import MobilityAssessmentScreen from "../screens/MobilityAssessmentScreen";
import VideoMobilityScreen from "../screens/VideoMobilityScreen";
import VideoMobilityDetailScreen from "../screens/VideoMobilityDetailScreen";
import AssessmentResults from "../screens/AssessmentResults";
import AssessmentDetailsScreen from "../screens/AssessmentDetailsScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AnkleDorsiflexion from "../screens/IndividualAssessmentScreens/AnkleDorsiflexion";
import HipInternalRotation from "../screens/IndividualAssessmentScreens/HipInternalRotation";
import { ChannelScreen } from "../screens/CoachChatScreen";
import { AppProvider } from "../context/ChatContext";
import VideoRecorderScreen from "../screens/VideoRecorderScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutsMain" component={WorkoutsScreen} />
      <Stack.Screen name="TodaysWorkout" component={TodaysWorkoutScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      <Stack.Screen
        name="ReorderScreen"
        component={ReorderScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "Home") iconName = "house";
          else if (route.name === "Workouts") iconName = "dumbbell";
          else if (route.name === "Inbox") iconName = "envelope";
          else if (route.name === "Nutrition") iconName = "utensils";
          else if (route.name === "Profile") iconName = "user";
          return <Icon name={iconName} color={color} size={size} />;
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
  );
}

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="FreestyleWorkout"
            component={FreestyleWorkoutScreen}
          />
          <Stack.Screen
            name="MobilityAssessmentScreen"
            component={MobilityAssessmentScreen}
          />
          <Stack.Screen
            name="VideoMobilityScreen"
            component={VideoMobilityScreen}
          />
          <Stack.Screen
            name="VideoMobilityDetailScreen"
            component={VideoMobilityDetailScreen}
          />
          <Stack.Screen
            name="AssessmentResults"
            component={AssessmentResults}
          />
          <Stack.Screen
            name="AssessmentDetailsScreen"
            component={AssessmentDetailsScreen}
          />
          <Stack.Screen
            name="AnkleDorsiflexion"
            component={AnkleDorsiflexion}
          />
          <Stack.Screen
            name="HipInternalRotation"
            component={HipInternalRotation}
          />
          <Stack.Screen
            name="ChannelScreen"
            component={ChannelScreen}
            options={{ headerShown: true, title: "Chat", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="VideoRecorderScreen"
            component={VideoRecorderScreen}
            options={{ headerShown: true, title: "Record Video" }}
          />
        </Stack.Navigator>
      </AppProvider>
    </SafeAreaProvider>
  );
}
