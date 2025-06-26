import { TouchableOpacityProps } from "react-native";
import { Database } from "./database";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type User = Database["public"]["Tables"]["users"]["Row"] | any;
export type Conversation =
  Database["public"]["Tables"]["direct_conversations"]["Row"];
export type Chat = {
  chatData: Conversation;
  otherUser: User;
};

export interface UserListProps extends TouchableOpacityProps {
  data: Chat[] | ForumMessage[];
  chatType: string;
  loading: boolean;
}

export interface ForumMessage {
  id: number;
  title: string;
  name: string;
  avatar: string;
  timestamp: string;
  content: string;
  replies: ForumReply[];
}

export interface ForumReply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}
