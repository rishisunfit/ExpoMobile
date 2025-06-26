import React from "react";
import { forumMessages } from "../../Data/forumMessages";
import { ForumMessage } from "../../types/types";
import ForumItem from "./ForumItem";
import { Text, View } from "react-native";
import { Icon } from "@rneui/themed";
const Forum: React.FC = () => {
  const renderForum = () => (
    <View
      style={{
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      <Icon
        name="comments"
        size={32}
        color="#64748b"
        style={{ marginBottom: 8 }}
      />
      <Text style={{ color: "#64748b", fontSize: 16 }}>
        Forums coming soon!
      </Text>
    </View>
  );

  return (
    <>
      {renderForum()}
      {/* <ForumItem users={forumMessages as ForumMessage[]} chatType="ForumChat" /> */}
    </>
  );
};

export default Forum;
