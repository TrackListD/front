import { useRouter } from "expo-router";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FeedList from "../../src/components/FeedList";
import { auth } from "../../src/service/firebase";

export default function MyFeedScreen() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#12161A" />

      {!checkingAuth && !user ? (
        <View style={styles.loggedOutContainer}>
          <Text style={styles.loggedOutTitle}>Entre para ver seu feed</Text>
          <Text style={styles.loggedOutSubtitle}>
            Faça login com sua conta Google para ver publicações personalizadas
            com base em quem você segue.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Ir para login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FeedList
          endpoint="/feed/me"
          emptyMessage="Você ainda não tem publicações no seu feed. Siga outros usuários para ver as avaliações deles aqui."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12161A",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1F242A",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loggedOutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  loggedOutSubtitle: {
    fontSize: 14,
    color: "#8A8A8F",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#172d29",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#203e39",
  },
  loginButtonText: {
    color: "#9cb1ad",
    fontSize: 15,
    fontWeight: "600",
  },
});
