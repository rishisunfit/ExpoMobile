import { COLORS } from '../styles';
import { format, parseISO } from 'date-fns';

// Type for a schedule row from Supabase
export interface ScheduleRow {
  date: string;
  is_rest_day: boolean;
  notes?: string | null;
  workout_name?: string | null; // Added workout_name
}

// Type for mapped schedule item
export type MappedScheduleItem = {
  day: string;
  date: string;
  color: string; // allow any string color
  label: string;
};

export type ScheduleMap = {
  schedule: MappedScheduleItem[];
  dayMap: Record<string, { color: string; label: string }>;
};

export const mapSchedule = (rows: ScheduleRow[]): ScheduleMap => {
  const schedule: MappedScheduleItem[] = [];
  const dayMap: Record<string, { color: string; label: string }> = {};

  rows.forEach(row => {
    const dayStr = format(parseISO(row.date), 'EEE dd');
    const dateKey = row.date;

    let color: string = COLORS.primary;
    // Use the actual workout name if available, otherwise fallback
    let label = row.workout_name || 'Strength Day';

    if (row.is_rest_day) {
      color = '#d1d5db' as string;
      label = 'Rest Day';
    } else if (row.notes?.toLowerCase().includes('cardio')) {
      color = COLORS.secondary as string;
      label = 'Cardio';
    } else if (row.notes?.toLowerCase().includes('basketball') || row.notes?.toLowerCase().includes('game')) {
      color = COLORS.warning as string;
      label = 'Sports';
    }

    const entry = { day: dayStr, date: dateKey, color, label };
    schedule.push(entry);
    dayMap[dateKey] = { color, label };
  });

  return { schedule, dayMap };
}; 