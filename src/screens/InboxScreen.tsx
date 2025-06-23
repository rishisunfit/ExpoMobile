import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const { width } = Dimensions.get('window');

const coachMessages = [
  {
    type: 'coach',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    text: "+ Great work on today's session! How are you feeling about the new routine?",
    time: '2m ago',
  },
  {
    type: 'user',
    text: 'Feeling great! The new exercises are challenging but I can already feel the difference',
  },
  {
    type: 'coach',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    text: "+ That's exactly what I like to hear! Remember to focus on your breathing during the lifts",
    time: '1h ago',
  },
  {
    type: 'user',
    text: 'Will do! Should I increase the weight next session?',
  },
];

const groupMessages = [
  {
    type: 'member',
    name: 'Alex',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    text: "Who's joining the 6am session tomorrow?",
    time: '15m ago',
  },
  {
    type: 'user',
    text: 'Count me in! 🙋‍♀️',
  },
  {
    type: 'member',
    name: 'Maria',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    text: "+ I'll be there too! Let's crush it 💪",
    time: '12m ago',
  },
  {
    type: 'coach',
    name: 'Coach Mike',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    text: "+ Love the energy team! We'll focus on compound movements tomorrow",
    time: '10m ago',
  },
  {
    type: 'user',
    text: 'Perfect! See you all bright and early ☀️',
  },
  {
    type: 'member',
    name: 'Jake',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    text: "+ Can't wait! Been working on my deadlift form all week",
    time: '5m ago',
  },
  {
    type: 'user',
    text: "+ Nice! I've been practicing my squats too 🏋️‍♀️",
  },
];

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<'coach' | 'group' | 'forum'>('coach');

  const renderCoachChat = () => (
    <View style={{ padding: 24 }}>
      <View style={{ gap: 16 }}>
        {coachMessages.map((msg, idx) =>
          msg.type === 'coach' ? (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
              <Image source={{ uri: msg.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={[styles.bubble, styles.coachBubble]}>
                  <Text style={styles.bubbleText}>{msg.text.replace('+ ', '')}</Text>
                </View>
                <Text style={styles.timeText}>{msg.time}</Text>
              </View>
            </View>
          ) : (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={[styles.bubble, styles.userBubble]}>
                  <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                </View>
              </View>
            </View>
          )
        )}
      </View>
    </View>
  );

  const renderGroupChat = () => (
    <View style={{ padding: 24 }}>
      <View style={{ gap: 16 }}>
        {groupMessages.map((msg, idx) => {
          if (msg.type === 'user') {
            return (
              <View key={idx} style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={[styles.bubble, styles.userBubble]}>
                    <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                  </View>
                </View>
              </View>
            );
          } else {
            return (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Image source={{ uri: msg.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={[styles.bubble, msg.type === 'coach' ? styles.coachBubble : styles.memberBubble]}>
                    {msg.name && (
                      <Text style={[styles.memberName, msg.type === 'coach' ? styles.coachName : styles.memberNameText]}>{msg.name}</Text>
                    )}
                    <Text style={styles.bubbleText}>{msg.text.replace('+ ', '')}</Text>
                  </View>
                  <Text style={styles.timeText}>{msg.time}</Text>
                </View>
              </View>
            );
          }
        })}
      </View>
    </View>
  );

  const renderForum = () => (
    <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Icon name="comments" size={32} color="#64748b" style={{ marginBottom: 8 }} />
      <Text style={{ color: '#64748b', fontSize: 16 }}>Forums coming soon!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'coach' ? styles.toggleBtnActive : styles.toggleBtnInactive]}
            onPress={() => setActiveTab('coach')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'coach' ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>Coach Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'group' ? styles.toggleBtnActive : styles.toggleBtnInactive]}
            onPress={() => setActiveTab('group')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'group' ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>Group Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'forum' ? styles.toggleBtnActive : styles.toggleBtnInactive]}
            onPress={() => setActiveTab('forum')}
          >
            <Text style={[styles.toggleBtnText, activeTab === 'forum' ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>Forums</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Main Content */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ flexGrow: 1 }}>
        {activeTab === 'coach' && renderCoachChat()}
        {activeTab === 'group' && renderGroupChat()}
        {activeTab === 'forum' && renderForum()}
      </ScrollView>
      {/* Message Input */}
      <View style={styles.messageInputBar}>
        <TouchableOpacity>
          <Icon name="plus" size={20} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
          />
        </View>
        <TouchableOpacity>
          <Icon name="paper-plane" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 4,
    marginBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#1f2937',
  },
  toggleBtnInactive: {
    backgroundColor: 'transparent',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  toggleBtnTextInactive: {
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
    maxWidth: width * 0.7,
  },
  coachBubble: {
    backgroundColor: '#3b82f6',
  },
  userBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberBubble: {
    backgroundColor: '#10b981',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
  },
  bubbleTextUser: {
    color: '#1f2937',
    fontSize: 15,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberNameText: {
    color: '#6ee7b7',
  },
  coachName: {
    color: '#bae6fd',
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  messageInputBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 15,
    color: '#1f2937',
    width: '100%',
  },
}); 