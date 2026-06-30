import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, View, TextInput } from 'react-native';
import { authFetch } from '../../../src/service/api';
import { Container, Header, Title, Subtitle, ReportCard, ReportHeader, ReportTitle, ReportDate, ReportDescription, SectionTitle, ActionButton, ActionText, CancelButton } from './styles';

export default function ReportSolutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspendOptions, setShowSuspendOptions] = useState(false);
  const [suspendDays, setSuspendDays] = useState('7');

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/admin/reports/${id}`);
      if (!response.ok) throw new Error('Falha ao buscar denúncia');
      const data = await response.json();
      setReport({
        title: data.reportedContent || 'Conteúdo / Usuário Oculto',
        description: data.reason || 'Sem justificativa',
        date: new Date(data.reportDate).toLocaleDateString('pt-BR')
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a denúncia.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: string, punishment: string | null = null, daysOfSuspension: number | null = null) => {
      setActionLoading(true);
      try {
        const response = await authFetch(`/admin/reports/${id}/moderate`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, punishment, daysOfSuspension })
        });
        if (!response.ok) throw new Error('Falha ao processar a decisão');
        // Exibe a confirmação visual na tela sem atrelar a navegação aos botões do alerta
        Alert.alert('Sucesso', 'Decisão aplicada no banco de dados.');

        // O router.replace destrói a tela atual e remonta a lista de pendências do zero.
        // Isso força uma nova requisição na API, fazendo a denúncia que foi julgada sumir da tela.
        router.replace('/admin/reports/pending');

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

        <ActionButton onPress={() => handleAction('RESOLVED', 'ACCOUNT_DELETION', null)} disabled={actionLoading}>
          <ActionText>Banir Usuário</ActionText>
        </ActionButton>

        {!showSuspendOptions ? (
          <ActionButton onPress={() => setShowSuspendOptions(true)} disabled={actionLoading} style={{ backgroundColor: '#FFB020' }}>
            <ActionText style={{ color: '#121418' }}>Remover Conteúdo...</ActionText>
          </ActionButton>
        ) : (
          <View style={{ backgroundColor: '#121418', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2A2F3A' }}>

            <ActionButton onPress={() => handleAction('RESOLVED', 'WARNING', null)} disabled={actionLoading} style={{ backgroundColor: '#2A2F3A' }}>
              <ActionText style={{ color: '#FFFFFF' }}>Apenas Remover</ActionText>
            </ActionButton>

            <ActionText style={{ color: '#8A93A6', fontSize: 14, marginTop: 12, marginBottom: 8 }}>Dias de suspensão para o autor:</ActionText>

            <TextInput
              keyboardType="numeric"
              value={suspendDays}
              onChangeText={setSuspendDays}
              placeholder="7"
              placeholderTextColor="#4A5263"
              style={{ backgroundColor: '#1A1D24', color: '#FFFFFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2A2F3A', marginBottom: 12 }}
            />

            <ActionButton onPress={() => handleAction('RESOLVED', 'TEMPORARY_SUSPENSION', parseInt(suspendDays) || 7)} disabled={actionLoading} style={{ backgroundColor: '#FF5C5C', marginBottom: 0 }}>
              <ActionText style={{ color: '#FFFFFF' }}>Remover e Suspender Usuário</ActionText>
            </ActionButton>

          </View>
        )}

        <ActionButton
          onPress={() => handleAction('IGNORED', 'NONE', null)}
          disabled={actionLoading}
          style={{ backgroundColor: '#1A1D24', borderWidth: 1, borderColor: '#2A2F3A' }}>
          <ActionText style={{ color: '#00E5FF' }}>Arquivar Denúncia</ActionText>
        </ActionButton>

        <CancelButton onPress={() => router.back()} disabled={actionLoading}>
          <ActionText style={{ color: '#8A93A6' }}>Voltar para a Lista</ActionText>
        </CancelButton>
      </ScrollView>
    </Container>
  );
}