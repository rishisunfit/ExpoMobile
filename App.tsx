import React from "react";
import RootStackLauout from "./src/navigation/navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootStackLauout />
    </GestureHandlerRootView>
  );
}
