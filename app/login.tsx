import React, { useEffect } from "react";
import { View, Button, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../src/service/firebase"; 

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID
  });

  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        const { id_token } = response.authentication as any;

        const credential = GoogleAuthProvider.credential(id_token);

        await signInWithCredential(auth, credential);

        console.log("Usuário logado:", auth.currentUser);
      }
    };

    handleLogin();
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login</Text>

      <Button
        title="Entrar com Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
    </View>
  );
}