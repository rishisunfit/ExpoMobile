import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Coach from "./Coach";
import Group from "./Group";
import Forum from "./Forum";

const UserItem = () => {
  const [activeTab, setActiveTab] = useState("Coach");

  const selectFunc = () => {
    switch (activeTab) {
      case "Coach":
        return <Coach />;
      case "Group":
        return <Group />;
      case "Forum":
        return <Forum />;
      default:
        return <Coach />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBarContainer}>
        {["Coach", "Group", "Forum"].map((item, index) => (
          <TouchableOpacity
            style={[
              styles.topBarItem,
              item === activeTab
                ? styles.activeToggleBtn
                : styles.inActiveToggleBtn,
            ]}
            onPress={() => {
              setActiveTab(item);
            }}
            key={index}
          >
            <Text
              style={[
                styles.topBarText,
                item === activeTab
                  ? styles.activeToggleBtn
                  : styles.inActiveToggleBtn,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexGrow: 1 }}>{selectFunc()}</View>
    </View>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  topBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    padding: 4,
    marginBottom: 4,
  },
  topBarText: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "600",
  },
  topBarItem: {
    width: "33.33%",
    paddingVertical: 8,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  activeToggleBtn: {
    color: "white",
    backgroundColor: "#1f2937",
  },
  inActiveToggleBtn: {
    color: "#64748b",
    backgroundColor: "transparent",
  },
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
