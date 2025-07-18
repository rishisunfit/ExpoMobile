import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../styles';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

// Mock data for now
const MOCK_VIDEO = {
  title: 'Core Strength Flow',
  description: 'A dynamic 15-minute core workout focusing on building strength and stability through controlled movements. Perfect for all fitness levels.',
  difficulty: 'Intermediate',
  duration: 15,
  category: 'Core',
  video_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
  breakdown: [
    { name: 'Plank Hold', duration: '45s' },
    { name: 'Mountain Climbers', duration: '30s' },
    { name: 'Dead Bug', duration: '60s' },
    { name: 'Russian Twists', duration: '45s' },
    { name: 'Cool Down Stretch', duration: '2min' },
  ],
};

export default function VideoMobilityDetailScreen({ route, navigation }: any) {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);

  // Get video from navigation params, fallback to MOCK_VIDEO
  const video = route?.params?.video || MOCK_VIDEO;

  // Helper to extract YouTube ID
  function extractYouTubeId(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : '';
  }
  // Helper to detect YouTube or Vimeo
  function getVideoType(url: string) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'unknown';
  }
  // Extract Vimeo video ID and privacy token (if present)
  function extractVimeoEmbedInfo(url: string) {
    const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)(?:\/(\w+))?/);
    if (!match) return null;
    return { id: match[1], token: match[2] };
  }

  // Video player logic
  const type = getVideoType(video.video_url);
  let videoPlayer = null;
  if (type === 'youtube') {
    const videoId = extractYouTubeId(video.video_url);
    videoPlayer = videoId ? (
      <YoutubePlayer
        height={220}
        width={width}
        videoId={videoId}
        play={false}
        webViewStyle={{ borderRadius: 0, overflow: 'hidden' }}
        initialPlayerParams={{ controls: true, modestbranding: true }}
      />
    ) : (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>Video not available</Text>
      </View>
    );
  } else if (type === 'vimeo') {
    const embedInfo = extractVimeoEmbedInfo(video.video_url);
    if (embedInfo && embedInfo.id) {
      const embedUrl = embedInfo.token
        ? `https://player.vimeo.com/video/${embedInfo.id}?h=${embedInfo.token}`
        : `https://player.vimeo.com/video/${embedInfo.id}`;
      videoPlayer = (
        <WebView
          source={{ uri: embedUrl }}
          style={{ width: width, height: 220, borderRadius: 0, overflow: 'hidden', backgroundColor: '#000' }}
          allowsFullscreenVideo
        />
      );
    } else {
      videoPlayer = <Text style={{ color: 'red', textAlign: 'center' }}>Invalid Vimeo URL: {video.video_url}</Text>;
    }
  } else {
    videoPlayer = <Text>Unsupported video type.</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{video.title}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="share" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.aspectVideo}>
            {videoPlayer}
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>{video.duration} min</Text>
            </View>
          </View>
        </View>

        {/* Workout Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{video.title}</Text>
          <Text style={styles.infoDesc}>{video.description}</Text>
          <View style={styles.badgeRow}>
            {video.difficulty && (
            <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}> 
                <Text style={[styles.badgeText, { color: '#16a34a' }]}>{video.difficulty}</Text>
            </View>
            )}
            {video.duration && (
            <View style={[styles.badge, { backgroundColor: '#f3f4f6' }]}> 
                <Text style={[styles.badgeText, { color: '#374151' }]}>{video.duration} min</Text>
            </View>
            )}
            {video.category && (
            <View style={[styles.badge, { backgroundColor: '#f3f4f6' }]}> 
                <Text style={[styles.badgeText, { color: '#374151' }]}>{video.category}</Text>
            </View>
            )}
          </View>
        </View>

        {/* Exercise Breakdown */}
        {video.breakdown && (
        <View style={styles.sectionPad}>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Exercise Breakdown</Text>
            <View style={{ marginTop: 8 }}>
                {video.breakdown.map((ex: any, i: number) => (
                <View key={i} style={styles.breakdownRow}>
                  <View style={styles.breakdownNumCircle}>
                    <Text style={styles.breakdownNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.breakdownName}>{ex.name}</Text>
                  <Text style={styles.breakdownDuration}>{ex.duration}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        )}

        {/* Notes Section */}
        <View style={styles.sectionPad}>
          <View style={styles.notesCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.notesTitle}>My Notes</Text>
              <Icon name="pen" size={16} color="#9ca3af" />
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="How did this workout feel? Any modifications you made? Notes for next time..."
              placeholderTextColor="#9ca3af"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Difficulty Rating</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Icon
                      name="star"
                      size={24}
                      color={rating >= star ? '#facc15' : '#d1d5db'}
                      solid={rating >= star}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Notes & Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 10,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  videoSection: {
    backgroundColor: '#000',
  },
  aspectVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 0,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  infoDesc: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionPad: {
    padding: 16,
    paddingTop: 0,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
  },
  breakdownTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  breakdownNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  breakdownNum: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  breakdownName: {
    flex: 1,
    fontWeight: '500',
    color: '#111827',
    fontSize: 15,
  },
  breakdownDuration: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 10,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  notesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 80,
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 