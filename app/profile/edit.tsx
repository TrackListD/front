import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteMyAccount,
  getMyProfile,
  updateMyProfile,
} from "../../src/service/userApi";

const COLORS = {
  bg: "#111214",
  bgSubtle: "#1c1c1e",
  text: "#ffffff",
  textSubtle: "#a1a1a1",
  accent: "#60a5fa",
  danger: "#ef4444",
};

const genericProfilePic = {
  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados dos campos controlados
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    async function loadCurrentData() {
      try {
        const user = await getMyProfile();
        setName(user.name || "");
        setBio(user.bio || "");
        setProfilePic(user.profilePic || "");
      } catch (err) {
        Alert.alert(
          "Erro",
          "Não foi possível carregar os dados do seu perfil.",
        );
        router.back();
      } finally {
        setLoading(false);
      }
    }
    loadCurrentData();
  }, []);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Aviso", "O nome do usuário não pode ficar vazio.");
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile({
        name,
        bio,
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Erro", "Falha ao salvar as alterações no servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteMyAccount();
      await signOut(getAuth());
      setShowDeleteModal(false);
      router.replace("/login");
    } catch (err) {
      setShowDeleteModal(false);
      Alert.alert("Erro", "Não foi possível excluir sua conta.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <ActivityIndicator style={{ flex: 1, backgroundColor: COLORS.bg }} />
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <Text style={styles.saveText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <Image
          source={profilePic ? { uri: profilePic } : genericProfilePic}
          style={styles.avatar}
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Nome de usuário</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor="#555"
        />

        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Fale um pouco sobre você..."
          placeholderTextColor="#555"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir Conta</Text>
            <Text style={styles.modalMessage}>
              Tem certeza absoluta? Essa ação é permanente e apagará todos os
              seus dados.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 16,
    height: 50,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  saveText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "#2c2c2e",
  },
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  inputLabel: {
    color: COLORS.textSubtle,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.bgSubtle,
    color: COLORS.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  deleteButton: {
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalMessage: {
    color: COLORS.textSubtle,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "transparent",
  },
  modalCancelText: {
    color: COLORS.textSubtle,
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmButton: {
    backgroundColor: COLORS.danger,
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
