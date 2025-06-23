import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function WorkoutsScreen({ navigation }: any) {
  const [workoutName, setWorkoutName] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysWorkout = async () => {
      try {
        console.log('🚀 Fetching today\'s workout...');
        
        // Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Auth error:', authError);
          setWorkoutName('Auth Error');
          return;
        }
        
        if (user) {
          console.log('👤 Current user ID:', user.id);
          
          const { data, error } = await supabase.rpc('get_current_program_day', {
            client_uuid: user.id
          });
          
          console.log('📡 RPC Response - Data:', data);
          console.log('📡 RPC Response - Error:', error);
          
          if (error) {
            console.error('❌ Error fetching workout:', error);
            setWorkoutName('Workout Not Found');
          } else {
            console.log('✅ Today\'s workout data:', JSON.stringify(data, null, 2));
            
            // Assuming the RPC returns an array, take the first workout's name
            if (data && data.length > 0) {
              console.log('🏋️ First workout object:', data[0]);
              console.log('🏋️ Workout name field:', data[0].workout_name);
              setWorkoutName(data[0].workout_name || 'Workout Not Found');
            } else {
              console.log('📭 No workouts found in data');
              setWorkoutName('No Workout Today');
            }
          }
        } else {
          console.log('❌ No user found');
          setWorkoutName('User Not Found');
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setWorkoutName('Error Loading Workout');
      } finally {
        setLoading(false);
        console.log('🏁 Finished loading workout');
      }
    };

    fetchTodaysWorkout();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Today's Session */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography.H2>Today's Session</Typography.H2>
              <TouchableOpacity>
                <Text style={styles.link}>View All</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.sessionCard}>
              <View style={styles.sessionImageWrapper}>
                <Image
                  source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f87bb8eb54-5dacafe011510304ef67.png' }}
                  style={styles.sessionImage}
                  resizeMode="cover"
                />
                <View style={styles.sessionDuration}>
                  <Text style={styles.sessionDurationText}>45 min</Text>
                </View>
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionTitleRow}>
                  <View>
                    <Typography.H2 style={styles.sessionTitle}>{workoutName}</Typography.H2>
                    <Typography.Subtext>Focus on form and control</Typography.Subtext>
                  </View>
                  <View style={styles.sessionLevelTagWrapper}>
                    <Text style={styles.sessionLevelTag}>Intermediate</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.sessionButton}
                  onPress={() => navigation.navigate('TodaysWorkout')}
                >
                  <Icon name="play" size={14} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.sessionButtonText}>Start Session</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* My Calendar */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography.H2>My Calendar</Typography.H2>
              <TouchableOpacity>
                <Text style={styles.link}>Full View</Text>
              </TouchableOpacity>
            </View>
            <Card style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Typography.Body style={styles.calendarMonth}>June 2024</Typography.Body>
                <View style={styles.calendarNav}>
                  <TouchableOpacity style={styles.calendarNavBtn}>
                    <Icon name="chevron-left" size={14} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.calendarNavBtn}>
                    <Icon name="chevron-right" size={14} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Calendar Days */}
              <View style={styles.calendarGrid}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <Text key={`${d}-${i}`} style={styles.calendarDayHeader}>{d}</Text>
                ))}
                {/* Dates: static for now */}
                {[26,27,28,29,30,31,1,2,3,4,5,6,7,8].map((date, i) => {
                  let style = styles.calendarDate;
                  if (date === 2 || date === 8) style = [style, styles.calendarDateBlue];
                  if (date === 3 || date === 5) style = [style, styles.calendarDateAccentLight];
                  if (date === 4) style = [style, styles.calendarDateAccent];
                  if (date === 7) style = [style, styles.calendarDateOrange];
                  return (
                    <Text key={date} style={style}>{date}</Text>
                  );
                })}
              </View>
              {/* Calendar Legend */}
              <View style={styles.calendarLegendRow}>
                <View style={styles.calendarLegendItem}>
                  <View style={[styles.calendarLegendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.calendarLegendText}>Strength</Text>
                </View>
                <View style={styles.calendarLegendItem}>
                  <View style={[styles.calendarLegendDot, { backgroundColor: COLORS.secondary }]} />
                  <Text style={styles.calendarLegendText}>Cardio</Text>
                </View>
                <View style={styles.calendarLegendItem}>
                  <View style={[styles.calendarLegendDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.calendarLegendText}>Sports</Text>
                </View>
              </View>
              {/* Weekly Schedule */}
              <View style={styles.calendarScheduleSection}>
                <View style={styles.sectionHeaderRow}>
                  <Typography.Body style={styles.calendarScheduleTitle}>This Week's Schedule</Typography.Body>
                  <TouchableOpacity style={styles.calendarReorderBtn}>
                    <Icon name="arrows-up-down" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.link}>Re-order</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarScheduleList}>
                  {[
                    { day: 'Sun 02', color: COLORS.secondary, label: 'Cardio & Mobility' },
                    { day: 'Mon 03', color: COLORS.primary, label: 'Push Day' },
                    { day: 'Tue 04', color: COLORS.primary, label: 'Upper Body Strength' },
                    { day: 'Wed 05', color: COLORS.primary, label: 'Pull Day' },
                    { day: 'Thu 06', color: '#d1d5db', label: 'Rest Day' },
                    { day: 'Fri 07', color: COLORS.warning, label: 'Basketball Game' },
                    { day: 'Sat 08', color: COLORS.secondary, label: 'Active Recovery' },
                  ].map((item, i) => (
                    <View key={item.day} style={styles.calendarScheduleItem}>
                      <View style={styles.calendarScheduleDayRow}>
                        <View style={[styles.calendarScheduleDot, { backgroundColor: item.color }]} />
                        <Text style={styles.calendarScheduleDay}>{item.day}</Text>
                      </View>
                      <Text style={styles.calendarScheduleLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>

          {/* Ask Meadow */}
          <View style={styles.section}>
            <Typography.H2 style={{ marginBottom: 16 }}>Ask Meadow</Typography.H2>
            <Card style={styles.askMeadowCard}>
              <View style={styles.askMeadowRow}>
                <View style={styles.askMeadowIconWrapper}>
                  <Icon name="robot" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography.H2 style={styles.askMeadowTitle}>Your AI Coach</Typography.H2>
                  <Typography.Subtext>Ask questions about your training, nutrition, or recovery</Typography.Subtext>
                </View>
              </View>
              <View style={styles.askMeadowInputWrapper}>
                <TextInput
                  placeholder="How should I modify today's workout?"
                  style={styles.askMeadowInput}
                  placeholderTextColor={COLORS.text.secondary}
                />
                <TouchableOpacity style={styles.askMeadowSendBtn}>
                  <Icon name="paper-plane" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Video Workouts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography.H2>Video Workouts</Typography.H2>
              <TouchableOpacity>
                <Text style={styles.link}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoList}>
              {[
                {
                  title: 'Full Body HIIT',
                  desc: '25 min • High Intensity',
                  level: 'Advanced',
                  levelColor: '#fee2e2',
                  levelTextColor: '#dc2626',
                  rating: '4.8',
                  img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/4584e976de-5e6e9e7c27fc6eec17a6.png',
                },
                {
                  title: 'Lower Body Power',
                  desc: '30 min • Strength Focus',
                  level: 'Intermediate',
                  levelColor: '#fff7ed',
                  levelTextColor: '#ea580c',
                  rating: '4.9',
                  img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c5692b697f-4cf4591cefe80bfcb600.png',
                },
              ].map((item, i) => (
                <Card key={item.title} style={styles.videoCard}>
                  <View style={styles.videoCardRow}>
                    <View style={styles.videoThumbWrapper}>
                      <Image source={{ uri: item.img }} style={styles.videoThumb} resizeMode="cover" />
                      <View style={styles.videoPlayBtnWrapper}>
                        <View style={styles.videoPlayBtn}>
                          <Icon name="play" size={16} color={COLORS.text.primary} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.videoCardContent}>
                      <Typography.Body style={styles.videoCardTitle}>{item.title}</Typography.Body>
                      <Typography.Subtext style={styles.videoCardDesc}>{item.desc}</Typography.Subtext>
                      <View style={styles.videoCardMetaRow}>
                        <Text style={[styles.videoCardLevel, { backgroundColor: item.levelColor, color: item.levelTextColor }]}>{item.level}</Text>
                        <Text style={styles.videoCardRating}>{item.rating} ⭐</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Video Mobility */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography.H2>Video Mobility</Typography.H2>
              <TouchableOpacity>
                <Text style={styles.link}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoList}>
              {[
                {
                  title: 'Morning Flow',
                  desc: '15 min • Full Body Stretch',
                  level: 'Beginner',
                  levelColor: '#ecfdf5',
                  levelTextColor: '#059669',
                  rating: '4.7',
                  img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/cccb3656f0-84a0c75b8a65b1e18175.png',
                },
                {
                  title: 'Hip Mobility',
                  desc: '20 min • Lower Body Focus',
                  level: 'All Levels',
                  levelColor: '#dbeafe',
                  levelTextColor: '#2563eb',
                  rating: '4.8',
                  img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7f35d97bc3-b0ffd0a389e8632d3532.png',
                },
              ].map((item, i) => (
                <Card key={item.title} style={styles.videoCard}>
                  <View style={styles.videoCardRow}>
                    <View style={styles.videoThumbWrapper}>
                      <Image source={{ uri: item.img }} style={styles.videoThumb} resizeMode="cover" />
                      <View style={styles.videoPlayBtnWrapper}>
                        <View style={styles.videoPlayBtn}>
                          <Icon name="play" size={16} color={COLORS.text.primary} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.videoCardContent}>
                      <Typography.Body style={styles.videoCardTitle}>{item.title}</Typography.Body>
                      <Typography.Subtext style={styles.videoCardDesc}>{item.desc}</Typography.Subtext>
                      <View style={styles.videoCardMetaRow}>
                        <Text style={[styles.videoCardLevel, { backgroundColor: item.levelColor, color: item.levelTextColor }]}>{item.level}</Text>
                        <Text style={styles.videoCardRating}>{item.rating} ⭐</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    maxWidth: 430,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  sessionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  sessionImageWrapper: {
    height: 192,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  sessionImage: {
    width: '100%',
    height: '100%',
  },
  sessionDuration: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionDurationText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  sessionContent: {
    padding: 24,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sessionTitle: {
    marginBottom: 4,
  },
  sessionLevelTagWrapper: {
    alignSelf: 'flex-start',
  },
  sessionLevelTag: {
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '500',
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    marginTop: 0,
  },
  sessionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  calendarCard: {
    padding: 0,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
    paddingBottom: 0,
  },
  calendarMonth: {
    fontWeight: '600',
    fontSize: 18,
  },
  calendarNav: {
    flexDirection: 'row',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  calendarDayHeader: {
    width: (width - 48) / 7,
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontSize: 12,
    paddingVertical: 8,
  },
  calendarDate: {
    width: (width - 48) / 7,
    textAlign: 'center',
    color: COLORS.text.primary,
    fontSize: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarDateBlue: {
    backgroundColor: '#dbeafe',
  },
  calendarDateAccentLight: {
    backgroundColor: '#d1fae5',
  },
  calendarDateAccent: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    fontWeight: '600',
  },
  calendarDateOrange: {
    backgroundColor: '#fff7ed',
    color: '#ea580c',
  },
  calendarLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
    paddingHorizontal: 24,
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  calendarLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  calendarLegendText: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  calendarScheduleSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarScheduleTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  calendarReorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarScheduleList: {
    gap: 8,
  },
  calendarScheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarScheduleDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarScheduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  calendarScheduleDay: {
    color: COLORS.text.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  calendarScheduleLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  askMeadowCard: {
    padding: 0,
  },
  askMeadowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 24,
    paddingBottom: 0,
  },
  askMeadowIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  askMeadowTitle: {
    marginBottom: 4,
  },
  askMeadowInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
  askMeadowInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  askMeadowSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  videoList: {
    gap: 16,
  },
  videoCard: {
    padding: 0,
    overflow: 'hidden',
  },
  videoCardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  videoThumbWrapper: {
    width: 96,
    height: 80,
    backgroundColor: '#f1f5f9',
    position: 'relative',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  videoPlayBtnWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  videoCardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  videoCardDesc: {
    fontSize: 13,
    marginBottom: 6,
  },
  videoCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCardLevel: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  videoCardRating: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
