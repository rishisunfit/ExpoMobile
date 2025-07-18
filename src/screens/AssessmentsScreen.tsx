import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';

export default function AssessmentsScreen({ route }) {
  const { imageUrls = [] } = route.params || {};

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Assessment Results</Text>
      {imageUrls.length === 0 ? (
        <Text>No assessment images found.</Text>
      ) : (
        imageUrls.map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={{ width: '100%', height: 200, marginBottom: 16, borderRadius: 8 }}
            resizeMode="cover"
          />
        ))
      )}
    </ScrollView>
  );
}
