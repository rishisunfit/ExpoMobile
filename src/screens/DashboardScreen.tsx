import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { DailyHabits } from "../components/dashboard/DailyHabits";
import { WorkoutCard } from "../components/dashboard/WorkoutCard";
import { NutritionCard } from "../components/dashboard/NutritionCard";
import { StepsCard } from "../components/dashboard/StepsCard";
import { SleepCard } from "../components/dashboard/SleepCard";
import { RecoveryCard } from "../components/dashboard/RecoveryCard";
import { ReadinessCard } from "../components/dashboard/ReadinessCard";
import { Typography } from "../components/common/Typography";
import { Card } from "../components/common/Card";
import { COLORS, SPACING } from "../styles";
import { supabase } from "../../lib/supabase";

export default function DashboardScreen() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("id, full_name, role")
            .eq("id", user.id)
            .single();

          if (profile?.full_name) {
            // Split the full name and take just the first part
            const firstName = profile.full_name.split(" ")[0];
            setUserName(firstName);
          } else {
            setUserName(user.email?.split("@")[0] || "User");
          }
        }
      } catch (error) {
        console.log("❌ Error:", error);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setUserName(user.email.split("@")[0]);
        }
      }
    };

    fetchUserName();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Banner */}
        <Card style={styles.welcomeBanner}>
          <Typography.H1>Welcome back, {userName}</Typography.H1>
          <Typography.Subtext style={styles.welcomeSubtitle}>
            Monday, June 4
          </Typography.Subtext>
        </Card>

        <DailyHabits />
        <WorkoutCard />
        <NutritionCard />
        <StepsCard />
        <SleepCard />
        <RecoveryCard />
        <ReadinessCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  welcomeBanner: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl * 1.5,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  welcomeSubtitle: {
    marginTop: SPACING.xs,
  },
});
