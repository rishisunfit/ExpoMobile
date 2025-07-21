import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome6";
import { createClient } from "@supabase/supabase-js";
import { COLORS } from "../styles";
import { useNavigation } from "@react-navigation/native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MobilityAssessmentScreen() {
  const navigation = useNavigation();
  const [folderName, setFolderName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [feeling, setFeeling] = useState<string>("");
  const [goal, setGoal] = useState("");
  const [pain, setPain] = useState("");
  const [sleep, setSleep] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setFeedback("");
    setImageUrls([]);

    console.log("FetchData called. FolderName:", folderName);
    const folder = folderName;

    if (!folder) {
      console.log("No folder specified, aborting.");
      setLoading(false);
      return;
    }

    console.log("Listing files in bucket folder:", folder);
    // List images from the bucket folder
    const { data: files, error: storageError } = await supabase.storage
      .from("mobility-frames")
      .list(folder);

    console.log("Files found:", files, "Storage error:", storageError);
    if (storageError || !files) {
      console.error(storageError);
      setLoading(false);
      return;
    }

    // Get public URLs for each image
    console.log("Getting public URLs for files...");
    const urls = await Promise.all(
      files.map(async (file) => {
        const { data } = await supabase.storage
          .from("mobility-frames")
          .getPublicUrl(`${folder}/${file.name}`);
        console.log("Public URL for", file.name, ":", data?.publicUrl);
        return data.publicUrl;
      })
    );

    console.log("Final image URLs:", urls);
    setImageUrls(urls);
    setLoading(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 32,
        backgroundColor: COLORS.background.secondary,
      }}
    >
      {/* View Data Section */}
      <LinearGradient
        colors={[COLORS.success, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconCircle}>
            <Icon name="chart-line" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>View Data</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and insights
          </Text>
          <View style={styles.folderInputRow}>
            <TextInput
              placeholder="Enter folder name"
              style={styles.folderInput}
              value={folderName}
              onChangeText={setFolderName}
              placeholderTextColor="#d1fae5"
            />
            <TouchableOpacity style={styles.fetchButton} onPress={fetchData}>
              <Text style={styles.fetchButtonText}>Fetch Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {loading && (
        <ActivityIndicator size="large" style={{ marginVertical: 24 }} />
      )}

      {/* Images Section */}
      {imageUrls.length > 0 && (
        <View style={styles.imagesSection}>
          {imageUrls.map((url, idx) => (
            <Image
              key={idx}
              source={{ uri: url }}
              style={styles.image}
              onError={(e) =>
                console.log("Image failed to load:", url, e.nativeEvent)
              }
            />
          ))}
        </View>
      )}

      {feedback ? (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Assessment Feedback</Text>
          <Text>{feedback}</Text>
        </View>
      ) : null}

      {/* Assessment Section */}
      <View style={styles.assessmentSection}>
        <Text style={styles.assessmentTitle}>Start your assessment</Text>

        {/* Poll Question */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={{ gap: 10 }}>
            {[
              { value: "excellent", label: "Excellent - Ready for anything!" },
              { value: "good", label: "Good - Feeling energized" },
              { value: "okay", label: "Okay - Could be better" },
              { value: "tired", label: "Tired - Need some rest" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioOption,
                  feeling === option.value && styles.radioOptionSelected,
                ]}
                onPress={() => setFeeling(option.value)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioCircle,
                    feeling === option.value && styles.radioCircleSelected,
                  ]}
                >
                  {feeling === option.value && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fill-in Questions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            What's your main fitness goal this week?
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe your goal..."
            placeholderTextColor="#94a3b8"
            value={goal}
            onChangeText={setGoal}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Any areas of concern or pain?</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Let us know about any discomfort..."
            placeholderTextColor="#94a3b8"
            value={pain}
            onChangeText={setPain}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            How many hours did you sleep last night?
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="8"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={sleep}
            onChangeText={setSleep}
            maxLength={2}
          />
        </View>

        {/* Video Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Watch: Movement Assessment Guide</Text>
          <View style={styles.videoPlaceholder}>
            <View style={styles.videoIconCircle}>
              <Icon name="play" size={28} color={COLORS.success} />
            </View>
            <Text style={styles.videoLabel}>Movement Assessment Tutorial</Text>
          </View>
          <Text style={styles.cardSubtitle}>Record Your Response</Text>
          <Text style={styles.cardDescription}>
            Follow the movements shown in the video and record yourself for
            assessment.
          </Text>
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={() => (navigation as any).navigate("VideoRecorderScreen")}
          >
            <Icon
              name="video"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.recordBtnText}>Record Response</Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            <Icon
              name="circle-info"
              size={18}
              color={COLORS.success}
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text style={styles.infoText}>
              Your video will be reviewed by your coach to provide personalized
              feedback and adjustments.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={() => {}}>
          <Icon
            name="paper-plane"
            size={20}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.submitBtnText}>Submit Assessment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    minHeight: 180,
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
    width: "100%",
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "300",
    marginBottom: 16,
  },
  folderInputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  folderInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    color: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  fetchButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  fetchButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  imagesSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginVertical: 10,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
  },
  feedbackContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.primary,
  },
  assessmentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  assessmentTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: 10,
    marginBottom: 4,
  },
  cardDescription: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  radioOptionSelected: {
    borderColor: COLORS.success,
    backgroundColor: "#f0fdf4",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: COLORS.success,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  radioLabel: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  videoPlaceholder: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 180,
    marginBottom: 14,
  },
  videoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  videoLabel: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    marginBottom: 10,
  },
  recordBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoText: {
    color: COLORS.text.primary,
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
});
