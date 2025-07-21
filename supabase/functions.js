// supabase/functions.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export async function getMaxWeight(userId, exerciseName) {
  try {
    const { data, error } = await supabase
      .rpc('get_max_weight', {
        p_exercise_name: exerciseName,
        p_client_uuid: userId
      });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error fetching max weight:', error);
  }
}

export async function getSupabaseProfile(streamUserId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('stream_user_id', streamUserId)
    .single();
  if (error) throw error;
  return data;
}
