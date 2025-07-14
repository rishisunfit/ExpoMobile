import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { supabase } from '../../../lib/supabase';
import { Card } from '../common/Card';
import { COLORS } from '../../styles';
import { Database } from '../../types/database';

const { width } = Dimensions.get('window');

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
  // Supports vimeo.com/123456789, vimeo.com/123456789/token, player.vimeo.com/video/123456789
  const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)(?:\/(\w+))?/);
  if (!match) return null;
  return { id: match[1], token: match[2] };
}

export default function VideoMobilityList() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mobility_videos')
        .select('*')
        .order('created_at', { ascending: false });
      setVideos(data || []);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;
    const type = getVideoType(selectedVideo.video_url);
    if (type === 'youtube') {
      const youtubeId = extractYouTubeId(selectedVideo.video_url);
      if (!youtubeId) {
        return <Text>Invalid YouTube URL.</Text>;
      }
      return (
        <View style={styles.playerContainer}>
          <YoutubePlayer
            height={220}
            width={width - 48}
            videoId={youtubeId}
            play={true}
            webViewStyle={{ borderRadius: 12, overflow: 'hidden' }}
            initialPlayerParams={{ controls: true, modestbranding: true }}
          />
        </View>
      );
    } else if (type === 'vimeo') {
      const embedInfo = extractVimeoEmbedInfo(selectedVideo.video_url);
      if (!embedInfo || !embedInfo.id) {
        console.warn('Invalid Vimeo URL:', selectedVideo.video_url);
        return <Text style={{ color: 'red', textAlign: 'center' }}>Invalid Vimeo URL: {selectedVideo.video_url}</Text>;
      }
      const embedUrl = embedInfo.token
        ? `https://player.vimeo.com/video/${embedInfo.id}?h=${embedInfo.token}`
        : `https://player.vimeo.com/video/${embedInfo.id}`;
      // Debug: If this is the hardcoded test video, show example.com instead
      const isHardcodedTest = selectedVideo.id === 'hardcoded-vimeo';
      return (
        <View style={[styles.playerContainer, { backgroundColor: '#eee', borderWidth: 2, borderColor: 'red' }]}> 
          <WebView
            source={{ uri: isHardcodedTest ? 'https://example.com' : embedUrl }}
            style={{ width: width - 48, height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: 'yellow' }}
            allowsFullscreenVideo
          />
        </View>
      );
    } else {
      return (
        <View style={styles.playerContainer}>
          <Text>Unsupported video type.</Text>
        </View>
      );
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
  }

  if (selectedVideo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {renderVideoPlayer()}
        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedVideo(null)}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const type = getVideoType(item.video_url);
            let thumbnailSource = null;
            if (item.thumbnail_url) {
              thumbnailSource = { uri: item.thumbnail_url };
            } else if (type === 'youtube') {
              const youtubeId = extractYouTubeId(item.video_url);
              if (youtubeId) {
                thumbnailSource = { uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` };
              }
            }
            return (
              <TouchableOpacity onPress={() => setSelectedVideo(item)}>
                <Card style={styles.card}>
                  <View style={styles.thumbnailContainer}>
                    {thumbnailSource ? (
                      <Image source={thumbnailSource} style={styles.thumbnail} />
                    ) : (
                      <View style={[styles.thumbnail, { backgroundColor: COLORS.background.secondary, justifyContent: 'center', alignItems: 'center' }]}> 
                        <Text style={{ color: COLORS.text.secondary }}>No Image</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={selectedVideo ? (
            <View style={{ marginBottom: 24 }}>
              {renderVideoPlayer()}
              <TouchableOpacity onPress={() => setSelectedVideo(null)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Close Video</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
    color: COLORS.text.primary,
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  playerContainer: {
    width: width - 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
