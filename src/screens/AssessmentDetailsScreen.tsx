import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../styles';
import { supabase } from '../../lib/supabase'; // Import supabase client
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import { folderNameToEmail } from '../utils/formatters';

const formatDate = (isoString: string | null): string | null => {
  if (!isoString) return null;
  try {
    const dateObj = new Date(isoString);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}-${day}-${year}`;
  } catch (e) {
    console.error('Failed to format date', e);
    return null;
  }
};

const rangeOfMotionStandards: Record<string, any[]> = {
  'ankle_dorsiflex': [
    { max: 40, status: 'Overactive', color: COLORS.secondary },
    { min: 40, max: 60, status: 'Passing', color: COLORS.success },
    { min: 60, max: 67, status: 'Needs Work', color: COLORS.warning },
    { min: 67, status: 'Failing', color: COLORS.error },
  ],
  'hip_internal_rotation': [
    { max: 20, status: 'Failing', color: COLORS.error },
    { min: 20, max: 25, status: 'Needs Work', color: COLORS.warning },
    { min: 25, max: 35, status: 'Passing', color: COLORS.success },
    { min: 35, status: 'Overactive', color: COLORS.secondary },
  ],
  'hip_external_rotation': [
    { max: 5, status: 'Overactive', color: COLORS.secondary },
    { min: 5, max: 15, status: 'Passing', color: COLORS.success },
    { min: 15, max: 20, status: 'Needs Work', color: COLORS.warning },
    { min: 20, status: 'Failing', color: COLORS.error },
  ],
  'hamstrings': [
    { max: 5, status: 'Overactive', color: COLORS.secondary },
    { min: 5, max: 20, status: 'Passing', color: COLORS.success },
    { min: 20, max: 25, status: 'Needs Work', color: COLORS.warning },
    { min: 25, status: 'Failing', color: COLORS.error },
  ],
  'hipflexors': [
    { max: 135, status: 'Failing', color: COLORS.error },
    { min: 135, max: 145, status: 'Needs Work', color: COLORS.warning },
    { min: 145, status: 'Passing', color: COLORS.success },
  ],
  'thoracic_rotation': [
    { max: 35, status: 'Overactive', color: COLORS.secondary },
    { min: 35, max: 50, status: 'Passing', color: COLORS.success },
    { min: 50, max: 55, status: 'Needs Work', color: COLORS.warning },
    { min: 55, status: 'Failing', color: COLORS.error },
  ],
  'shoulder_external_rotation': [
    { max: 65, status: 'Failing', color: COLORS.error },
    { min: 65, max: 75, status: 'Needs Work', color: COLORS.warning },
    { min: 75, status: 'Passing', color: COLORS.success },
  ],
  'shoulder_internal_rotation': [
    { max: 50, status: 'Failing', color: COLORS.error },
    { min: 50, max: 60, status: 'Needs Work', color: COLORS.warning },
    { min: 60, max: 90, status: 'Passing', color: COLORS.success },
    { min: 90, status: 'Overactive', color: COLORS.secondary },
  ],
};

const getRangeOfMotionStatus = (jointName: string, angle: number | null) => {
  if (angle === null) return { status: 'N/A', color: COLORS.text.secondary };

  const standards = rangeOfMotionStandards[jointName];
  if (!standards) return { status: 'N/A', color: COLORS.text.secondary };

  for (const standard of standards) {
    // This logic handles ranges like [20, 25)
    if (standard.min !== undefined && standard.max !== undefined) {
      if (angle >= standard.min && angle < standard.max) {
        return { status: standard.status, color: standard.color };
      }
    } 
    // This logic handles ranges like < 20
    else if (standard.max !== undefined) {
      if (angle < standard.max) {
        return { status: standard.status, color: standard.color };
      }
    }
  }
  
  // This handles the final case, like >= 35
  const lastStandard = standards[standards.length - 1];
  if (lastStandard.min !== undefined && angle >= lastStandard.min) {
    return { status: lastStandard.status, color: lastStandard.color };
  }

  return { status: 'N/A', color: COLORS.text.secondary };
};

const formatTargetRange = (range: { min?: number; max?: number } | null): string => {
  if (!range) return 'N/A';
  if (range.min !== undefined && range.max !== undefined) {
    return `${range.min}° - ${range.max}°`;
  }
  if (range.min !== undefined) {
    return `> ${range.min}°`;
  }
  if (range.max !== undefined) {
    return `< ${range.max}°`;
  }
  return 'N/A';
};

const assessmentToExercises: Record<string, string[]> = {
  'Ankle Dorsiflexion': ['Deep Calf Raise', 'Deep Calf Stretch', 'Tibia CAR'],
  'Hip Internal Rotation': ['90-90', 'Side Lunge'],
  'Hip External Rotation': ['Pigeon Raise', '90-90'],
  'Hamstring Mobility': ['90-90', 'Dynamic Cross-Body Hamstring Stretch', 'Single-Leg RDL'],
  'Hip Flexor Mobility': ['Hip Flexor Stretch', 'Cable Psoas Raise'],
  'Thoracic Rotation': ['Thoracic Rotation', 'Paloff Press'],
  'Shoulder Internal Rotation': ['Sleeper Stretch', 'Dumbbell External Rotation'],
  'Shoulder External Rotation': ['PVC High Elbow', 'Cable Face Pull'],
};

// 1. Add the mapping for joint+status to blurb and title
const testResultBlurbs: Record<string, Record<string, { title: string; blurb: string }>> = {
  'Ankle Dorsiflexion': {
    Failing: {
      title: 'Limited ankle mobility',
      blurb: 'Limited ankle mobility can restrict squat depth and shift stress into the knees.'
    },
    'Needs Work': {
      title: 'Improve ankle range',
      blurb: 'Ankle range could improve, which helps with smoother squats and lunges.'
    },
    Passing: {
      title: 'Maintain current ankle routine',
      blurb: 'Ankle mobility looks solid, nothing to fix here.'
    },
    Overactive: {
      title: 'Focus on control and stability',
      blurb: 'You’ve got plenty of range, now focus on joint control and stability.'
    },
    Asymmetry: {
      title: 'Address ankle asymmetry',
      blurb: 'There’s a noticeable difference between sides, which can throw off your squat or gait.'
    },
  },
  'Hip Internal Rotation': {
    Failing: {
      title: 'Stiff hips',
      blurb: 'Stiff hips can make knees collapse inward and put pressure on the low back.'
    },
    'Needs Work': {
      title: 'Improve hip rotation',
      blurb: 'Improving hip rotation helps with balanced movement and back relief.'
    },
    Passing: {
      title: 'Maintain current hip routine',
      blurb: 'Hip rotation looks clean, you\'re moving well.'
    },
    Overactive: {
      title: 'Focus on control and stability',
      blurb: 'You\'ve got great range, now shift focus to control and stability.'
    },
    Asymmetry: {
      title: 'Address hip asymmetry',
      blurb: 'One hip is moving more than the other, which can mess with walking or squatting.'
    },
  },
  'Hip External Rotation': {
    Failing: {
      title: 'Limited external rotation',
      blurb: 'Limited external rotation makes deep squats and stride rotation harder.'
    },
    'Needs Work': {
      title: 'Improve external rotation',
      blurb: 'More range here can improve squat depth and ease knee strain.'
    },
    Passing: {
      title: 'Maintain current hip routine',
      blurb: 'External rotation looks good, no changes needed.'
    },
    Overactive: {
      title: 'Focus on stability',
      blurb: 'You\'ve got range to spare, now let’s stabilize it.'
    },
    Asymmetry: {
      title: 'Address hip asymmetry',
      blurb: 'Side-to-side hip differences can shift force into your knees or spine.'
    },
  },
  'Hamstrings': {
    Failing: {
      title: 'Tight hamstrings',
      blurb: 'Tight hamstrings limit hinges and force the back to overwork.'
    },
    'Needs Work': {
      title: 'Improve hamstring mobility',
      blurb: 'A little mobility work can clean up your hinges and deadlifts.'
    },
    Passing: {
      title: 'Maintain current hamstring routine',
      blurb: 'Hamstring range looks great, nothing to worry about.'
    },
    Overactive: {
      title: 'Focus on strength and control',
      blurb: 'Long hamstrings are fine, but don’t forget to strengthen and control that range.'
    },
    Asymmetry: {
      title: 'Address hamstring asymmetry',
      blurb: 'Imbalanced hamstring length can affect posture and gait.'
    },
  },
  'Hip Flexors': {
    Failing: {
      title: 'Tight hip flexors',
      blurb: 'Tight hip flexors tilt your pelvis forward and overload the lower back.'
    },
    'Needs Work': {
      title: 'Loosen hip flexors',
      blurb: 'Loosening this up helps with stride length and hip drive.'
    },
    Passing: {
      title: 'Maintain current hip flexor routine',
      blurb: 'Hip extension looks good, you\'re in a great spot.'
    },
    Overactive: {
      title: 'Focus on strength in range',
      blurb: 'You’ve got the range, now it’s time to build strength in it.'
    },
    Asymmetry: {
      title: 'Address hip flexor asymmetry',
      blurb: 'One side\'s tighter than the other, which can mess with stride or hip balance.'
    },
  },
  'Thoracic Rotation': {
    Failing: {
      title: 'Poor upper spine rotation',
      blurb: 'Poor upper spine rotation can shift stress into the neck and low back.'
    },
    'Needs Work': {
      title: 'Improve thoracic mobility',
      blurb: 'A little mobility here goes a long way for posture and rotation.'
    },
    Passing: {
      title: 'Maintain current thoracic routine',
      blurb: 'T-spine is moving well, keep it going.'
    },
    Overactive: {
      title: 'Focus on core control',
      blurb: 'You’re rotating well, now dial in core control.'
    },
    Asymmetry: {
      title: 'Address thoracic asymmetry',
      blurb: 'Uneven upper spine motion can affect swings, presses, or reach.'
    },
  },
  'Shoulder Internal Rotation': {
    Failing: {
      title: 'Tight internal rotation',
      blurb: 'Tight IR limits reaching behind your back and compresses the front of the shoulder.'
    },
    'Needs Work': {
      title: 'Improve shoulder IR',
      blurb: 'More range here helps with daily movements and reduces joint stress.'
    },
    Passing: {
      title: 'Maintain current shoulder routine',
      blurb: 'Shoulder mobility is looking good here.'
    },
    Overactive: {
      title: 'Focus on cuff control',
      blurb: 'You’ve got the motion, now support it with cuff control.'
    },
    Asymmetry: {
      title: 'Address shoulder asymmetry',
      blurb: 'Rotation imbalance between shoulders can affect pressing or pulling.'
    },
  },
  'Shoulder External Rotation': {
    Failing: {
      title: 'Poor external rotation',
      blurb: 'Poor ER makes overhead lifts tough and puts the joint at risk.'
    },
    'Needs Work': {
      title: 'Improve shoulder ER',
      blurb: 'Building this range helps with comfort and safer overhead work.'
    },
    Passing: {
      title: 'Maintain current shoulder routine',
      blurb: 'ER is right where it should be.'
    },
    Overactive: {
      title: 'Focus on strength in range',
      blurb: 'You’ve got a ton of motion, now build strength to match.'
    },
    Asymmetry: {
      title: 'Address shoulder asymmetry',
      blurb: 'One side’s rotating more, which can affect your pressing or reach.'
    },
  },
};

export default function AssessmentDetailsScreen({ route, navigation }: any) {
  // Example dynamic data (replace with route.params or props as needed)
  const {
    title = 'Shoulder Mobility',
    status = 'Needs Improvement',
    score = 4.2,
    scoreMax = 10,
    statusColor = COLORS.error || '#ef4444',
    statusIcon = 'exclamation-triangle',
    statusText = 'Requires Attention',
    photoUrl = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f27952a36c-37a5ffe4cc416288fcf1.png',
    angle = 85,
    angleTarget = 180,
    range = 'Limited',
    testResults = [
      {
        label: 'Forward Flexion',
        value: '85° of 180°',
        status: 'FAIL',
        statusColor: COLORS.error,
        icon: 'times',
        bg: '#fee2e2',
        border: '#fecaca',
      },
      {
        label: 'Abduction',
        value: '120° of 180°',
        status: 'NEEDS WORK',
        statusColor: COLORS.warning,
        icon: 'exclamation',
        bg: '#fef3c7',
        border: '#fde68a',
      },
      {
        label: 'Internal Rotation',
        value: '35° of 70°',
        status: 'FAIL',
        statusColor: COLORS.error,
        icon: 'times',
        bg: '#fee2e2',
        border: '#fecaca',
      },
    ],
  } = route?.params || {};

  // --- New recommended exercises logic ---
  const mappedExercises = assessmentToExercises[title] || [];
  const recommendedExercises = mappedExercises.map((name) => ({
    label: name,
    detail: '3 sets × 12 reps', // Default for now
    icon: 'dumbbell',           // Default for now
    tag: 'PRIORITY',
    tagColor: COLORS.accent,
    bg: '#f1f5f9',
  }));

  const { folderName } = route.params;

  const [leftAngle, setLeftAngle] = useState<number | null>(null);
  const [rightAngle, setRightAngle] = useState<number | null>(null);
  const [leftDate, setLeftDate] = useState<string | null>(null);
  const [rightDate, setRightDate] = useState<string | null>(null);
  const [leftRomStatus, setLeftRomStatus] = useState({ status: '...', color: COLORS.text.secondary });
  const [rightRomStatus, setRightRomStatus] = useState({ status: '...', color: COLORS.text.secondary });
  const [isLoading, setIsLoading] = useState(true);

  // Define standards for target angles
  const targetAngleStandards: Record<string, { min?: number; max?: number }> = {
    'Ankle Dorsiflexion': { min: 40, max: 60 },
    'Hip Internal Rotation': { min: 25, max: 35 },
    'Hip External Rotation': { min: 5, max: 15 },
    'Hamstring Mobility': { min: 5, max: 20 },
    'Hip Flexor Mobility': { min: 145 },
    'Thoracic Rotation': { min: 35, max: 50 },
    'Shoulder External Rotation': { min: 75, max: 90 },
    'Shoulder Internal Rotation': { min: 60, max: 90 },
  };
  const targetAngleRange = targetAngleStandards[title] || null;

  // Test result logic (must be after leftRomStatus, rightRomStatus, title)
  const getTestResultStatus = () => {
    if (leftRomStatus.status === rightRomStatus.status) {
      return leftRomStatus.status;
    }
    return 'Asymmetry';
  };
  const testResultStatus = getTestResultStatus();
  // Normalize title for test result blurbs lookup
  const normalizedTitle = (() => {
    if (title === 'Hamstring Mobility') return 'Hamstrings';
    if (title === 'Hip Flexor Mobility') return 'Hip Flexors';
    return title;
  })();
  const testResult = testResultBlurbs[normalizedTitle]?.[testResultStatus];

  useEffect(() => {
    const fetchAngles = async () => {
      setIsLoading(true);
      
      if (!folderName) {
        console.error('No folderName provided');
        setIsLoading(false);
        return;
      }
      
      // Convert folderName back to email format
      const userEmail = folderNameToEmail(folderName);


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

      const jointName = jointMapping[title];
      if (!jointName) {
        console.error('No joint mapping for title:', title);
        setIsLoading(false);
        return;
      }

      console.log(`Fetching angles for email/name: ${userEmail}, joint: ${jointName}`);

      // Fetch Left Angle
      const { data: leftData, error: leftError } = await supabase
        .from('mobilityassessments')
        .select('min_angle, created_at')
        .or(`email.eq.${userEmail},name.eq.${userEmail}`)
        .eq('joint', jointName)
        .eq('side', 'L')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('Left Angle Query Result:', { data: leftData, error: leftError });

      if (leftError && leftError.code !== 'PGRST116') { // PGRST116 = 'single row not found'
        console.error('Error fetching left angle:', leftError.message);
        setLeftRomStatus({ status: 'Error', color: COLORS.text.secondary });
      } else if (leftData) {
        const angle = leftData.min_angle;
        setLeftAngle(angle);
        setLeftRomStatus(getRangeOfMotionStatus(jointName, angle));
        setLeftDate(leftData.created_at);
      } else {
        setLeftAngle(null); // Explicitly set to null if no data
        setLeftDate(null);
      }

      // Fetch Right Angle
      const { data: rightData, error: rightError } = await supabase
        .from('mobilityassessments')
        .select('min_angle, created_at')
        .or(`email.eq.${userEmail},name.eq.${userEmail}`)
        .eq('joint', jointName)
        .eq('side', 'R')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      console.log('Right Angle Query Result:', { data: rightData, error: rightError });

      if (rightError && rightError.code !== 'PGRST116') { // PGRST116 = 'single row not found'
        console.error('Error fetching right angle:', rightError.message);
        setRightRomStatus({ status: 'Error', color: COLORS.text.secondary });
      } else if (rightData) {
        const angle = rightData.min_angle;
        setRightAngle(angle);
        setRightRomStatus(getRangeOfMotionStatus(jointName, angle));
        setRightDate(rightData.created_at);
      } else {
        setRightAngle(null); // Explicitly set to null if no data
        setRightDate(null);
      }

      setIsLoading(false);
    };

    fetchAngles();
  }, [title, folderName]);


  // Accept images array from params (array of { name, url })
  const images = route?.params?.images || [];

  // Map assessment titles to left/right photo filenames
  const photoFilenames: Record<string, { left: string; right: string }> = {
    'Ankle Dorsiflexion': {
      left: 'ankle_dorsiflexion_L.jpg',
      right: 'ankle_dorsiflexion_R.jpg',
    },
    'Hip Internal Rotation': {
      left: 'hip_IR_L.jpg',
      right: 'hip_IR_R.jpg',
    },
    'Hip External Rotation': {
      left: 'hip_external_rotation_L.jpg',
      right: 'hip_external_rotation_R.jpg',
    },
    'Hamstring Mobility': {
      left: 'hamstrings_L.jpg',
      right: 'hamstrings_R.jpg',
    },
    'Hip Flexor Mobility': {
      left: 'hipflexor_L.jpeg',
      right: 'hipflexor_R.jpeg',
    },
    'Thoracic Rotation': {
      left: 'thoracic_rotation_L.jpeg',
      right: 'thoracic_rotation_R.jpeg',
    },
    'Shoulder External Rotation': {
      left: 'shoulder_er_L.jpeg',
      right: 'shoulder_er_R.jpeg',
    },
    'Shoulder Internal Rotation': {
      left: 'shoulder_ir_L.jpeg',
      right: 'shoulder_ir_R.jpeg',
    },
  };

  // Get the correct filenames for the current assessment
  const currentPhotoFiles = photoFilenames[title] || {
    left: 'https://via.placeholder.com/300',
    right: 'https://via.placeholder.com/300',
  };

  // Find the URLs from the images array by name
  const leftImageObj = images.find((img: any) => img.name === currentPhotoFiles.left);
  const rightImageObj = images.find((img: any) => img.name === currentPhotoFiles.right);
  const leftPhotoUrl = leftImageObj?.url || 'https://via.placeholder.com/300';
  const rightPhotoUrl = rightImageObj?.url || 'https://via.placeholder.com/300';

  const getAngleLabel = (assessmentTitle: string) => {
    const mappings: Record<string, string> = {
      'Ankle Dorsiflexion': 'Ankle Angle',
      'Hip Internal Rotation': 'Hip IR Angle',
      'Hip External Rotation': 'Hip ER Angle',
      'Shoulder Internal Rotation': 'Shoulder IR Angle',
      'Shoulder External Rotation': 'Shoulder ER Angle',
      'Thoracic Rotation': 'Thoracic Angle',
      'Hamstring Mobility': 'Hamstring Angle',
      'Hip Flexor Mobility': 'Hip Flexor Angle',
    };
    return mappings[assessmentTitle] || 'Angle';
  };

  const angleLabel = getAngleLabel(title);
  const formattedLeftDate = formatDate(leftDate);
  const formattedRightDate = formatDate(rightDate);
  const formattedTarget = formatTargetRange(targetAngleRange);

  const statusToIcon: Record<string, string> = {
    Passing: 'star',
    Failing: 'circle-exclamation',
    'Needs Work': 'wrench',
    Overactive: 'bolt',
    Asymmetry: 'scale-unbalanced',
    // fallback
    default: 'info-circle',
  };

  const iconName = statusToIcon[testResultStatus] || statusToIcon.default;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="share" size={20} color="#1f2937" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Assessment Photo (Left) */}
        <View style={styles.photoSection}>
          <View style={styles.photoCard}>
            <Text style={styles.photoTitle}>{title} Left</Text>
            <View style={styles.photoImageWrap}>
              <Image
                source={{ uri: leftPhotoUrl }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              {/* Angle Overlay */}
              <View style={styles.angleOverlay}>
                <Text style={styles.angleOverlayLabel}>{angleLabel}</Text>
                <Text style={[styles.angleOverlayValue, { color: leftRomStatus.color }]}>
                  {isLoading ? '...' : `${leftAngle !== null ? Math.round(leftAngle) : 'N/A'}°`}
                </Text>
                <Text style={styles.angleOverlayTarget}>Target: {formattedTarget}</Text>
              </View>
              {/* Range Indicator */}
              <View style={styles.rangeOverlay}>
                <Text style={styles.rangeOverlayLabel}>Range of Motion</Text>
                <Text style={[styles.rangeOverlayValue, { color: leftRomStatus.color }]}>
                  {isLoading ? '...' : leftRomStatus.status}
                </Text>
              </View>
            </View>
            {formattedLeftDate && <Text style={styles.photoTimestamp}>Captured on {formattedLeftDate}</Text>}
          </View>
        </View>

        {/* Assessment Photo 2 (Right) */}
        <View style={styles.photoSection}>
          <View style={styles.photoCard}>
            <Text style={styles.photoTitle}>{title} Right</Text>
            <View style={styles.photoImageWrap}>
              <Image
                source={{ uri: rightPhotoUrl }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              {/* Angle Overlay */}
              <View style={styles.angleOverlay}>
                <Text style={styles.angleOverlayLabel}>{angleLabel}</Text>
                <Text style={[styles.angleOverlayValue, { color: rightRomStatus.color }]}>
                  {isLoading ? '...' : `${rightAngle !== null ? Math.round(rightAngle) : 'N/A'}°`}
                </Text>
                <Text style={styles.angleOverlayTarget}>Target: {formattedTarget}</Text>
              </View>
              {/* Range Indicator */}
              <View style={styles.rangeOverlay}>
                <Text style={styles.rangeOverlayLabel}>Range of Motion</Text>
                <Text style={[styles.rangeOverlayValue, { color: rightRomStatus.color }]}>
                  {isLoading ? '...' : rightRomStatus.status}
                </Text>
              </View>
            </View>
            {formattedRightDate && <Text style={styles.photoTimestamp}>Captured on {formattedRightDate}</Text>}
          </View>
        </View>
        {/* Result Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardInner}>
            <View style={[styles.statusCardIconWrap, { backgroundColor: statusColor + '20' }]}> {/* 20 = 12% opacity */}
              <Icon name={statusIcon} size={32} color={statusColor} />
            </View>
            <Text style={styles.statusCardTitle}>{status}</Text>
            <Text style={styles.statusCardDesc}>Your shoulder mobility could benefit from targeted exercises.</Text>
            <View style={[styles.statusCardScoreWrap, { backgroundColor: statusColor + '10' }]}> {/* 10 = 6% opacity */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="gauge-high" size={18} color={statusColor} style={{ marginRight: 6 }} />
                <Text style={styles.statusCardScoreLabel}>Mobility Score</Text>
              </View>
              <Text style={[styles.statusCardScore, { color: statusColor }]}>{score}/{scoreMax}</Text>
            </View>
            <View style={styles.statusCardBadgeWrap}>
              <Icon name="flag" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.statusCardBadgeText}>{statusText}</Text>
            </View>
          </View>
        </View>
        {/* Detailed Results */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {leftRomStatus.status !== rightRomStatus.status ? (
              <View style={styles.testResultCardWrap}>
                <View style={[styles.testResultCard, styles.testResultCardInfo]}>
                  <View style={[styles.testResultIconWrap, { backgroundColor: statusToIcon[leftRomStatus.status] === 'star' ? '#22c55e' : '#2563eb' }]}> 
                    <Icon
                      name={statusToIcon[leftRomStatus.status] || statusToIcon.default}
                      size={22}
                      color={'#fff'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testResultTitle}>Left: {testResultBlurbs[normalizedTitle]?.[leftRomStatus.status]?.title || leftRomStatus.status}</Text>
                    <Text style={styles.testResultBlurb}>{testResultBlurbs[normalizedTitle]?.[leftRomStatus.status]?.blurb}</Text>
                  </View>
                </View>
                <View style={[styles.testResultCard, styles.testResultCardInfo]}>
                  <View style={[styles.testResultIconWrap, { backgroundColor: statusToIcon[rightRomStatus.status] === 'star' ? '#22c55e' : '#2563eb' }]}> 
                    <Icon
                      name={statusToIcon[rightRomStatus.status] || statusToIcon.default}
                      size={22}
                      color={'#fff'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testResultTitle}>Right: {testResultBlurbs[normalizedTitle]?.[rightRomStatus.status]?.title || rightRomStatus.status}</Text>
                    <Text style={styles.testResultBlurb}>{testResultBlurbs[normalizedTitle]?.[rightRomStatus.status]?.blurb}</Text>
                  </View>
                </View>
              </View>
            ) : (
              testResult && (
                <View style={styles.testResultCardWrap}>
                  <View style={[styles.testResultCard, testResultStatus === 'Passing' ? styles.testResultCardSuccess : styles.testResultCardInfo]}>
                    <View style={[styles.testResultIconWrap, { backgroundColor: testResultStatus === 'Passing' ? '#22c55e' : '#2563eb' }]}> 
                      <Icon
                        name={statusToIcon[testResultStatus] || statusToIcon.default}
                        size={22}
                        color={'#fff'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.testResultTitle}>{testResult.title}</Text>
                      <Text style={styles.testResultBlurb}>{testResult.blurb}</Text>
                    </View>
                  </View>
                </View>
              )
            )}
            {testResults.map((result: any, idx: number) => (
              <View key={idx} style={[styles.resultItem, { backgroundColor: result.bg, borderColor: result.border }]}> 
                <View style={styles.resultItemLeft}>
                  <View style={[styles.resultItemIconWrap, { backgroundColor: result.bg }]}> 
                    <Icon name={result.icon} size={20} color={result.statusColor} />
                  </View>
                  <View>
                    <Text style={styles.resultItemLabel}>{result.label}</Text>
                    <Text style={styles.resultItemValue}>{result.value}</Text>
                  </View>
                </View>
                <Text style={[styles.resultItemStatus, { color: result.statusColor, backgroundColor: result.bg }]}>{result.status}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Recommended Exercises */}
        <View style={styles.exercisesSection}>
          <View style={styles.exercisesCard}>
            <Text style={styles.exercisesTitle}>Recommended Exercises</Text>
            {recommendedExercises.map((ex: any, idx: number) => (
              <View key={idx} style={[styles.exerciseItem, { backgroundColor: ex.bg }]}> 
                <View style={styles.exerciseItemIconWrap}>
                  <Image
                    source={{ uri: 'https://imagedelivery.net/RmxXwzgidoKx5dUTIW9KWw/386e4903-204f-411e-cfd6-47834a2f4500/public' }}
                    style={styles.exerciseImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseItemLabel}>{ex.label}</Text>
                  <Text style={styles.exerciseItemDetail}>{ex.detail}</Text>
                </View>
                <View style={[styles.exerciseItemTag, { backgroundColor: ex.tagColor + '20' }]}> 
                  <Text style={[styles.exerciseItemTagText, { color: ex.tagColor }]}>{ex.tag}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtnPrimary}>
            <Icon name="play" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.actionBtnPrimaryText}>Start Exercise Program</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Icon name="calendar-plus" size={18} color={COLORS.accent} style={{ marginRight: 10 }} />
            <Text style={styles.actionBtnSecondaryText}>Schedule Retest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Placeholder styles to avoid linter errors
const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statusIcon: {
    color: '#1f2937',
    marginLeft: 4,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusCardInner: {
    alignItems: 'center',
  },
  statusCardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  statusCardDesc: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusCardScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  statusCardScoreLabel: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  statusCardScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusCardBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  statusCardBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  photoSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginLeft: -16,  // Offset to the left
    marginRight: -16, // Adjust for the offset
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  photoImageWrap: {
    position: 'relative',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photoImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  angleOverlay: {
    position: 'absolute',
    top: 12,
    right: 12, // Align to the right
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  angleOverlayLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  angleOverlayValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  angleOverlayTarget: {
    fontSize: 12,
    color: '#64748b',
  },
  rangeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12, // Align to the right
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  rangeOverlayLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  rangeOverlayValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  photoTimestamp: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  resultsSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  resultItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultItemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultItemValue: {
    fontSize: 13,
    color: '#64748b',
  },
  resultItemStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exercisesSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  exercisesCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  exerciseItemIconWrap: {
    width: 90, // 44 * 1.2
    height: 90, // 44 * 1.2
    borderRadius: 16, // slightly more rounded for larger image
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  exerciseItemDetail: {
    fontSize: 13,
    color: '#64748b',
  },
  exerciseItemTag: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  exerciseItemTagText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  actionBtnPrimary: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionBtnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    color: '#22c55e',
    fontWeight: '600',
    fontSize: 16,
  },
  testResultCardWrap: {
    marginBottom: 24,
  },
  testResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  testResultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  testResultCardInfo: {
    backgroundColor: '#e0edff', // light blue
  },
  testResultCardSuccess: {
    backgroundColor: '#e6faea', // light green
  },
  testResultIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  testResultTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 2,
  },
  testResultBlurb: {
    color: '#64748b',
    fontSize: 14,
  },
});
