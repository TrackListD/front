import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
        profilePic: profilePic.trim() === "" ? null : profilePic,
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

  async function handleDeleteAccount() {
    Alert.alert(
      "Excluir Conta",
      "Tem certeza absoluta? Essa ação é permanente e apagará todos os seus dados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMyAccount();
              // Redireciona para login ou tela inicial após deletar
              router.replace("/login");
            } catch (err) {
              Alert.alert("Erro", "Não foi possível excluir sua conta.");
            }
          },
        },
      ],
    );
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
        <Text style={styles.avatarLabel}>
          Preencha com a URL da nova imagem
        </Text>
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

        <Text style={styles.inputLabel}>URL da foto de perfil</Text>
        <TextInput
          style={styles.input}
          value={profilePic}
          onChangeText={setProfilePic}
          placeholder="https://linkdaimagem.com/foto.jpg"
          placeholderTextColor="#555"
          autoCapitalize="none"
          keyboardType="url"
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
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
        </TouchableOpacity>
      </View>
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
  avatarLabel: {
    color: COLORS.textSubtle,
    fontSize: 12,
    marginTop: 8,
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
});
