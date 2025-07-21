// ai_assistant.js
import { StreamChat } from 'stream-chat';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getMaxWeight, getSupabaseProfile } from './supabase/functions.js';

dotenv.config();

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.EXPO_PUBLIC_STREAM_API_SECRET;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const streamClient = StreamChat.getInstance(
  STREAM_API_KEY,
  STREAM_API_SECRET,
  { allowServerSideConnect: true }
);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  await streamClient.upsertUser({
    id: 'ai-bot',
    name: 'AI Bot',
    role: 'admin'
  });

  const aiBotToken = streamClient.createToken('ai-bot');
  await streamClient.connectUser(
    {
      id: 'ai-bot',
      name: 'AI Bot'
    },
    aiBotToken
  );

  const channel = streamClient.channel('messaging', 'fun-room', {
    members: ['little-lake-5', 'ai-bot']
  });

  let lastProcessedMessageId = null;

  async function handleMessage(latest) {
    if (latest.text && latest.text.toLowerCase().includes('max weight')) {
      // Try to extract exercise name from the message
      let exerciseName = 'Walking Lunges'; // default
      const match = latest.text.match(/max weight (on|for)?\s*(.+)/i);
      if (match && match[2]) {
        exerciseName = match[2].trim();
      }

      const userData = await getSupabaseProfile(latest.user.id);
      const result = await getMaxWeight(userData.id, exerciseName);
      if (result && result.length > 0) {
        const record = result[0];
        return `🏋️‍♂️ Of course! ${userData.full_name} has lifted a max of ${record.max_weight} lbs on ${record.queried_exercise_name}. 💪`;
      } else {
        return "Couldn't find any max weight records yet.";
      }
    }
    return null;
  }

  async function processMessages() {
    console.log("🤖 Watching for new messages...");

    setInterval(async () => {
      try {
        const { messages } = await channel.query({ messages: { limit: 10 } });
        if (!messages.length) return;

        const latest = messages[messages.length - 1];
        if (!latest || latest.user.id === 'ai-bot') return;
        if (lastProcessedMessageId === latest.id) return;

        const reply = await handleMessage(latest);
        if (reply) {
          await channel.sendMessage({
            text: reply,
            user_id: 'ai-bot'
          });
          lastProcessedMessageId = latest.id;
          return;
        }

        // Fetch user profile from Supabase
        console.log("🔎 Looking up Supabase data for user:", latest.user.id);
        const userData = await getSupabaseProfile(latest.user.id);

        // Build OpenAI prompt
        const openaiMessages = [
          {
            role: "system",
            content: `You are a helpful fitness assistant. The user's name is ${userData.full_name || 'Unknown'} and their email is ${userData.email || 'Unknown'}.`
          },
          {
            role: "user",
            content: latest.text
          }
        ];

        // Get AI response
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: openaiMessages
        });

        const aiReply = completion.choices[0].message.content;
        console.log(`🤖 AI: ${aiReply}`);

        await channel.sendMessage({
          text: aiReply,
          user_id: 'ai-bot'
        });

        lastProcessedMessageId = latest.id;
      } catch (error) {
        console.error('❌ Unhandled error in message handler:', error);
      }
    }, 3000);
  }

  processMessages();
})();
