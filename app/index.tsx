import { View, Text, Button } from "react-native";
import { auth } from "../src/service/firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const user = auth.currentUser;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home</Text>

      <Text>{user?.displayName}</Text>
      <Text>{user?.email}</Text>

      <Button
        title="Logout"
        onPress={() => signOut(auth)}
      />
    </View>
  );
}