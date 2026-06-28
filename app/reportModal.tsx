import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ReportModalScreen() {
  const router = useRouter();
  
  // Captura os parâmetros enviados para saber quem/o que está sendo denunciado
  const { commentId, userTargetId, reason } = useLocalSearchParams();

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = async () => {
    if (!description.trim()) {
      Alert.alert("Erro", "Por favor, descreva o motivo da denúncia.");
      return;
    }

    setLoading(true);

    // DTO exato que o seu backend Java espera no @RequestBody ReportRequestDTO
    const reportData = {
      informer_id: 1, // Exemplo: Substitua pelo ID do usuário logado vindo do seu AuthContext/Firebase
      user_target_id: userTargetId ? Number(userTargetId) : null,
      comment_target_id: commentId ? Number(commentId) : null,
      report_reason: description
    };

    try {
      // Use o IP da sua máquina local na rede (não use localhost, pois o emulador/celular não achará o Spring)
      const response = await fetch('http://192.168.X.X:8080/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok || response.status === 201) {
        Alert.alert("Denúncia Enviada", "Agradecemos o envio. Nossa equipe de moderação irá analisar o conteúdo.");
        router.back(); // Fecha o modal e volta para a tela anterior
      } else {
        Alert.alert("Erro", "Ocorreu um problema ao enviar a denúncia. Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Denunciar Conteúdo</ThemedText>
      <ThemedText style={styles.subtitle}>
        Ajude-nos a manter a comunidade do TrackListd segura e respeitosa.
      </ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Explique o motivo (ex: Discurso de ódio, assédio, spam, spoiler...)"
        placeholderTextColor="#777"
        multiline
        numberOfLines={5}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity 
        style={[styles.button, styles.submitButton]} 
        onPress={handleSubmitReport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <ThemedText style={styles.buttonText}>Enviar Denúncia</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1C1C1E', // Fundo cinza escuro alinhado com o Dark Mode dos seus protótipos
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#1DB954', // O tom verde "Spotify" que você usou no "Começar Agora"
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: '#FF453A', // Cor vermelha suave para desistência
    fontWeight: '600',
  },
});