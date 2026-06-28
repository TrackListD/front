import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { authFetch } from '../../../src/service/api';
import { Container, Header, Title, Subtitle, ReportCard, ReportHeader, ReportTitle, ReportDate, ReportDescription, StatusBadge, StatusText, EmptyStateText } from './styles';

export default function PendingReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      // Rota exata configurada no seu AdminController.java
      const response = await authFetch('/admin/reports/pending');

      if (!response.ok) throw new Error('Falha ao buscar denúncias pendentes');

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResolution = (reportId: string) => {
    router.push(`/admin/reports/solution?id=${reportId}`);
  };

  const renderReport = ({ item }: any) => (
    <ReportCard onPress={() => handleOpenResolution(item.id)}>
      <ReportHeader>
        <ReportTitle>{item.title}</ReportTitle>
        <ReportDate>{item.date}</ReportDate>
      </ReportHeader>
      <ReportDescription numberOfLines={2}>
        {item.description}
      </ReportDescription>
      {/* Cores ajustadas para tom de alerta (âmbar/laranja) */}
      <StatusBadge style={{ backgroundColor: '#2E2211' }}>
        <StatusText style={{ color: '#FFB020' }}>PENDENTE</StatusText>
      </StatusBadge>
    </ReportCard>
  );

  return (
    <Container>
      <Header>
        <Title>Denúncias Pendentes</Title>
        <Subtitle>Fila de ocorrências aguardando moderação</Subtitle>
      </Header>

      {loading ? (
        <ActivityIndicator size="large" color="#00E5FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReport}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyStateText>Nenhuma denúncia pendente na fila.</EmptyStateText>
          }
        />
      )}
    </Container>
  );
}