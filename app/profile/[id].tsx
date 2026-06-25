// app/profile/[id].tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ProfileView } from "../../components/ProfileView";
import { getUserById, UserProfile } from "../../src/service/userApi";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserById(Number(id));
        setUser(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1, backgroundColor: "#111214" }} />
    );
  if (!user)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111214",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#a1a1a1" }}>Usuário não encontrado</Text>
      </View>
    );

  return (
    <ProfileView
      user={user}
      isMe={false}
      following={following}
      onFollowPress={() => setFollowing(!following)}
    />
  );
}
