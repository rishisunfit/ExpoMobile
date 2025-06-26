import React from "react";
import { group } from "../../Data/groupData";
import UserList from "../common/UserList";

const Group = () => {
  return <UserList users={group} chatType="GroupChat" />;
};

export default Group;
