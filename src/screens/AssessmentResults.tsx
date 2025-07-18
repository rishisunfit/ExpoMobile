import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { COLORS } from '../styles';

export default function AssessmentResults({ route, navigation }: any) {
  console.log('--- AssessmentResults ---');
  console.log('route.params received:', JSON.stringify(route?.params, null, 2));
  console.log('-------------------------');

  const { assessmentImage, assessmentImages: images, folderName, computedAssessments } = route?.params || {}; // Use `assessmentImages` and rename to `images`
  const imageUrl = assessmentImage || 'https://via.placeholder.com/300';

  // Use computedAssessments if provided, otherwise fallback to hardcoded
  const assessments = computedAssessments || [
    { title: 'Ankle Dorsiflexion', status: 'Great', leftStatus: 'Passing', rightStatus: 'Passing' },
    { title: 'Hip Internal Rotation', status: 'Great', leftStatus: 'Passing', rightStatus: 'Passing' },
    { title: 'Hip External Rotation', status: 'Great', leftStatus: 'Passing', rightStatus: 'Passing' },
    { title: 'Hamstring Mobility', status: 'Needs Work', leftStatus: 'Needs Work', rightStatus: 'Passing' },
    { title: 'Shoulder Internal Rotation', status: 'Needs Immediate Attention', leftStatus: 'Failing', rightStatus: 'Passing' },
    { title: 'Shoulder External Rotation', status: 'Great', leftStatus: 'Passing', rightStatus: 'Passing' },
    { title: 'Thoracic Rotation', status: 'Great', leftStatus: 'Passing', rightStatus: 'Passing' },
    { title: 'Hip Flexor Mobility', status: 'Untested', leftStatus: 'Untested', rightStatus: 'Untested' },
  ];

  // Custom scoring system
  function getScoreForStatus(status: string) {
    if (status === 'Passing' || status === 'Great') return 1;
    if (status === 'Needs Work' || status === 'Overactive') return 0.5;
    if (status === 'Failing' || status === 'Needs Immediate Attention') return 0;
    return null; // Untested or missing
  }
  let totalScore = 0;
  let maxPossible = 0;
  assessments.forEach((a: any) => {
    const left = getScoreForStatus(a.leftStatus);
    const right = getScoreForStatus(a.rightStatus);
    if (left !== null) {
      totalScore += left;
      maxPossible += 1;
    }
    if (right !== null) {
      totalScore += right;
      maxPossible += 1;
    }
  });
  const scoreDisplay = maxPossible > 0 ? `${totalScore}/${maxPossible}` : 'N/A';

  // Determine score color, oval background, and badge/icon based on score
  let scoreTextColor = COLORS.success;
  let scoreOvalBg = '#22c55e10'; // green bg
  let scoreContainerBg = '#22c55e10'; // green bg (default)
  let badgeIcon = 'trophy';
  let badgeColor: string = COLORS.success;
  let badgeText = 'Excellent Mobility';
  if (maxPossible > 0) {
    if (totalScore >= 14) {
      scoreTextColor = COLORS.success;
      scoreOvalBg = '#22c55e10';
      scoreContainerBg = '#22c55e10';
      badgeIcon = 'trophy';
      badgeColor = COLORS.success;
      badgeText = 'Excellent Mobility';
    } else if (totalScore >= 10) {
      scoreTextColor = COLORS.warning;
      scoreOvalBg = '#f59e0b10';
      scoreContainerBg = '#f59e0b10';
      badgeIcon = 'thumbs-up';
      badgeColor = '#f97316'; // orange
      badgeText = 'Average Mobility';
    } else {
      scoreTextColor = COLORS.error;
      scoreOvalBg = '#ef444410';
      scoreContainerBg = '#ef444410';
      badgeIcon = 'frown';
      badgeColor = '#ef4444'; // red
      badgeText = 'Below Average Mobility';
    }
  }

  const getAssessmentStyle = (statusCategory: string) => {
    if (statusCategory === "Great") {
      return {
        icon: 'check',
        iconColor: COLORS.success,
        containerStyle: styles.resultItemSuccess,
        iconWrapStyle: styles.resultItemIconWrapSuccess,
        textColor: COLORS.success,
        badgeText: 'Great',
        statusText: 'Great mobility!',
        score: 9.5,
        scoreMax: 10,
      };
    }
    if (statusCategory === 'Needs Work') {
      return {
        icon: 'exclamation',
        iconColor: COLORS.warning,
        containerStyle: styles.resultItemWarning,
        iconWrapStyle: styles.resultItemIconWrapWarning,
        textColor: COLORS.warning,
        badgeText: 'Needs Work',
        statusText: 'Needs improvement',
        score: 6.5,
        scoreMax: 10,
      };
    }
    if (statusCategory === 'Needs Immediate Attention') {
      return {
        icon: 'exclamation-triangle',
        iconColor: COLORS.error,
        containerStyle: styles.resultItemDanger,
        iconWrapStyle: styles.resultItemIconWrapDanger,
        textColor: COLORS.error,
        badgeText: 'Requires Attention',
        statusText: 'Needs immediate attention',
        score: 4.2,
        scoreMax: 10,
      };
    }
    return {
      icon: 'minus-circle',
      iconColor: COLORS.text.secondary,
      containerStyle: styles.resultItemUntested,
      iconWrapStyle: styles.resultItemIconWrapUntested,
      textColor: COLORS.text.secondary,
      badgeText: 'Untested',
      statusText: 'No data yet',
      score: null,
      scoreMax: null
    };
  };

  const sortedAssessments = [
    ...assessments.filter((a: any) => a.status !== 'Untested'),
    ...assessments.filter((a: any) => a.status === 'Untested'),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Assessment Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardInner}>
            <View style={styles.statusCardIconWrap}>
              <Icon name="check" size={36} color={COLORS.success} />
            </View>
            <Text style={styles.statusCardTitle}>Assessment Complete!</Text>
            <Text style={styles.statusCardDesc}>Great job! Take a look at your results below.</Text>
            <View style={[styles.statusCardScoreWrap, { backgroundColor: scoreContainerBg }]}>
              <Text style={styles.statusCardScoreLabel}>Overall Score</Text>
              <View style={{ backgroundColor: scoreOvalBg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, alignSelf: 'center', marginTop: 4 }}>
                <Text style={[styles.statusCardScore, { color: scoreTextColor }]}>{scoreDisplay}</Text>
              </View>
            </View>
            <View style={[styles.statusCardBadgeWrap, { backgroundColor: badgeColor as string }]}>
              <Icon name={badgeIcon} size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.statusCardBadgeText}>{badgeText}</Text>
            </View>
          </View>
        </View>

        {/* Assessment Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoCard}>
            <Text style={styles.photoTitle}>Assessment Analysis</Text>
            <View style={styles.photoImageWrap}>
              <Image source={{ uri: imageUrl }} style={styles.photoImage} resizeMode="cover" />
            </View>
            <Text style={styles.photoTimestamp}>Captured on March 15, 2024 at 2:30 PM</Text>
          </View>
        </View>

        {/* Detailed Results */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Detailed Results</Text>
            {sortedAssessments.map((a: any) => {
              const style = getAssessmentStyle(a.status);

              return (
                <TouchableOpacity
                  key={a.title}
                  style={style.containerStyle}
                  onPress={() => {
                    navigation.navigate('AssessmentDetailsScreen', {
                      title: a.title,
                      status: a.status,
                      score: style.score,
                      scoreMax: style.scoreMax,
                      statusColor: style.iconColor,
                      statusIcon: style.icon,
                      statusText: style.badgeText,
                      photoUrl: imageUrl,
                      date: 'March 15, 2024 at 2:30 PM',
                      angle: 90,
                      angleTarget: 90,
                      range: 'Full',
                      testResults: [],
                      recommendedExercises: [],
                      images: images, // Pass the images array forward
                      folderName: folderName, // Pass the folderName
                    });
                  }}
                >
                  <View style={style.iconWrapStyle}>
                    <Icon name={style.icon} size={16} color={style.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultItemTitle}>{a.title}</Text>
                    <Text style={[styles.resultItemDesc, { fontWeight: 'bold', color: style.textColor }]}>{a.status}</Text>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-right" size={16} color={COLORS.text.secondary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  statusCardInner: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statusCardIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusCardDesc: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusCardScoreWrap: {
    backgroundColor: '#22c55e10',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusCardScoreLabel: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  statusCardScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
  },
  statusCardBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusCardBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  photoImageWrap: {
    width: '100%',
    height: 192,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  photoTimestamp: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  resultsSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
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
  resultItemSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e10',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  resultItemWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b10',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  resultItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444410',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  resultItemUntested: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  resultItemIconWrapSuccess: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultItemIconWrapWarning: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultItemIconWrapDanger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultItemIconWrapUntested: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultItemDesc: {
    fontSize: 12,
    color: '#64748b',
  },
}); 