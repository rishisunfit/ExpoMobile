import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Conversation, User } from "../../types/types";
import { defaultAvatar } from "../../assets";
import Icon from "react-native-vector-icons/FontAwesome6";
import { supabase } from "../../../lib/supabase";
import { getUser } from "../../services/auth.services";
import { getAllMessages, sendChat } from "../../services/coach.services";

const CoachChat: React.FC = () => {
  const route =
    useRoute<RouteProp<{ params: { item: User; data: Conversation[] } }>>();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const coach = route.params?.item;
  const chat = route.params.data[0];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<
    string | undefined
  >(undefined);

  // Fetch initial messages and user
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        setCurrentUser(user);
        const { messages: initialMessages, hasMore: moreMessages } =
          await getAllMessages(chat.id);
        setMessages(initialMessages);
        setHasMore(moreMessages);
        if (initialMessages.length > 0) {
          setLastMessageTimestamp(
            initialMessages[initialMessages.length - 1].created_at
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.log("error", JSON.stringify(error, null, 2));
        setIsLoading(false);
      }
    };

    init();

    const channel = supabase
      .channel("chat-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat.id}`,
        },
        (payload) => {
          const message = payload.new;
          // Show only messages between this user and this coach
          if (
            (message.sender_id === currentUser?.id &&
              message.receiver_id === coach.id) ||
            (message.sender_id === coach.id &&
              message.receiver_id === currentUser?.id)
          ) {
            setMessages((prev) => [message, ...prev]);
          }
        }
      )
      .subscribe(() => {
        console.log("channel subscribed");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.id, currentUser?.id, coach.id]);

  const fetchMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !lastMessageTimestamp) return;

    try {
      setIsLoadingMore(true);
      const { messages: moreMessages, hasMore: moreAvailable } =
        await getAllMessages(chat.id, 20, lastMessageTimestamp);

      if (moreMessages.length > 0) {
        setMessages((prev) => [...prev, ...moreMessages]);
        setLastMessageTimestamp(
          moreMessages[moreMessages.length - 1].created_at
        );
        setHasMore(moreAvailable);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Error fetching more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    const tempMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender_id: currentUser?.id,
      receiver_id: coach.id,
      created_at: new Date().toISOString(),
      conversation_id: chat.id,
    };

    setNewMessage(""); // Clear input immediately
    setMessages((prev) => [tempMessage, ...prev]); // Optimistic update

    try {
      await sendChat(chat.id, newMessage.trim(), "", "");
    } catch (error) {
      console.log("Failed to send message", JSON.stringify(error, null, 2));
      // Remove the temporary message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMessage(newMessage.trim()); // Restore the message in the input
    }
  }, [chat.id, newMessage, currentUser?.id, coach.id]);

  const renderMessageItem = ({ item }: { item: any }) => {
    const isCoach = item.sender_id === coach.id;
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
            <Text style={styles.bubbleText}>{item.content}</Text>
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
            <Text style={styles.bubbleTextUser}>{item.content}</Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
      </View>
    );
  };

  const renderChatContainer = () => {
    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, gap: 16 }}
        inverted
        showsVerticalScrollIndicator={false}
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Image
          source={
            coach.profile_image_url
              ? { uri: coach.profile_image_url }
              : defaultAvatar
          }
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text>{coach.full_name}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
      ) : (
        renderChatContainer()
      )}
      <View style={styles.messageInputBar}>
        <TouchableOpacity>
          <Icon name="plus" size={20} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={sendMessage}
          />
        </View>
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="paper-plane" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CoachChat;

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
    flexDirection: "row",
    alignItems: "center",
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
});
