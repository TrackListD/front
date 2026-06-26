// app/profile/me.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ProfileView } from "../../components/ProfileView";
import { getMyProfile, UserProfile } from "../../src/service/userApi";

export default function MyProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyProfile() {
      try {
        const data = await getMyProfile();
        setUser(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    loadMyProfile();
  }, []);

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
        <Text style={{ color: "#a1a1a1" }}>
          Não foi possível carregar seu perfil
        </Text>
      </View>
    );

  return (
    <ProfileView
      user={user}
      isMe={true}
      onEditPress={() => router.push("/profile/edit")} // Encaminha para sua tela de edição
    />
  );
}
