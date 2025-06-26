import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { groupMessages } from "../../Data/groupMessages";
import { User } from "../../types/types";
import AntDesign from "@expo/vector-icons/AntDesign";

const GroupChat: React.FC = () => {
  const route = useRoute<RouteProp<{ params: { item: User } }>>();
  const params = route.params ?? {};
  console.log("params", JSON.stringify(params, null, 2));
  const groupNames = groupMessages.filter(
    (item) => item.groupName === params.item.groupName
  );

  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <View style={{ flexDirection: "row", padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 24, marginBottom: 80 }}>
        <View style={{ gap: 16 }}>
          {groupNames.map((msg, idx) =>
            msg.type === "group" ? (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={[styles.bubble, styles.coachBubble]}>
                    <Text style={styles.bubbleName}>{msg.name}</Text>
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                  </View>
                  <Text style={styles.timeText}>{msg.time}</Text>
                </View>
              </View>
            ) : (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <View style={[styles.bubble, styles.userBubble]}>
                    <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                  </View>
                </View>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupChat;

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
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
  memberBubble: {
    backgroundColor: "#10b981",
  },
  bubbleName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    paddingBottom: 4,
  },
  bubbleText: {
    color: "#fff",
    fontSize: 15,
  },
  bubbleTextUser: {
    color: "#1f2937",
    fontSize: 15,
  },
  memberName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  memberNameText: {
    color: "#6ee7b7",
  },
  coachName: {
    color: "#bae6fd",
  },
  timeText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
});
