import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Chat, ForumMessage, User, UserListProps } from "../../types/types";
import { useNavigation } from "@react-navigation/native";
import { defaultAvatar } from "../../assets";

const UserList: React.FC<UserListProps> = ({
  data,
  chatType,
  loading,
  ...props
}) => {
  const navigation = useNavigation<any>();
  const handleUserPress = (user: User | ForumMessage) => {
    navigation.navigate(chatType, { item: user, data: data });
  };
  const renderUserItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleUserPress(item.otherUser)}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={
              item.otherUser.profile_image_url
                ? { uri: item.otherUser.profile_image_url }
                : defaultAvatar
            }
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.userName}>{item.otherUser.full_name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <FlatList
      data={data as Chat[]}
      keyExtractor={(item) => item?.otherUser.id.toString()}
      renderItem={renderUserItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={() => (
        <View
          style={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>No users found</Text>
        </View>
      )}
    />
  );
};

export default UserList;

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
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#dc3545",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 18,
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#e9ecef",
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
