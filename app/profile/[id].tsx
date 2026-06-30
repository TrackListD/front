// app/profile/[id].tsx
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ProfileView } from "../../components/ProfileView";
import {
  followUser,
  getMyProfile,
  getUserById,
  unfollowUser,
  UserProfile,
} from "../../src/service/userApi";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      setLoading(true);

      // Antes de buscar o perfil pelo id da rota, checamos se esse id é
      // o do próprio usuário logado. Se for, redirecionamos para
      // /profile/me — assim a tela "genérica" nunca trata o próprio
      // usuário como um perfil externo (o que escondia/mostrava
      // indevidamente botões como "Seguir").
      try {
        const myProfile = await getMyProfile();
        if (myProfile.id === Number(id)) {
          router.replace("/profile/me" as Href);
          return;
        }
      } catch (meErr) {
        // Se getMyProfile falhar (ex: usuário deslogado vendo perfil
        // público), seguimos normalmente carregando o perfil pelo id —
        // não bloqueamos a visualização por causa disso.
        console.log("Não foi possível verificar usuário atual:", meErr);
      }

      const data = await getUserById(Number(id));
      setUser(data);
    } catch (err: any) {
      console.log("Erro ao carregar perfil:", err);
      if (err?.message?.includes("401") || err?.message?.includes("403")) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFollowPress() {
    if (!user) return;
    const wasFollowing = user.currentUserIsFollowing;
    // Atualização otimista da UI
    setUser({
      ...user,
      currentUserIsFollowing: !wasFollowing,
      followersCount: wasFollowing
        ? Math.max(0, user.followersCount - 1)
        : user.followersCount + 1,
    });

    try {
      if (wasFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch (err: any) {
      console.log(err);
      // desfaz alteração
      setUser(user);
      if (err?.message?.includes("401") || err?.message?.includes("403")) {
        router.replace("/login");
      }
    }
  }

  if (loading) {
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          backgroundColor: "#111214",
        }}
      />
    );
  }

  if (!user) {
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
  }

  return (
    <ProfileView
      user={user}
      isMe={false}
      following={user.currentUserIsFollowing}
      onFollowPress={handleFollowPress}
    />
  );
}
