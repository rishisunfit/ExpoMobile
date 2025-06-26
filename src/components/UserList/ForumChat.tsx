import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { ForumMessage, ForumReply } from "../../types/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
const ForumChat = () => {
  const route = useRoute<RouteProp<{ params: { item: ForumMessage } }>>();
  const post = route.params?.item;

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No post data available.</Text>
      </SafeAreaView>
    );
  }

  const renderReply = ({ item }: { item: ForumReply }) => (
    <View style={styles.replyContainer}>
      <Text style={styles.replyAuthor}>{item.author}</Text>
      <Text style={styles.replyContent}>{item.content}</Text>
      <Text style={styles.replyTimestamp}>
        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.innerContainer}>
        <View style={styles.postContainer}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.author}>by {post.name}</Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </Text>
          <Text style={styles.content}>{post.content}</Text>
        </View>

        <View style={styles.repliesSection}>
          <Text style={styles.repliesHeader}>
            Replies ({post.replies.length})
          </Text>
          {post.replies.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={post.replies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderReply}
            />
          ) : (
            <Text style={styles.noReplies}>No replies yet.</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.messageInputBar}>
        <TouchableOpacity>
          <AntDesign name="plus" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
          />
        </View>
        <TouchableOpacity>
          <FontAwesome5 name="paper-plane" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForumChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  postContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: "#212529",
  },
  repliesSection: {
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    paddingTop: 16,
  },
  repliesHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  replyContainer: {
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  replyAuthor: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#212529",
  },
  replyContent: {
    fontSize: 14,
    color: "#495057",
  },
  replyTimestamp: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 6,
  },
  noReplies: {
    fontStyle: "italic",
    color: "#6c757d",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  messageInputBar: {
    borderTopWidth: 1,
    backgroundColor: "white",
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 15,
    color: "#1f2937",
    width: "100%",
  },
});
