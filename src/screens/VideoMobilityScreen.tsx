import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import VideoMobilityList from '../components/VideoMobility/VideoMobilityList';
import { COLORS } from '../styles';

export default function VideoMobilityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mobility Video Library</Text>
      </View>
      <VideoMobilityList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});
