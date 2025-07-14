import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Icon } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { mapSchedule, ScheduleRow } from '../utils/schedule';
import { parseISO, format } from 'date-fns';

export default function ReorderScreen({ navigation }: { navigation: any }) {
  const [dates, setDates] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setClientId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!clientId) return;
      setLoading(true);
      const today = new Date();
      const start = today.toISOString().split('T')[0];
      const days = 7;
      const { data, error } = await supabase
        .rpc<any, ScheduleRow[]>('get_client_schedule', {
          client: clientId,
          start,
          days,
        });

      if (error) {
        console.error('Failed to load:', error);
        setDates([]);
        setWorkouts([]);
      } else if (Array.isArray(data)) {
        // Sort by date ascending
        const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
        // isoDates is an array of ISO date strings
        const isoDates = sorted.map(row => row.date);
        setDates(isoDates);

        const workoutList = sorted.map((item, idx) => ({
          id: String(idx + 1),
          date: format(parseISO(item.date), 'EEE dd'),
          name: item.workout_name || item.notes || 'Workout',
          duration: item.notes || '—',
          difficulty: item.is_rest_day ? 'Rest' : 'Workout',
          color: item.is_rest_day ? '#d1d5db' : '#10b981',
          dot: item.is_rest_day ? '#d1d5db' : '#10b981',
          tagBg: item.is_rest_day ? '#f1f5f9' : '#10b981',
          tagColor: item.is_rest_day ? '#64748b' : '#fff',
          is_rest_day: item.is_rest_day
        }));
        setWorkouts(workoutList);
      }
      setLoading(false);
    };
    if (clientId) loadSchedule();
  }, [clientId]);

  // Log arrays before rendering
  console.log("DATES ARRAY:", dates);
  console.log("WORKOUTS ARRAY:", workouts);

  // Save handler
  const handleSave = async () => {
    if (!clientId) return;
    console.log("Saving reordered schedule...");

    // Loop through days and update each
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const workout = workouts[i];

      console.log(`Saving: ${date} -> ${workout.name}`);

      // Write to client_schedule table
      const { error } = await supabase
        .from('client_schedule')
        .update({
          workout_id: workout.id, // adjust to your data model
          notes: workout.duration,
          is_rest_day: workout.is_rest_day
        })
        .eq('client_id', clientId)
        .eq('date', date);

      if (error) {
        console.error(`Failed to update ${date}:`, error);
      }
    }

    console.log("Schedule saved.");
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" type="feather" color="#64748b" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Re-order Workouts</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerDone}>Done</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSubtitle}>Drag workouts to rearrange your schedule</Text>

      {/* Draggable List */}
      <DraggableFlatList
        data={workouts}
        onDragEnd={({ data }) => setWorkouts(data)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
        renderItem={({ item, index, drag, isActive }) => (
          <TouchableOpacity
            style={[styles.card, isActive && { opacity: 0.9 }]}
            onLongPress={drag}
            delayLongPress={100}
            activeOpacity={1}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.cardRow}>
                <View style={[styles.dot, { backgroundColor: item.dot }]} />
                <Text style={styles.cardDay}>
                  {(() => {
                    try {
                      return dates[index] ? format(parseISO(dates[index]), 'EEE dd') : '—';
                    } catch {
                      return '—';
                    }
                  })()}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardDuration}>{item.duration}</Text>
                <Text style={[styles.cardTag, { backgroundColor: item.tagBg, color: item.tagColor }]}> 
                  {item.difficulty}
                </Text>
              </View>
            </View>
            <Icon name="grip-lines" type="font-awesome-5" color="#64748b" size={22} style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        )}
      />

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionsIcon}>
          <Icon name="info" type="feather" color="#10b981" size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.instructionsTitle}>How to reorder</Text>
          <Text style={styles.instructionsText}>
            Touch and hold the grip lines (≡) on the right side of each workout card, then drag up or down to rearrange your schedule.
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  headerDone: { color: '#10b981', fontWeight: '500', fontSize: 16 },
  headerSubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  cardDay: { fontSize: 13, color: '#1f2937', fontWeight: '500' },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardDuration: { fontSize: 13, color: '#64748b', marginRight: 12 },
  cardTag: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontWeight: '500' },
  instructions: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#ecfdf5', borderRadius: 16,
    padding: 16, margin: 24, marginTop: 0, borderWidth: 1, borderColor: '#bbf7d0',
  },
  instructionsIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#bbf7d0',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2,
  },
  instructionsTitle: { fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  instructionsText: { color: '#64748b', fontSize: 13, lineHeight: 18 },
  bottomActions: { flexDirection: 'row', padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f1f5f9' },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginRight: 8 },
  saveBtn: { flex: 1, backgroundColor: '#10b981', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginLeft: 8 },
  cancelText: { color: '#64748b', fontWeight: '500', fontSize: 16 },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
