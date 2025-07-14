import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../styles';
import { supabase } from '../../lib/supabase';
import { format, parseISO, getDay, getDaysInMonth } from 'date-fns';
import { mapSchedule, ScheduleRow, ScheduleMap, MappedScheduleItem } from '../utils/schedule';
import { Database } from '../types/database';


const { width } = Dimensions.get('window');

// Type for a schedule row from Supabase


interface MyCalendarProps {
  clientId: string;
}

const MyCalendar = ({ clientId, navigation }: MyCalendarProps & { navigation: any }) => {
  const [schedule, setSchedule] = useState<MappedScheduleItem[]>([]);
  const [dayMap, setDayMap] = useState<Record<string, { color: string; label: string }>>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1); // 1-based
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      const today = new Date();
      const start = today.toISOString().split('T')[0]; // e.g. "2025-07-11"
      const days = 14;

      const { data, error } = await supabase
        .rpc<any, ScheduleRow[]>('get_client_schedule', {
          client: clientId,
          start,
          days,
        });

      if (error) {
        console.error("Failed to load schedule:", error);
        setSchedule([]);
        setDayMap({});
      } else {
        if (Array.isArray(data)) {
          const { schedule: sched, dayMap: dMap } = mapSchedule(data);
          setSchedule(sched);
          setDayMap(dMap);
        } else {
          setSchedule([]);
          setDayMap({});
        }
      }
      setLoading(false);
    };

    loadSchedule();
  }, [clientId]);

  // Calendar grid logic
  const firstOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const firstWeekday = getDay(firstOfMonth); // 0 = Sunday, 1 = Monday, ...
  const daysInMonth = getDaysInMonth(firstOfMonth);

  // Build a 2D array of weeks (each week is an array of 7 days or null)
  const calendarRows: Array<Array<{ day: number; dateKey: string } | null>> = [];
  let week: Array<{ day: number; dateKey: string } | null> = [];
  let dayCounter = 1;

  // Pad the first week with nulls if needed
  for (let i = 0; i < firstWeekday; i++) {
    week.push(null);
  }

  while (dayCounter <= daysInMonth) {
    while (week.length < 7 && dayCounter <= daysInMonth) {
      const paddedMonth = String(currentMonth).padStart(2, '0');
      const paddedDay = String(dayCounter).padStart(2, '0');
      const dateKey = `${currentYear}-${paddedMonth}-${paddedDay}`;
      week.push({ day: dayCounter, dateKey });
      dayCounter++;
    }
    // If week is not full, pad with nulls
    while (week.length < 7) {
      week.push(null);
    }
    calendarRows.push(week);
    week = [];
  }

  // Render weekday headers and the calendar grid
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Typography.H2>My Calendar</Typography.H2>
        <TouchableOpacity>
          <Text style={styles.link} onPress={() => navigation.navigate('ReorderScreen')}>Full View</Text>
        </TouchableOpacity>
      </View>
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Typography.Body style={styles.calendarMonth}>{format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}</Typography.Body>
          <View style={styles.calendarNav}>
            <TouchableOpacity style={styles.calendarNavBtn} onPress={() => {
              if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}>
              <Icon name="chevron-left" size={14} color={COLORS.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.calendarNavBtn} onPress={() => {
              if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}>
              <Icon name="chevron-right" size={14} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Calendar Days Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <Text key={`${d}-${i}`} style={styles.calendarDayHeader}>{d}</Text>
          ))}
        </View>
        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarRows.map((week, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row' }}>
              {week.map((cell, colIdx) => {
                if (!cell) {
                  return <View key={colIdx} style={styles.calendarDate} />;
                }
                const dayInfo = dayMap[cell.dateKey];
                let cellStyle = styles.calendarDate;
                let textStyle = { color: COLORS.text.primary };
                if (dayInfo) {
                  cellStyle = { ...cellStyle, backgroundColor: dayInfo.color, borderRadius: 18 };
                  textStyle = { color: '#fff' } as any;
                }
                return (
                  <View key={colIdx} style={cellStyle}>
                    <Text style={textStyle}>{cell.day}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        {/* Weekly Schedule */}
        <View style={styles.calendarScheduleSection}>
          <View style={styles.sectionHeaderRow}>
            <Typography.Body style={styles.calendarScheduleTitle}>This Week's Schedule</Typography.Body>
            <TouchableOpacity style={styles.calendarReorderBtn}>
              <Icon name="arrows-up-down" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.link} onPress={() => navigation.navigate('ReorderScreen')}>Re-order</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarScheduleList}>
            {loading ? (
              <Text>Loading...</Text>
            ) : (
              schedule.map((item, i) => (
                <View key={item.day + i} style={styles.calendarScheduleItem}>
                  <View style={styles.calendarScheduleDayRow}>
                    <View style={[styles.calendarScheduleDot, { backgroundColor: item.color }]} />
                    <Text style={styles.calendarScheduleDay}>{item.day}</Text>
                  </View>
                  <Text
                    style={[
                      styles.calendarScheduleLabel,
                      item.label !== 'Rest Day' && { color: COLORS.primary }
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </Card>
    </View>
  );
};

export default function WorkoutsScreen({ navigation }: any) {
  const [workoutName, setWorkoutName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [mobilityFavorites, setMobilityFavorites] = useState<Database['public']['Tables']['mobility_videos']['Row'][]>([]);

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setClientId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('mobility_videos')
        .select('*')
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });
      if (!error && data) setMobilityFavorites(data.slice(0, 2));
    };
    fetchFavorites();
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
                  <Icon name="dumbbell" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.sessionButtonText}>Start Session</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* My Calendar */}
          {clientId && <MyCalendar clientId={clientId} navigation={navigation} />}

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
              <TouchableOpacity onPress={() => navigation.navigate('VideoMobilityScreen')}>
                <Text style={styles.link}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoList}>
              {mobilityFavorites.length === 0 ? (
                <Text style={{ color: COLORS.text.secondary, padding: 16 }}>No favorites yet.</Text>
              ) : (
                mobilityFavorites.map((item) => {
                  // Badge color logic
                  let levelColor = '#dbeafe', levelTextColor = '#2563eb';
                  if (item.difficulty === 'beginner') {
                    levelColor = '#ecfdf5'; levelTextColor = '#059669';
                  } else if (item.difficulty === 'intermediate') {
                    levelColor = '#fff7ed'; levelTextColor = '#ea580c';
                  } else if (item.difficulty === 'advanced') {
                    levelColor = '#fee2e2'; levelTextColor = '#dc2626';
                  } else if (item.difficulty === 'all levels') {
                    levelColor = '#dbeafe'; levelTextColor = '#2563eb';
                  }
                  return (
                    <Card key={item.id} style={styles.videoCard}>
                      <View style={styles.videoCardRow}>
                        <View style={styles.videoThumbWrapper}>
                          {(() => {
                            let thumbSource = null;
                            if (item.thumbnail_url) {
                              thumbSource = { uri: item.thumbnail_url };
                            } else if (item.video_url && (item.video_url.includes('youtube.com') || item.video_url.includes('youtu.be'))) {
                              const youtubeId = extractYouTubeId(item.video_url);
                              if (youtubeId) {
                                thumbSource = { uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` };
                              }
                            }
                            if (!thumbSource) {
                              thumbSource = { uri: REMOTE_PLACEHOLDER };
                            }
                            return <Image source={thumbSource} style={styles.videoThumb} resizeMode="cover" />;
                          })()}
                          <View style={styles.videoPlayBtnWrapper}>
                            <View style={styles.videoPlayBtn}>
                              <Icon name="play" size={16} color={COLORS.text.primary} />
                            </View>
                          </View>
                        </View>
                        <View style={styles.videoCardContent}>
                          <Typography.Body style={styles.videoCardTitle}>{item.title}</Typography.Body>
                          <Typography.Subtext style={styles.videoCardDesc}>{item.description || ''}</Typography.Subtext>
                          <View style={styles.videoCardMetaRow}>
                            <Text style={[styles.videoCardLevel, { backgroundColor: levelColor, color: levelTextColor }]}>{item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) : 'All Levels'}</Text>
                            <Text style={styles.videoCardRating}>{item.duration ? `${item.duration} min` : ''}</Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Helper to extract YouTube ID
function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? match[1] : '';
}

const REMOTE_PLACEHOLDER = 'https://via.placeholder.com/96x80.png?text=No+Image';

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
    flexDirection: 'column',
    flexWrap: 'nowrap',
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 8,
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    alignSelf: 'center',
    width: 7 * 36,
  },
  calendarDayHeader: {
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 2,
  },
  calendarDate: {
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.text.primary,
    fontSize: 15,
    borderRadius: 18,
    marginVertical: 2,
    marginHorizontal: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
