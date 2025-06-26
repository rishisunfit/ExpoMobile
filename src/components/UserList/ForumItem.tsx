import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

interface ForumPost {
  id: number;
  title: string;
  name: string; // author name
  avatar: string;
  timestamp: string;
  content: string;
  replies: Reply[];
}

interface ForumItemProps {
  users: ForumPost[];
  chatType: string;
}

const ForumItem: React.FC<ForumItemProps> = ({ users, chatType }) => {
  const navigation = useNavigation<any>();

  const handleUserPress = (post: ForumPost) => {
    navigation.navigate(chatType, { item: post });
  };

  const renderUserItem = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userInfo}>
        <Image style={styles.avatar} source={{ uri: item.avatar }} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.userName}>by {item.name}</Text>
          <Text style={styles.content} numberOfLines={2}>
            {item.content}
          </Text>
          {item.replies.length > 0 && (
            <Text style={styles.replyCount}>
              {item.replies.length} repl{item.replies.length > 1 ? "ies" : "y"}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderUserItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

export default ForumItem;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginLeft: 78,
  },
  userContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#e9ecef",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: "#212529",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: "#495057",
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: "#6c757d",
  },
  replyCount: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#20c997",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
});
