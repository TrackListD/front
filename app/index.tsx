import { View, Text, Button } from "react-native";
import { auth } from "../src/service/firebase";
import { signOut } from "firebase/auth";
import { router, Href } from "expo-router";

export default function Home() {
  const user = auth.currentUser;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Home</Text>

      <Text>{user?.displayName}</Text>
      <Text>{user?.email}</Text>

      {/* TEMPORÁRIO: botão de teste para navegação até a tela de Detalhe.
          Substituir pelo fluxo real quando a tela de Lista de Avaliações
          (GET /api/ratings/user/{userId}) for implementada.
          O ID fixo "1" deve ser substituído por um ID real após a entrega
          da sprint de Mídia pelo colega responsável (dependência bloqueante). */}
      <Button
        title="Ver Avaliação de Teste"
        onPress={() => router.push("/ratings/1" as Href)}
      />

      <Button
        title="Logout"
        onPress={() => signOut(auth)}
      />
    </View>
  );
}