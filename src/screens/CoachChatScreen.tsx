import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, KeyboardAvoidingView, Platform } from "react-native";
import {
  chatApiKey,
  chatUserId,
  chatUserName,
  chatUserToken,
} from "../config/chatConfig";
import { AppProvider, useAppContext } from "../context/ChatContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  OverlayProvider,
  Chat,
  Channel,
  MessageList,
  MessageInput,
  ChannelList,
  useCreateChatClient,
} from "stream-chat-react-native";
import { useNavigation } from "@react-navigation/native";

const filters = {
  members: {
    $in: [chatUserId],
  },
};
const sort = {
  last_message_at: -1 as const,
};
const options = {
  presence: true,
  state: true,
  watch: true,
};

export const ChannelListScreen = () => {
  const { setChannel } = useAppContext();
  const rootNavigation = useNavigation();
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey!,
    userData: {
      id: chatUserId,
      name: chatUserName,
    },
    tokenOrProvider: chatUserToken,
  });

  if (!chatClient) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading chat ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OverlayProvider>
        <Chat client={chatClient}>
          <ChannelList
            onSelect={(channel) => {
              setChannel(channel);
              (rootNavigation as any).navigate("ChannelScreen");
            }}
            filters={filters}
            sort={sort}
            options={options}
          />
        </Chat>
      </OverlayProvider>
    </GestureHandlerRootView>
  );
};

export const ChannelScreen = () => {
  const { channel } = useAppContext();
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey!,
    userData: {
      id: chatUserId,
      name: chatUserName,
    },
    tokenOrProvider: chatUserToken,
  });

  if (!chatClient || !channel) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading chat ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OverlayProvider>
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <MessageList />
              <MessageInput />
            </Channel>
          </Chat>
        </OverlayProvider>
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  );
};
