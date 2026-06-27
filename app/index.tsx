// Tela: Home — tela inicial do aplicativo.

import { View, Text, Button } from "react-native";
import { auth } from "../src/service/firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const user = auth.currentUser;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Home</Text>

      <Text>{user?.displayName}</Text>
      <Text>{user?.email}</Text>

      <Button
        title="Logout"
        onPress={() => signOut(auth)}
      />
    </View>
  );
}