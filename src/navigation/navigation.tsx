import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import { AppNavigator } from './AppNavigator';


const RootStackLauout = () => {

    const Stack = createNativeStackNavigator(); 
  return (
   <NavigationContainer>
    <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
     <Stack.Screen name='Login' component={LoginScreen} />
     <Stack.Screen name='AppNavigator' component={AppNavigator} />
    </Stack.Navigator>
   </NavigationContainer>
  )
}

export default RootStackLauout

const styles = StyleSheet.create({})