import { User } from "../types/types";

export const forumUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey! How are you doing?",
    timestamp: "12:00",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    unreadCount: 2,
    toggle: "coach",
  },
  {
    id: 2,
    name: "Jane Smith",
    lastMessage: "Thanks for the help yesterday!",
    timestamp: "11:30",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    toggle: "coach",
  },
  {
    id: 3,
    name: "Mike Johnson",
    lastMessage: "See you at the meeting tomorrow",
    timestamp: "10:45",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    toggle: "coach",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    lastMessage: "Perfect! Let's do it.",
    timestamp: "09:15",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    unreadCount: 1,
    toggle: "coach",
  },
  {
    id: 5,
    name: "David Brown",
    lastMessage: "Can you send me the files?",
    timestamp: "Yesterday",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
    toggle: "coach",
  },
];
