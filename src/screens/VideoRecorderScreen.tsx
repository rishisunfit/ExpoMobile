import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function VideoRecorderScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"back" | "front">("back");
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimeout, setRecordingTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  // Animations
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-request permission on component mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Fade in animation when camera loads
  useEffect(() => {
    if (permission?.granted) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [permission?.granted]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (cameraRef.current) {
      console.log("Starting recording...");

      // Record button animation
      Animated.sequence([
        Animated.timing(recordButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(recordButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setIsRecording(true);

      try {
        console.log("Calling recordAsync...");

        // Set a timeout to handle cases where stopRecording doesn't resolve the promise
        const timeoutId = setTimeout(() => {
          console.log("Recording timeout - forcing stop");
          setIsRecording(false);
        }, 30000); // 30 second max recording time
        setRecordingTimeout(timeoutId);

        const video = await cameraRef.current.recordAsync();
        console.log("Recording finished, video:", video);

        // Clear timeout since recording finished normally
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          setRecordingTimeout(null);
        }

        setIsRecording(false);

        if (video?.uri) {
          console.log("Setting video URI and showing modal");
          setVideoUri(video.uri);
          setShowModal(true);
        } else {
          console.log("No video URI received");
        }
      } catch (error) {
        console.error("Recording failed:", error);
        setIsRecording(false);
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          setRecordingTimeout(null);
        }
      }
    } else {
      console.log("Camera ref not available");
    }
  };

  const stopRecording = async () => {
    console.log("Stop recording called, isRecording:", isRecording);
    console.log("Camera ref exists:", !!cameraRef.current);

    if (cameraRef.current && isRecording) {
      try {
        console.log("Calling stopRecording on camera");
        await cameraRef.current.stopRecording();
        console.log("Stop recording called successfully");

        // If the promise doesn't resolve in 2 seconds, force the state change
        setTimeout(() => {
          if (isRecording) {
            console.log("Force stopping recording - promise did not resolve");
            setIsRecording(false);
            // For now, show modal without video (you might want to handle this differently)
            setShowModal(true);
          }
        }, 2000);
      } catch (error) {
        console.error("Error in stopRecording:", error);
        // Fallback - manually reset state if stop fails
        setIsRecording(false);
        setShowModal(true);
      }
    } else {
      console.log("Cannot stop - camera ref or recording state issue");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.permissionContainer}
      >
        <View style={styles.permissionContent}>
          <View style={styles.cameraIconContainer}>
            <Ionicons name="videocam" size={40} color="#fff" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to record videos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.cameraContainer, { opacity: fadeAnim }]}>
        <CameraView ref={cameraRef} style={styles.camera} facing={type}>
          {/* Header with recording indicator */}
          <View style={styles.header}>
            {isRecording && (
              <Animated.View
                style={[
                  styles.recordingIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  REC {formatTime(recordingTime)}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Flip camera button */}
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setType(type === "back" ? "front" : "back")}
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Record button */}
            <Animated.View
              style={{ transform: [{ scale: recordButtonScale }] }}
            >
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerActive,
                  ]}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </Animated.View>

      {/* Upload Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="videocam" size={48} color="#3b82f6" />
            <Text style={styles.modalTitle}>Video Recorded!</Text>
            <Text style={styles.modalMessage}>
              Would you like to upload this video?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setVideoUri(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.uploadButton]}
                onPress={() => {
                  // TODO: handle upload
                  setShowModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  cameraIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionMessage: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  recordingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 50,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  recordButtonActive: {
    backgroundColor: "rgba(220, 38, 38, 0.3)",
    borderColor: "#dc2626",
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#3b82f6",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
