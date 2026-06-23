import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import FeedList from "../../src/components/FeedList";

export default function GlobalFeedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#12161A" />

      <FeedList
        endpoint="/feed/global"
        emptyMessage="Nenhum post encontrado no momento."
      />
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
});
