import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import { authFetch } from '../../../src/service/api';
import { Container, Header, Title, Subtitle, ReportCard, ReportHeader, ReportTitle, ReportDate, ReportDescription, SectionTitle, ActionButton, ActionText, CancelButton } from './styles';

export default function ReportSolutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      // ATENÇÃO: Rota dependente de criação no backend
      const response = await authFetch(`/admin/reports/${id}`);
      if (!response.ok) throw new Error('Falha ao buscar denúncia');

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error(error);
      setReport({
        id, title: 'Conteúdo ofensivo', description: 'Dados simulados porque a rota GET não existe no Java.', date: 'Hoje'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: string, punishment: string | null = null, daysOfSuspension: number | null = null) => {
    setActionLoading(true);
    try {
      // Rota e payload exatos do AdminController.java
      const response = await authFetch(`/admin/reports/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, punishment, daysOfSuspension })
      });

      if (!response.ok) throw new Error('Falha ao processar a decisão');

      Alert.alert('Sucesso', 'Denúncia moderada com sucesso.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível aplicar a moderação no servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <Title>Moderar Denúncia</Title>
          <Subtitle>ID: {id}</Subtitle>
        </Header>

        <SectionTitle>Detalhes da Ocorrência</SectionTitle>
        <ReportCard style={{ marginBottom: 32 }} disabled={true}>
          <ReportHeader>
            <ReportTitle>{report?.title}</ReportTitle>
            <ReportDate>{report?.date}</ReportDate>
          </ReportHeader>
          <ReportDescription>{report?.description}</ReportDescription>
        </ReportCard>

        <SectionTitle>Decisão do Administrador</SectionTitle>

        <ActionButton onPress={() => handleAction('RESOLVED', 'BAN', null)} disabled={actionLoading}>
          <ActionText>Banir Usuário</ActionText>
        </ActionButton>

        <ActionButton onPress={() => handleAction('RESOLVED', 'CONTENT_REMOVAL', null)} disabled={actionLoading}>
          <ActionText>Remover Conteúdo</ActionText>
        </ActionButton>

        <ActionButton
          onPress={() => handleAction('IGNORED', null, null)}
          disabled={actionLoading}
          style={{ backgroundColor: '#1A1D24', borderWidth: 1, borderColor: '#2A2F3A' }}
        >
          <ActionText style={{ color: '#00E5FF' }}>Arquivar (Manter Ignorado)</ActionText>
        </ActionButton>

        <CancelButton onPress={() => router.back()} disabled={actionLoading}>
          <ActionText style={{ color: '#8A93A6' }}>Voltar para a Lista</ActionText>
        </CancelButton>
      </ScrollView>
    </Container>
  );
}