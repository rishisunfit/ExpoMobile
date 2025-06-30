import React, { useEffect, useState } from "react";
import UserList from "../common/UserList";
import { getCoach } from "../../services/coach.services";
import { getUser } from "../../services/auth.services";
import { supabase } from "../../../lib/supabase";
import { Chat } from "../../types/types";

const Coach: React.FC = () => {
  const [coach, setCoach] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let userId: string | null = null;

    const fetchCoach = async () => {
      setLoading(true);
      try {
        const user = await getUser();
        userId = user.id;
        const coachData = await getCoach(userId);
        setCoach(coachData as unknown as Chat[]);
      } catch (error) {
        console.log("error fetching coaches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();

    // Subscribe to real-time updates
    if (userId !== null) {
      const subscription = supabase
        .channel("coach-conversation")
        .on(
          "postgres_changes",
          {
            event: "*", // or use 'INSERT' and 'UPDATE'
            schema: "public",
            table: "direct_conversations",
            filter: `user_one_id=eq.${userId}.or.user_two_id=eq.${userId}`, // Adjust this depending on your schema
          },
          (payload: any) => {
            console.log("Real-time message payload:", payload);
            // Refetch data on new message
            fetchCoach();
          }
        )
        .subscribe();

      return () => {
        // Clean up subscription
        supabase.removeChannel(subscription);
      };
    }
  }, []);

  return <UserList data={coach} chatType="CoachChat" loading={loading} />;
};

export default Coach;
