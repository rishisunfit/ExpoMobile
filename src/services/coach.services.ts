import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../lib/supabase";
import { BUCKET_NAMES } from "../types/enums";

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

export const sendChat = async (values: {
  p_conversation_id: string;
  p_content: string;
  p_message_type?: "file" | "image" | "text" | "voice";
  p_file_path?: string;
  p_file_name?: string;
}) => {
  console.log("values", JSON.stringify(values, null, 2));

  const { data, error } = await supabase.rpc("send_message", values);
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

export const uploadFile = async (
  file: string,
  converstionId: string,
  fileName: string
) => {
  try {
    // Step 1: Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(file, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Step 2: Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    const filePath = `${converstionId}/${fileName}`;
    console.log("filePath", filePath);
    console.log("fileName", fileName);
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    // Determine bucket and content type based on file extension
    let bucketName: BUCKET_NAMES;
    let contentType: string;

    if (fileExtension === "m4a" || fileExtension === "webm") {
      bucketName = BUCKET_NAMES.CONVERSATION_VOICE;
      contentType = `audio/${fileExtension}`;
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || "")) {
      bucketName = BUCKET_NAMES.CONVERSATION_IMAGES;
      contentType = `image/${fileExtension}`;
    } else {
      bucketName = BUCKET_NAMES.CONVERSATION_FILES;
      contentType = "application/octet-stream";
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        upsert: false,
        cacheControl: "3600",
        contentType,
      });

    if (error) {
      console.log("error", JSON.stringify(error, null, 2));
      return { data: null, error: error.message };
    }
    return { data: data, error: null };
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      return { data: null, error: error.message };
    }
    return { data: null, error: "Something went wrong" };
  }
};

export const getSignedUrl = async (filePath: string, messageType: string) => {
  try {
    let bucketName: BUCKET_NAMES;
    if (messageType === "voice") {
      bucketName = BUCKET_NAMES.CONVERSATION_VOICE;
    } else if (messageType === "image") {
      bucketName = BUCKET_NAMES.CONVERSATION_IMAGES;
    } else if (messageType === "file") {
      bucketName = BUCKET_NAMES.CONVERSATION_FILES;
    } else {
      bucketName = BUCKET_NAMES.CONVERSATION_FILES;
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60);
    if (error) {
      throw error;
    }
    // console.log("signedUrl", data);
    return data;
  } catch (error) {}
};
