import React from 'react';
import { View, Text, Button } from 'react-native';

export default function NutritionScreen({ navigation }: any) {
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Button title="Try Freestyle Workout" onPress={() => navigation.navigate('FreestyleWorkout')} />
      <Text>Nutrition</Text>
    </View>
  );
} 