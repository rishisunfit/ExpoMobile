import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../styles';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

export default function HipInternalRotation() {
  const navigation = useNavigation<any>();
  const [stiffness, setStiffness] = useState(5);
  const [pain, setPain] = useState('none');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gradient Assessment Header */}
        <LinearGradient
          colors={[COLORS.accent, '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={styles.gradientHeaderIconCircle}>
              <Icon name="2" size={28} color="#fff" />
            </View>
            <Text style={styles.gradientHeaderTitle}>Hip Internal Rotation</Text>
            <Text style={styles.gradientHeaderSubtitle}>Assess your hip internal rotation and mobility</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, gap: 24 }}>
          {/* Watch Hip Assessment Guide */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={styles.iconCircleAccent}>
                <Icon name="play" size={16} color={COLORS.accent} />
              </View>
              <Text style={styles.cardTitle}>Watch Hip Assessment Guide</Text>
            </View>
            <View style={styles.videoContainer}>
              <View style={styles.videoGradient}>
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.videoPlayCircle}>
                    <Icon name="play" size={28} color={COLORS.accent} />
                  </View>
                  <Text style={styles.videoLabel}>Hip Internal Rotation Assessment</Text>
                  <Text style={styles.videoDuration}>2:45 minutes</Text>
                </View>
              </View>
            </View>
            {/* Steps */}
            <View style={{ gap: 16 }}>
              {[
                {
                  title: 'Start Seated With Camera At Knee Height',
                },
                {
                  title: 'Pinch Foam Roller Between The Knees',
                },
                {
                  title: 'Drive Foot Out While Pinching Knees In',
                },
              ].map((step, idx) => (
                <View key={step.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                  <View style={[styles.stepCircle, { marginTop: 0, marginBottom: 0, backgroundColor: '#ddd6fe' }] }>
                    <Text style={[styles.stepCircleText, { color: COLORS.accent }]}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Record Response Section */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={styles.iconCircleRed}>
                <Icon name="video" size={16} color="#ef4444" />
              </View>
              <Text style={styles.cardTitle}>Record Your Response</Text>
            </View>
            <Text style={styles.cardDesc}>Follow the movements shown in the video and record yourself performing each assessment.</Text>
            <View style={styles.tipsBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.tipsTitle}>Recording Tips:</Text>
                <Icon name="lightbulb" size={16} color="#f59e42" />
              </View>
              <View>
                <Text style={styles.tipsList}>• Record from the side view</Text>
                <Text style={styles.tipsList}>• Ensure good lighting</Text>
                <Text style={styles.tipsList}>• Keep phone steady</Text>
                <Text style={styles.tipsList}>• Show full body movement</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.recordBtn, { backgroundColor: COLORS.accent }] }>
              <Icon name="video" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.recordBtnText}>Record Response</Text>
            </TouchableOpacity>
            <View style={[styles.privacyBox, { backgroundColor: '#ddd6fe' }] }>
              <Icon name="shield-check" size={16} color={COLORS.accent} style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyTitle}>Privacy & Security</Text>
                <Text style={styles.privacyDesc}>
                  Your video is securely encrypted and only viewed by your certified coach for assessment purposes.
                </Text>
              </View>
            </View>
          </View>

          {/* Assessment Questions */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Quick Assessment Questions</Text>
            {/* Stiffness Slider */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.questionLabel}>Rate your hip stiffness (1-10)</Text>
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.accent, marginBottom: 4 }}>{stiffness}</Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={stiffness}
                  onValueChange={setStiffness}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={'#e5e7eb'}
                  thumbTintColor={COLORS.accent}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.sliderLabel}>5</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.sliderLabel}>10</Text>
                </View>
              </View>
            </View>
            {/* Pain Radio */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.questionLabel}>Any pain or discomfort?</Text>
              {[
                { value: 'none', label: 'No pain' },
                { value: 'mild', label: 'Mild discomfort' },
                { value: 'moderate', label: 'Moderate pain' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.radioRow}
                  onPress={() => setPain(opt.value)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.radioOuter,
                    pain === opt.value && styles.radioOuterSelected,
                  ]}>
                    {pain === opt.value && <View style={[styles.radioInner, { backgroundColor: COLORS.accent }]} />}
                  </View>
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Notes */}
            <View>
              <Text style={styles.questionLabel}>Additional notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any specific concerns or observations..."
                placeholderTextColor="#64748b"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: COLORS.accent }] }>
            <Text style={styles.submitBtnText}>Next Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 180,
    justifyContent: 'center',
  },
  gradientHeaderIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gradientHeaderTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  gradientHeaderSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  videoContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoGradient: {
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  videoLabel: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  videoDuration: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  iconCircleAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd6fe', // purple accent
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd6fe', // purple accent
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepCircleText: {
    color: COLORS.accent, // purple
    fontWeight: '700',
    fontSize: 13,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardDesc: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  tipsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tipsList: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent, // purple
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    marginBottom: 10,
  },
  recordBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ddd6fe', // purple accent
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  privacyTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  privacyDesc: {
    color: '#64748b',
    fontSize: 12,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  sliderBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  sliderInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ddd6fe', // purple accent
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: COLORS.accent, // purple
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent, // purple
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent, // purple
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 32,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});
