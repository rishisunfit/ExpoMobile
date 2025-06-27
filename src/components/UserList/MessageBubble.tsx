import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { defaultAvatar } from "../../assets";
import { getSignedUrl } from "../../services/coach.services";
import { Tables } from "../../types/database";
import { Conversation, User } from "../../types/types";

const MessageBubble = ({ item }: { item: Tables<"messages"> }) => {
  const route =
    useRoute<RouteProp<{ params: { item: User; data: Conversation[] } }>>();

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoader, setImageLoader] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const coach = route.params?.item;

  const isCoach = item.sender_id === coach.id;

  useEffect(() => {
    if (
      item.message_type === "image" ||
      item.message_type === "file" ||
      item.message_type === "voice"
    ) {
      setLoading(true);
      getSignedUrl(item.file_path!, item.message_type)
        .then((data) => {
          setSignedUrl(data?.signedUrl || null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [item]);

  const handleMessageType = useCallback(() => {
    if (item.message_type === "image") {
      return loading ? (
        <ActivityIndicator color={"#10b981"} />
      ) : (
        <>
          {imageLoader && <ActivityIndicator color={"#10b981"} />}
          <Image
            source={{ uri: signedUrl! }}
            style={!imageLoader ? styles.imageContainer : {}}
            onLoadStart={() => {
              setImageLoader(true);
            }}
            onLoadEnd={() => {
              setImageLoader(false);
            }}
            onError={() => {
              setImageError(true);
            }}
          />
        </>
      );
    } else if (item.message_type === "voice") {
      return <Text>Audio</Text>;
    }
    return <Text style={styles.bubbleTextUser}>{item.content}</Text>;
  }, [item, signedUrl, loading, imageLoader, imageError]);

  return isCoach ? (
    <View style={styles.messageRow}>
      <Image
        source={
          coach.profile_image_url
            ? { uri: coach.profile_image_url }
            : defaultAvatar
        }
        style={[styles.avatar, { marginRight: 10 }]}
      />
      <View style={{ flex: 1 }}>
        <View style={[styles.bubble, styles.coachBubble]}>
          {handleMessageType()}
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  ) : (
    <View style={styles.userMessageRow}>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <View style={[styles.bubble, styles.userBubble]}>
          {handleMessageType()}
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};
export default MessageBubble;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "70%",
  },
  coachBubble: {
    backgroundColor: "#3b82f6",
  },
  userBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 15,
  },
  bubbleTextUser: {
    color: "#1f2937",
    fontSize: 15,
  },
  timeText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  messageInputBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 50,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 6,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 15,
    color: "#1f2937",
    width: "100%",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    // marginRight: 10,
  },
  imageCloseButton: {
    position: "absolute",
    top: -5,
    right: 5,
    zIndex: 1000,
    backgroundColor: "gray",
    borderRadius: 100,
    padding: 5,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  recordingText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "bold",
  },
  stopButton: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  playButton: {
    backgroundColor: "#10b981",
    padding: 8,
    borderRadius: 100,
  },
  audioLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  closeAudio: {
    backgroundColor: "#64748b",
    padding: 8,
    borderRadius: 100,
  },
});
