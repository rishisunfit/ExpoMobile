import React from 'react';
import { View, Text } from 'react-native';
import { logout as logoutService} from '../services/auth.services';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';



export default function ProfileScreen() {
  const navigation = useNavigation();
  const logout = async () => {
    await logoutService();
    navigation.navigate("Login" as never);
  };
  return (
  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Text>Profile</Text>
    <Button title="Logout" onPress={() => logout()} />
    </View>
  );
} 