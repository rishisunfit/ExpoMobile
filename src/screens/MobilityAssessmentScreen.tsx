import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { createClient } from '@supabase/supabase-js';
import { COLORS } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { emailToFolderName } from '../utils/formatters';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MobilityAssessmentScreen() {
  const [folderName, setFolderName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [imageUrls, setImageUrls] = useState<{ name: string, url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeling, setFeeling] = useState<string>('');
  const [goal, setGoal] = useState('');
  const [pain, setPain] = useState('');
  const [sleep, setSleep] = useState('');
  const navigation = useNavigation<any>();
  const [noMatches, setNoMatches] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setFeedback('');
    setImageUrls([]);
    setNoMatches(false);

    console.log('FetchData called. FolderName:', folderName);

    // Convert email to safe folder name if it's an email
    const safeFolderName = folderName.includes('@') ? emailToFolderName(folderName) : folderName;

    if (!safeFolderName) {
      console.log('No folder specified, aborting.');
      setLoading(false);
      return;
    }

    console.log(`Listing files in bucket folder: ${safeFolderName}`);
    // List images from the bucket folder
    const { data: files, error: storageError } = await supabase
      .storage
      .from('mobility-frames')
      .list(safeFolderName);

    console.log('Files found:', files, 'Storage error:', storageError);
    if (storageError || !files) {
      console.error(storageError);
      setLoading(false);
      setNoMatches(true);
      return;
    }

    // Get public URLs for each image and store name/url
    console.log('Getting public URLs for files...');
    const images = await Promise.all(
      files.map(async (file) => {
        const { data } = await supabase
          .storage
          .from('mobility-frames')
          .getPublicUrl(`${safeFolderName}/${file.name}`);
        console.log('Public URL for', file.name, ':', data?.publicUrl);
        return { name: file.name, url: data.publicUrl };
      })
    );

    console.log('Final images:', images);
    setImageUrls(images);
    setLoading(false);
    if (images.length === 0) {
      setNoMatches(true);
    } else {
      // --- Duplicated clinical standards and status logic ---
      const rangeOfMotionStandards: Record<string, any[]> = {
        'ankle_dorsiflex': [
          { max: 40, status: 'Overactive' },
          { min: 40, max: 60, status: 'Passing' },
          { min: 60, max: 67, status: 'Needs Work' },
          { min: 67, status: 'Failing' },
        ],
        'hip_internal_rotation': [
          { max: 20, status: 'Failing' },
          { min: 20, max: 25, status: 'Needs Work' },
          { min: 25, max: 35, status: 'Passing' },
          { min: 35, status: 'Overactive' },
        ],
        'hip_external_rotation': [
          { max: 5, status: 'Overactive' },
          { min: 5, max: 15, status: 'Passing' },
          { min: 15, max: 20, status: 'Needs Work' },
          { min: 20, status: 'Failing' },
        ],
        'hamstrings': [
          { max: 5, status: 'Overactive' },
          { min: 5, max: 20, status: 'Passing' },
          { min: 20, max: 25, status: 'Needs Work' },
          { min: 25, status: 'Failing' },
        ],
        'hipflexors': [
          { max: 135, status: 'Failing' },
          { min: 135, max: 145, status: 'Needs Work' },
          { min: 145, status: 'Passing' },
        ],
        'thoracic_rotation': [
          { max: 35, status: 'Overactive' },
          { min: 35, max: 50, status: 'Passing' },
          { min: 50, max: 55, status: 'Needs Work' },
          { min: 55, status: 'Failing' },
        ],
        'shoulder_external_rotation': [
          { max: 65, status: 'Failing' },
          { min: 65, max: 75, status: 'Needs Work' },
          { min: 75, status: 'Passing' },
        ],
        'shoulder_internal_rotation': [
          { max: 50, status: 'Failing' },
          { min: 50, max: 60, status: 'Needs Work' },
          { min: 60, max: 90, status: 'Passing' },
          { min: 90, status: 'Overactive' },
        ],
      };
      function getRangeOfMotionStatus(jointName: string, angle: number | null): string {
        if (angle === null || angle === undefined) return 'Untested';
        const standards = rangeOfMotionStandards[jointName];
        if (!standards) return 'Untested';
        for (const standard of standards) {
          if (standard.min !== undefined && standard.max !== undefined) {
            if (angle >= standard.min && angle < standard.max) {
              return standard.status;
            }
          } else if (standard.max !== undefined) {
            if (angle < standard.max) {
              return standard.status;
            }
          }
        }
        const lastStandard = standards[standards.length - 1];
        if (lastStandard.min !== undefined && angle >= lastStandard.min) {
          return lastStandard.status;
        }
        return 'Untested';
      }
      // --- End duplicated logic ---
      const jointMapping: Record<string, string> = {
        'Ankle Dorsiflexion': 'ankle_dorsiflex',
        'Hip Internal Rotation': 'hip_internal_rotation',
        'Hip External Rotation': 'hip_external_rotation',
        'Hamstring Mobility': 'hamstrings',
        'Hip Flexor Mobility': 'hipflexors',
        'Thoracic Rotation': 'thoracic_rotation',
        'Shoulder External Rotation': 'shoulder_external_rotation',
        'Shoulder Internal Rotation': 'shoulder_internal_rotation',
      };
      const assessmentTitles: string[] = Object.keys(jointMapping);
      // Helper to fetch left/right angles for a joint
      async function fetchAngles(joint: string): Promise<{ left: number | null, right: number | null }> {
        const jointName = jointMapping[joint];
        // Left
        const { data: leftData } = await supabase
          .from('mobilityassessments')
          .select('min_angle')
          .or(`email.eq.${folderName},name.eq.${folderName}`)
          .eq('joint', jointName)
          .eq('side', 'L')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        // Right
        const { data: rightData } = await supabase
          .from('mobilityassessments')
          .select('min_angle')
          .or(`email.eq.${folderName},name.eq.${folderName}`)
          .eq('joint', jointName)
          .eq('side', 'R')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        return {
          left: leftData?.min_angle ?? null,
          right: rightData?.min_angle ?? null,
        };
      }
      // Compute statuses for all assessments
      const computedAssessments: { title: string, status: string, leftStatus: string, rightStatus: string }[] = [];
      for (const title of assessmentTitles) {
        const { left, right } = await fetchAngles(title);
        const leftStatus = getRangeOfMotionStatus(jointMapping[title], left);
        const rightStatus = getRangeOfMotionStatus(jointMapping[title], right);
        let status = 'Untested';
        if (leftStatus === 'Passing' && rightStatus === 'Passing') {
          status = 'Great';
        } else if (leftStatus === 'Failing' || rightStatus === 'Failing') {
          status = 'Needs Immediate Attention';
        } else if (
          (leftStatus === 'Passing' && (rightStatus === 'Needs Work' || rightStatus === 'Overactive')) ||
          (rightStatus === 'Passing' && (leftStatus === 'Needs Work' || leftStatus === 'Overactive'))
        ) {
          status = 'Needs Work';
        } else if (leftStatus === 'Untested' && rightStatus === 'Untested') {
          status = 'Untested';
        } else {
          // Default fallback
          status = 'Needs Work';
        }
        computedAssessments.push({ title, status, leftStatus, rightStatus });
      }
      navigation.navigate('AssessmentResults', {
        computedAssessments,
        assessmentImage: images[3]?.url || null,
        folderName,
        assessmentImages: images,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32, backgroundColor: COLORS.background.secondary }}>
      {/* Assessment Section FIRST */}
      <View style={styles.assessmentSection}>
        <Text style={styles.assessmentTitle}>Start your assessment</Text>

        {/* Video Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Watch: Movement Assessment Guide</Text>
          <View style={styles.videoPlaceholder}>
            <View style={styles.videoIconCircle}>
              <Icon name="play" size={28} color={COLORS.success} />
            </View>
            <Text style={styles.videoLabel}>Movement Assessment Tutorial</Text>
          </View>
          <Text style={styles.cardSubtitle}>Record Your Response</Text>
          <Text style={styles.cardDescription}>
            Follow the movements shown in the video and record yourself for assessment.
          </Text>
          <TouchableOpacity style={styles.recordBtn} onPress={() => {}}>
            <Icon name="video" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.recordBtnText}>Record Response</Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            <Icon name="circle-info" size={18} color={COLORS.success} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.infoText}>
              Your video will be reviewed by your coach to provide personalized feedback and adjustments.
            </Text>
          </View>
        </View>

        {/* Main Area Struggling With */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's the main area you're struggling with right now?</Text>
          <View style={{ gap: 10 }}>
            {[
              { value: 'knees', label: 'Knees' },
              { value: 'low_back', label: 'Low back' },
              { value: 'knees_low_back', label: 'Knees + Low back' },
              { value: 'ankles_feet', label: 'Ankles + Feet' },
              { value: 'shoulders', label: 'Shoulders' },
              { value: 'hips', label: 'Hips' },
              { value: 'neck_upper_spine', label: 'Neck/Upper spine' },
              { value: 'full_body_stiffness', label: 'Full-body stiffness' },
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioOption,
                  feeling === option.value && styles.radioOptionSelected,
                ]}
                onPress={() => setFeeling(option.value)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.radioCircle,
                  feeling === option.value && styles.radioCircleSelected,
                ]}>
                  {feeling === option.value && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tell me about the problem */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Can you tell me about the problem a bit more?</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="Describe your problem..."
            placeholderTextColor="#94a3b8"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate('AnkleDorsiflexion')}
        >
          <Text style={styles.submitBtnText}>Next Assessment</Text>
        </TouchableOpacity>
      </View>

      {/* View Data Section AFTER assessment */}
      <LinearGradient
        colors={[COLORS.success, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconCircle}>
            <Icon name="chart-line" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>View Data</Text>
          <Text style={styles.headerSubtitle}>Track your progress and insights</Text>
          <View style={styles.folderInputRow}>
            <TextInput
              placeholder="Enter folder name"
              style={styles.folderInput}
              value={folderName}
              onChangeText={text => setFolderName(text.toLowerCase())}
              placeholderTextColor="#d1fae5"
            />
          </View>
          <View style={{ alignItems: 'center', width: '100%', marginTop: 16 }}>
            <TouchableOpacity style={[styles.fetchButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 240 }]} onPress={fetchData}>
              <Icon name="clipboard-list" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.fetchButtonText}>View Assessment Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {loading && <ActivityIndicator size="large" style={{ marginVertical: 24 }} />}
      {noMatches && !loading && (
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <Text style={{ color: COLORS.error, fontSize: 16 }}>No matches found.</Text>
        </View>
      )}

      {feedback ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Assessment Feedback</Text>
          <Text>{feedback}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 36,
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 320,
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 16,
  },
  folderInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  folderInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    color: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  fetchButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  fetchButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  imagesSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
  },
  feedbackContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  assessmentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  assessmentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  cardDescription: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    borderColor: COLORS.success,
    backgroundColor: '#f0fdf4',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: COLORS.success,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  radioLabel: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  videoPlaceholder: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 14,
  },
  videoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  videoLabel: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    marginBottom: 10,
  },
  recordBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoText: {
    color: COLORS.text.primary,
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});
