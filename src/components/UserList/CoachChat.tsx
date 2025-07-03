import { AntDesign } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Audio, ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { defaultAvatar } from "../../assets";
import { getUser } from "../../services/auth.services";
import {
  getAllMessages,
  sendChat,
  uploadFile,
} from "../../services/coach.services";
import { Tables } from "../../types/database";
import { Conversation, User } from "../../types/types";
import ImagePickerModal from "../modal/ImagePickerModal";
import MessageBubble from "./MessageBubble";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
const CoachChat: React.FC = () => {
  const route =
    useRoute<RouteProp<{ params: { item: User; data: Conversation[] } }>>();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const coach = route.params?.item;
  const chat = route.params.data[0];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<
    string | undefined
  >(undefined);
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [imageLoader, setImageLoader] = useState<boolean>(false);
  const [isImagePickerModalVisible, setIsImagePickerModalVisible] =
    useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewPosition, setPreviewPosition] = useState<number>(0);
  const previewInterval = useRef<NodeJS.Timeout | null>(null);
  const [file, setFile] = useState<any>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const { top } = useSafeAreaInsets();
  // Fetch initial messages and user

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        setCurrentUser(user);
        const { messages: initialMessages, hasMore: moreMessages } =
          await getAllMessages(chat.id);
        setMessages(initialMessages);
        setHasMore(moreMessages);
        if (initialMessages.length > 0) {
          setLastMessageTimestamp(
            initialMessages[initialMessages.length - 1].created_at
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.log("error", JSON.stringify(error, null, 2));
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("chat-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat.id}`,
        },
        (payload) => {
          const message = payload.new;
          // Show only messages between this user and this coach
          if (
            message.sender_id === currentUser?.id ||
            message.sender_id === coach.id
          ) {
            setMessages((prev) => [message, ...prev]);
          }
        }
      )
      .subscribe(() => {});

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMoreMessages = async () => {
    if (!hasMore || isLoadingMore || !lastMessageTimestamp) return;

    try {
      setIsLoadingMore(true);
      const { messages: moreMessages, hasMore: moreAvailable } =
        await getAllMessages(chat.id, 20, lastMessageTimestamp);

      if (moreMessages.length > 0) {
        setMessages((prev) => [...prev, ...moreMessages]);
        setLastMessageTimestamp(
          moreMessages[moreMessages.length - 1].created_at
        );
        setHasMore(moreAvailable);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Error fetching more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendFile = async (file: any) => {
    let newFile;
    if (file.assets[0].uri?.length) {
      const { data: fileData, error } = await uploadFile(
        file.assets[0].uri,
        chat.id,
        file.assets[0].name.split(".")[0] +
          "-" +
          Date.now().toString() +
          Math.random().toString(36).substring(2, 15) +
          "." +
          file.assets[0].name.split(".")[1]
      );
      if (fileData) {
        newFile = fileData;
      }
    }
    return newFile;
  };

  const sendMessage = useCallback(async () => {
    setImageLoader(true);
    let newFile;
    if (
      newMessage.trim().length === 0 &&
      !image &&
      !file &&
      !recordingUri &&
      !video
    ) {
      return;
    }
    if (video) {
      console.log("video", video);
      const fileName = `video_${Date.now()}.mp4`;
      const { data, error } = await uploadFile(video, chat.id, fileName);
      newFile = data;
    }
    if (recordingUri && recordingUri?.length) {
      const fileName = `voice_${Date.now()}.m4a`;
      const { data, error } = await uploadFile(recordingUri, chat.id, fileName);
      newFile = data;
    }
    if (image && image?.length) {
      const { file, error } = await sendImage();
      if (file) {
        newFile = file;
      }
      setImageLoader(false);
    } else if (file && file.assets[0].uri?.length) {
      const fileData = await sendFile(file);
      if (fileData) {
        newFile = fileData;
      }
      setFile(null);
    }

    const tempMessage: Tables<"messages"> & {
      receiver_id: string;
    } = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: currentUser?.id,
      receiver_id: coach.id,
      created_at: new Date().toISOString(),
      conversation_id: chat.id,
      file_path: newFile?.path ?? null,
      file_name: newFile?.fullPath.split("/").pop() ?? null,
      message_type: recordingUri
        ? "voice"
        : file
        ? "file"
        : image
        ? "image"
        : video
        ? "video"
        : "text",
    };
    setMessages((prev) => [tempMessage, ...prev]); // Optimistic update
    setNewMessage(""); // Clear input immediately
    setRecordingUri(null);
    setFile(null);
    setImage(null);
    setImageLoader(false);
    setRecording(null);
    setVideo(null);
    try {
      await sendChat({
        p_conversation_id: chat.id,
        p_content: newMessage.trim(),
        p_message_type: recordingUri
          ? "voice"
          : file
          ? "file"
          : image
          ? "image"
          : video
          ? "video"
          : "text",
        p_file_path: newFile?.path,
        p_file_name: newFile?.fullPath.split("/").pop(),
      });
    } catch (error) {
      imageLoader && setImageLoader(false);
      // Remove the temporary message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMessage(newMessage.trim()); // Restore the message in the input
    } finally {
      setImageLoader(false);
    }
  }, [
    chat.id,
    newMessage,
    currentUser?.id,
    coach.id,
    image,
    imageLoader,
    file,
    recordingUri,
    video,
  ]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickCamera = async () => {
    setTimeout(() => {
      setIsImagePickerModalVisible(false);
    }, 500);
    // No permissions request is necessary for launching the image library
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow camera access");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickFile = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync();
      if (result) {
        setImage(null);
        setFile(result);
      }
    } catch (error) {
      console.log("error", JSON.stringify(error, null, 2));
    }
  };

  const handleAttachementPress = async () => {
    // await pickImage();
    setIsImagePickerModalVisible(true);
  };

  // Initialize audio session
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error setting audio mode:", error);
      }
    };
    initAudio();
  }, []);

  // Cleanup recording interval
  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setRecordingUri(null);
      setRecordingDuration(0);

      // Start duration counter
      recordingInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1000);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }

      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      setRecording(null);
      setRecordingUri(uri || null);

      // Set audio mode back to playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  // Update preview position during playback
  useEffect(() => {
    if (sound && isPlayingPreview) {
      previewInterval.current = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPreviewPosition(status.positionMillis);
          if (status.didJustFinish) {
            setIsPlayingPreview(false);
            setPreviewPosition(0);
            clearInterval(previewInterval.current!);
          }
        }
      }, 100);

      return () => {
        if (previewInterval.current) {
          clearInterval(previewInterval.current);
        }
      };
    }
  }, [sound, isPlayingPreview]);

  const playRecording = async () => {
    if (!recordingUri) return;
    try {
      // Ensure audio mode is set for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        if (isPlayingPreview) {
          await sound.pauseAsync();
          setIsPlayingPreview(false);
          if (previewInterval.current) {
            clearInterval(previewInterval.current);
          }
        } else {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.positionMillis === status.durationMillis) {
              await sound.setPositionAsync(0);
              setPreviewPosition(0);
            }
            await sound.playAsync();
            setIsPlayingPreview(true);
          }
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordingUri },
          {
            shouldPlay: true,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
          },
          (status) => {
            if (status.isLoaded) {
              if (!status.isPlaying) {
                setIsPlayingPreview(false);
                if (previewInterval.current) {
                  clearInterval(previewInterval.current);
                }
              }
            }
          }
        );
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setPreviewDuration(status.durationMillis || 0);
        }
        setSound(newSound);
        setIsPlayingPreview(true);
      }
    } catch (err) {
      console.error("Failed to play recording", err);
    }
  };

  const pickVideo = async () => {
    setVideo(null);
    setVideoLoading(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access");
      return;
    }
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to pick video", error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const sendImage = async () => {
    setImageLoader(true);
    setImage(null);
    const fileName = Date.now() + `_` + image?.split("/").pop();
    const { data, error } = await uploadFile(image!, chat.id, fileName);
    if (data) {
      return { file: data, error: null };
    }
    return { file: null, error: true };
  };

  const renderMessageItem = ({ item }: { item: Tables<"messages"> }) => {
    return <MessageBubble item={item} />;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
      </View>
    );
  };

  const renderChatContainer = () => {
    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 24, gap: 16 }}
        inverted={messages.length > 0}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
      />
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -top + 35}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Image
            source={
              coach.profile_image_url
                ? { uri: coach.profile_image_url }
                : defaultAvatar
            }
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text>{coach.full_name}</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
        ) : (
          renderChatContainer()
        )}
        <View style={[styles.messageInputBar]}>
          {file && (
            <View style={styles.fileContainer}>
              <FontAwesome6 name="file" size={12} color="#000" />
              <Text style={{ flex: 1, fontSize: 14, color: "#000" }}>
                {file.assets[0].name}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#10b981",
                  padding: 10,
                  borderRadius: 100,
                }}
                onPress={() => setFile(null)}
              >
                <FontAwesome6 name="xmark" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {image && (
            <View>
              <Image source={{ uri: image }} style={styles.imageContainer} />
              <TouchableOpacity
                onPress={() => setImage(null)}
                style={styles.imageCloseButton}
              >
                <FontAwesome6 name="xmark" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {video && (
            <View>
              <Video
                source={{ uri: video }}
                style={{ width: 100, height: 100, borderRadius: 10 }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                useNativeControls
                isLooping
                onLoadStart={() => setVideoLoading(true)}
                onLoad={() => setVideoLoading(false)}
                onError={(error) => {
                  console.error("Video load error:", error);
                  setVideoLoading(false);
                }}
              />
              <TouchableOpacity
                onPress={() => setVideo(null)}
                style={styles.imageCloseButton}
              >
                <FontAwesome6 name="xmark" size={10} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {recording && (
            <View style={styles.recordingIndicator}>
              <Text style={styles.recordingText}>
                Recording... {formatTime(recordingDuration)}
              </Text>
              <TouchableOpacity
                onPress={stopRecording}
                style={styles.stopButton}
              >
                <FontAwesome6 name="stop" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {recordingUri && (
            <View style={styles.audioPreview}>
              <View style={styles.recordingContainer}>
                <TouchableOpacity
                  onPress={playRecording}
                  style={{
                    backgroundColor: "#fff",
                    padding: 10,
                    borderRadius: 100,
                  }}
                >
                  <FontAwesome6
                    name={isPlayingPreview ? "pause" : "play"}
                    size={14}
                    color="#10b981"
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={{ color: "#1f2937" }}>Preview Recording</Text>
                  <View
                    style={{
                      height: 3,
                      backgroundColor: "rgba(0,0,0,0.1)",
                      borderRadius: 3,
                    }}
                  >
                    <View
                      style={{
                        width: `${
                          previewDuration > 0
                            ? (previewPosition / previewDuration) * 100
                            : 0
                        }%`,
                        height: "100%",
                        backgroundColor: "#10b981",
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <Text style={{ color: "#1f2937", fontSize: 12 }}>
                    {formatTime(previewPosition)} /{" "}
                    {formatTime(previewDuration)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setRecordingUri(null);
                    setFile(null);
                    setImage(null);
                    setImageLoader(false);
                    setRecording(null);
                    setPreviewPosition(0);
                    setPreviewDuration(0);
                    if (sound) {
                      sound.unloadAsync();
                      setSound(null);
                    }
                    setIsPlayingPreview(false);
                    setPreviewPosition(0);
                    setPreviewDuration(0);
                    if (previewInterval.current) {
                      clearInterval(previewInterval.current);
                    }
                  }}
                  style={styles.closeAudio}
                >
                  <FontAwesome6 name="xmark" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={handleAttachementPress}>
              <FontAwesome6 name="plus" size={20} color="#64748b" />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#64748b"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={sendMessage}
              />
            </View>
            {imageLoader ? (
              <ActivityIndicator color={"#10b981"} />
            ) : (
              <TouchableOpacity onPress={() => sendMessage()}>
                <FontAwesome6 name="paper-plane" size={20} color="#10b981" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setImage(null);
                setFile(null);
                setRecordingUri(null);
                setRecordingDuration(0);
                setPreviewPosition(0);
                setPreviewDuration(0);
                setIsPlayingPreview(false);
                setVideo(null);
                if (recording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
            >
              <FontAwesome6
                name={recording ? "stop" : "microphone"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>
        <ImagePickerModal
          isVisible={isImagePickerModalVisible}
          onClose={() => setIsImagePickerModalVisible(false)}
          onCameraPress={() => {
            pickCamera();
            setIsImagePickerModalVisible(false);
          }}
          onImagePress={() => {
            pickImage();
            setIsImagePickerModalVisible(false);
          }}
          onFilePress={() => {
            pickFile();
            setIsImagePickerModalVisible(false);
          }}
          onVideoPress={() => {
            pickVideo();
            setIsImagePickerModalVisible(false);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CoachChat;

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
    backgroundColor: "#3b82f6",
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
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
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
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
  },
  audioButtonContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 100,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    height: 50,
    justifyContent: "space-between",
    gap: 10,
  },
});
