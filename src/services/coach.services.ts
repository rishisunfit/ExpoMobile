import { supabase } from "../../lib/supabase";
export const getCoach = async (userId: string) => {
  const { data, error } = await supabase
    .from("direct_conversations")
    .select(
      `*,
         user_one: user_one_id (
           *
         ),
         user_two: user_two_id (
           *
         )`
    )
    .or(`user_two_id.eq.${userId},user_one_id.eq.${userId}`);

  if (error) {
    throw error;
  }

  const conversationsWithOtherUser = data.map((conv) => {
    // Determine the other user object
    const otherUser =
      conv.user_one_id === userId ? conv.user_two : conv.user_one;

    // Destructure to remove user_one and user_two nested objects
    const { user_one, user_two, ...conversationData } = conv;

    // Return conversation data + otherUser only
    return {
      ...conversationData,
      otherUser,
    };
  });

  return conversationsWithOtherUser;
};

export const sendChat = async (
  conversationId: string,
  message: string,
  file_path: string,
  file_name: string
) => {
  const { data, error } = await supabase.rpc("send_message", {
    p_conversation_id: conversationId,
    p_content: message,
    p_message_type: "text",
  });
  if (error) {
    throw error;
  }
  return data;
};

export const getAllMessages = async (
  id: string,
  limit: number = 20,
  lastMessageTimestamp?: string
) => {
  let query = supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (lastMessageTimestamp) {
    query = query.lt("created_at", lastMessageTimestamp);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    messages: data || [],
    hasMore: count ? count > (data?.length || 0) : false,
  };
};
