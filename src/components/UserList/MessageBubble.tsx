import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { defaultAvatar } from "../../assets";
import { getSignedUrl } from "../../services/coach.services";
import { Tables } from "../../types/database";
import { Conversation, User } from "../../types/types";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio, ResizeMode, Video } from "expo-av";
import { downloadAndSharePdf } from "../../utils";
const MessageBubble = ({ item }: { item: Tables<"messages"> }) => {
  const route =
    useRoute<RouteProp<{ params: { item: User; data: Conversation[] } }>>();

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageLoader, setImageLoader] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [fileDownloadLoading, setFileDownloadLoading] =
    useState<boolean>(false);
  const coach = route.params?.item;
  const isCoach = item.sender_id === coach.id;

  // Initialize audio session
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error("Error setting audio mode:", error);
      }
    };
    initAudio();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load signed URL for media files
  useEffect(() => {
    if (
      item.message_type === "image" ||
      item.message_type === "file" ||
      item.message_type === "voice" ||
      item.message_type === "video"
    ) {
      setLoading(true);
      getSignedUrl(item.file_path!, item.message_type)
        .then(async (data) => {
          if (item.message_type === "video") {
            console.log(JSON.stringify(data, null, 2));
          }
          setSignedUrl(data?.signedUrl || null);
          // Pre-load sound to get duration for voice messages
          if (item.message_type === "voice" && data?.signedUrl) {
            try {
              const { sound: tempSound } = await Audio.Sound.createAsync(
                { uri: data.signedUrl },
                { shouldPlay: false }
              );
              const status = await tempSound.getStatusAsync();
              if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
              }
              await tempSound.unloadAsync();
            } catch (error) {
              console.error("Error pre-loading sound:", error);
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [item]);

  // Update position during playback
  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setPosition(0);
            setIsPlaying(false);
          }
        }
      });

      return () => {
        sound.setOnPlaybackStatusUpdate(null);
      };
    }
  }, [sound]);

  const loadSound = async () => {
    try {
      if (!signedUrl) return null;
      setLoading(true);

      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: signedUrl },
        {
          shouldPlay: false,
          progressUpdateIntervalMillis: 100,
        }
      );

      setSound(newSound);
      setLoading(false);
      return newSound;
    } catch (error) {
      console.error("Error loading sound:", error);
      setLoading(false);
      return null;
    }
  };

  const playPauseAudio = async () => {
    try {
      let currentSound = sound;
      if (!currentSound) {
        currentSound = await loadSound();
        if (!currentSound) return;
      }

      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await currentSound.pauseAsync();
        } else {
          if (status.positionMillis === status.durationMillis) {
            await currentSound.setPositionAsync(0);
          }
          await currentSound.playAsync();
        }
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
      setIsPlaying(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    if (!milliseconds) return "0:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMessageType = useCallback(() => {
    if (item.message_type === "image") {
      return loading ? (
        <ActivityIndicator color={!isCoach ? "#fff" : "#10b981"} />
      ) : (
        <>
          {imageLoader && (
            <ActivityIndicator color={!isCoach ? "#fff" : "#10b981"} />
          )}
          <View style={{ gap: 10 }}>
            <Image
              source={{ uri: signedUrl! }}
              style={!imageLoader ? styles.imageContainer : {}}
              onLoadStart={() => {
                setImageLoader(true);
              }}
              onLoadEnd={() => {
                setImageLoader(false);
              }}
              onError={() => {
                setImageError(true);
              }}
            />
            {item.content.length > 0 && (
              <Text style={{ color: !isCoach ? "#fff" : "#1f2937" }}>
                {item.content}
              </Text>
            )}
          </View>
        </>
      );
    } else if (item.message_type === "video") {
      return (
        <View
          style={{
            gap: 10,
            position: "relative",
          }}
        >
          <Video
            source={{ uri: signedUrl! }}
            shouldPlay={false}
            resizeMode={ResizeMode.CONTAIN}
            style={{
              width: !isCoach ? 250 : "100%",
              height: 250,
              borderRadius: 10,
              alignSelf: "center",
            }}
            useNativeControls
            isLooping
          />
          {loading && (
            <ActivityIndicator
              style={{
                position: "absolute",
                top: 100,
                left: 85,
              }}
              color={!isCoach ? "#fff" : "#10b981"}
            />
          )}
          {item.content.length > 0 && (
            <Text style={{ color: !isCoach ? "#fff" : "#1f2937" }}>
              {item.content}
            </Text>
          )}
        </View>
      );
    } else if (item.message_type === "voice") {
      return (
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={playPauseAudio}
            style={[
              styles.bubble,
              {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 0,
                paddingVertical: 0,
                gap: 10,
                minWidth: 200,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 100,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <MaterialCommunityIcons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="#10b981"
                />
              )}
            </View>
            <View
              style={{
                flex: 1,
                gap: 5,
              }}
            >
              <Text style={{ color: !isCoach ? "#fff" : "#1f2937" }}>
                Voice Message
              </Text>
              <View
                style={{
                  height: 3,
                  backgroundColor: !isCoach
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.1)",
                  borderRadius: 3,
                }}
              >
                <View
                  style={{
                    width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: !isCoach ? "#fff" : "#10b981",
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text
                style={{ color: !isCoach ? "#fff" : "#1f2937", fontSize: 12 }}
              >
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </TouchableOpacity>
          {item.content.length > 0 && (
            <Text style={{ color: !isCoach ? "#fff" : "#1f2937" }}>
              {item.content}
            </Text>
          )}
        </View>
      );
    } else if (item.message_type === "file") {
      return (
        <View style={{ gap: 10 }}>
          <View style={styles.fileContainer}>
            <Text style={{ flex: 1, maxWidth: "80%" }}>{item.file_name}</Text>
            <TouchableOpacity
              style={{
                padding: 10,
                borderRadius: 100,
              }}
              onPress={async () => {
                try {
                  setFileDownloadLoading(true);
                  const data = await getSignedUrl(
                    item.file_path!,
                    item.message_type
                  );
                  await downloadAndSharePdf(data?.signedUrl!, item.file_name!);
                  setTimeout(() => {
                    setFileDownloadLoading(false);
                  }, 1000);
                } catch (error) {
                  console.error("Download error:", error);
                } finally {
                  setFileDownloadLoading(false);
                }
              }}
            >
              {fileDownloadLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <FontAwesome6 name="download" size={14} color="#10b981" />
              )}
            </TouchableOpacity>
          </View>
          {item.content.length > 0 && (
            <Text style={{ color: !isCoach ? "#fff" : "#1f2937" }}>
              {item.content}
            </Text>
          )}
        </View>
      );
    }
    return (
      <Text
        style={[
          styles.bubbleTextUser,
          !isCoach && {
            color: "#fff",
          },
        ]}
      >
        {item.content}
      </Text>
    );
  }, [
    item,
    signedUrl,
    loading,
    imageLoader,
    imageError,
    isPlaying,
    position,
    duration,
  ]);

  return isCoach ? (
    <View style={styles.messageRow}>
      <Image
        source={
          coach.profile_image_url
            ? { uri: coach.profile_image_url }
            : defaultAvatar
        }
        style={[styles.avatar, { marginRight: 10 }]}
      />
      <View style={{ flex: 1 }}>
        <View style={[styles.bubble, styles.coachBubble]}>
          {handleMessageType()}
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  ) : (
    <View style={styles.userMessageRow}>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <View style={[styles.bubble, styles.userBubble]}>
          {handleMessageType()}
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};
export default MessageBubble;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "70%",
  },
  coachBubble: {
    backgroundColor: "#fff",
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 15,
  },
  bubbleTextUser: {
    color: "#1f2937",
    fontSize: 15,
  },
  timeText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userMessageRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  messageInputBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 50,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 6,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 15,
    color: "#1f2937",
    width: "100%",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    // marginRight: 10,
  },
  imageCloseButton: {
    position: "absolute",
    top: -5,
    right: 5,
    zIndex: 1000,
    backgroundColor: "gray",
    borderRadius: 100,
    padding: 5,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  recordingText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "bold",
  },
  stopButton: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  playButton: {
    backgroundColor: "#10b981",
    padding: 8,
    borderRadius: 100,
  },
  audioLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  closeAudio: {
    backgroundColor: "#64748b",
    padding: 8,
    borderRadius: 100,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    height: 60,
    justifyContent: "space-between",
    gap: 10,
  },
});
