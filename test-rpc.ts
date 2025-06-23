import { createClient } from '@supabase/supabase-js';

// Supabase credentials from your project
const supabaseUrl = 'https://skgzwffygckgqquatqpr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZ3p3ZmZ5Z2NrZ3FxdWF0cXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc2MDcsImV4cCI6MjA2NTMxMzYwN30.rjOje8137cW6HhZJRIz4zD9XX2puyIfT_IEit4H4V-w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Bobby's user ID
const BOBBY_USER_ID = '02015c45-d248-4189-9ef5-0b1de9497344';

async function testGetDayWorkouts() {
  try {
    console.log("🚀 Testing 'get_day_workouts' RPC function...");
    console.log('User ID:', BOBBY_USER_ID);
    console.log('Target Day: 1');
    
    const { data, error } = await supabase.rpc('get_day_workouts', {
      client_uuid: BOBBY_USER_ID,
      target_day: 1
    });
    
    console.log('\n📡 RPC Response:');
    
    if (error) {
      console.log('❌ Error occurred:', error.message);
    } else {
      console.log('✅ Success! Data received:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (err) {
    console.error('❌ Unexpected error during testGetDayWorkouts:', err);
  }
}

async function testGetExerciseIdByName() {
  try {
    console.log("\n🚀 Testing 'get_exercise_id_by_name' RPC function...");
    const exerciseName = 'Zercher Squat';
    console.log(`Fetching ID for exercise: "${exerciseName}"`);

    const { data, error } = await supabase.rpc('get_exercise_id_by_name', {
      exercise_name: exerciseName,
    });

    console.log('\n📡 RPC Response:');

    if (error) {
      console.error('❌ Error fetching exercise ID:', error);
      return;
    }

    console.log('✅ Success! Response received:');
    console.log('Exercise ID:', data);
    
  } catch (err) {
    console.error("❌ Unexpected error during testGetExerciseIdByName:", err);
  }
}

async function testCreateFullWorkout() {
  try {
    console.log("\n🚀 Testing 'create_full_workout' RPC function...");
    const workoutData = {
      "workout_id": "f8744edd-ef16-4c70-90eb-cb38b2da3082",
      "blocks": [
        {
          "name": "Zercher Squats",
          "type": "normal",
          "order_index": 1,
          "sets": [
            { "exercise_name": "Zercher squat", "set_number": 1, "set_type": "work", "reps": 10 },
            { "exercise_name": "Zercher squat", "set_number": 2, "set_type": "work", "reps": 10 },
            { "exercise_name": "Zercher squat", "set_number": 3, "set_type": "work", "reps": 10 },
            { "exercise_name": "Zercher squat", "set_number": 4, "set_type": "work", "reps": 10 },
            { "exercise_name": "Zercher squat", "set_number": 5, "set_type": "work", "reps": 10 }
          ]
        },
        {
          "name": "RDL Superset",
          "type": "superset",
          "order_index": 2,
          "sets": [
            { "exercise_name": "RDL", "set_number": 1, "set_type": "work", "reps": 8 },
            { "exercise_name": "walking lunges", "set_number": 1, "set_type": "work", "reps": 8 },
            { "exercise_name": "RDL", "set_number": 2, "set_type": "work", "reps": 8 },
            { "exercise_name": "walking lunges", "set_number": 2, "set_type": "work", "reps": 8 }
          ]
        },
        {
          "name": "Full-Body Circuit",
          "type": "circuit",
          "order_index": 3,
          "sets": [
            { "exercise_name": "alternating T-lunge", "set_number": 1, "set_type": "work", "reps": 10 },
            { "exercise_name": "bicep curl", "set_number": 1, "set_type": "work", "reps": 10 },
            { "exercise_name": "tricep kickback", "set_number": 1, "set_type": "work", "reps": 10 },
            { "exercise_name": "alternating T-lunge", "set_number": 2, "set_type": "work", "reps": 10 },
            { "exercise_name": "bicep curl", "set_number": 2, "set_type": "work", "reps": 10 },
            { "exercise_name": "tricep kickback", "set_number": 2, "set_type": "work", "reps": 10 }
          ]
        }
      ]
    };

    console.log("Submitting workout data...");

    const { data, error } = await supabase.rpc('create_full_workout', {
      workout_data: workoutData
    });

    console.log('\n📡 RPC Response:');

    if (error) {
      console.error('❌ Error creating full workout:', error);
      return;
    }

    console.log('✅ Success! Workout created:');
    console.log('Response:', data);
    
  } catch (err) {
    console.error("❌ Unexpected error during testCreateFullWorkout:", err);
  }
}

// --- Main test runner ---
async function runTests() {
  // You can comment/uncomment the tests you want to run
  // await testGetDayWorkouts();
  // await testGetExerciseIdByName();
  await testCreateFullWorkout();
}

// Run the tests
runTests(); 