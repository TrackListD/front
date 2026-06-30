import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type FAQItemProps = {
  question: string;
  answer: string;
};

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItemContainer}>
      <TouchableOpacity 
        style={styles.questionRow} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.questionText}>{question}</ThemedText>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#1DB954" 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <ThemedText style={styles.answerText}>{answer}</ThemedText>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();

  const faqs = [
    {
      question: "O que é o TrackListd?",
      answer: "O TrackListd é uma rede social para amantes de música, onde você pode avaliar álbuns, músicas, criar e compartilhar suas tracklists favoritas com a comunidade."
    },
    {
      question: "Como funcionam as denúncias?",
      answer: "Se você encontrar algum comentário ofensivo, spam ou discurso de ódio, basta clicar no ícone de bandeira no post. Nossa equipe de moderação revisará o conteúdo em até 24 horas."
    },
    {
      question: "Como posso seguir outros usuários?",
      answer: "Basta clicar no botão 'Seguir' localizado no cabeçalho de qualquer publicação no seu feed ou acessar o perfil direto do usuário."
    },
    {
      question: "Posso deletar uma avaliação minha?",
      answer: "Sim, acessando a aba do seu perfil, você encontrará a lista de todas as suas postagens com a opção de exclusão."
    }
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Cabeçalho Customizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Perguntas Frequentes</ThemedText>
        <View style={{ width: 24 }} /> {/* Equilíbrio estético */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.subtitle}>
          Tem alguma dúvida sobre o TrackListd? Confira as respostas abaixo.
        </ThemedText>

        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12161A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: '#1F242A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    color: '#8A8A8F',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  faqItemContainer: {
    backgroundColor: '#181E24',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252F38',
    overflow: 'hidden',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    paddingRight: 8,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#252F38',
    paddingTop: 12,
  },
  answerText: {
    fontSize: 14,
    color: '#E1E1E6',
    lineHeight: 20,
  },
});