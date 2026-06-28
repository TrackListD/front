import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #121418;
  padding: 24px 16px;
`;

export const Header = styled.View`
  margin-bottom: 24px;
  margin-top: 24px;
`;

export const Title = styled.Text`
  color: #FFFFFF;
  font-size: 24px;
  font-weight: bold;
`;

export const Subtitle = styled.Text`
  color: #8A93A6;
  font-size: 14px;
  margin-top: 4px;
`;

export const ReportCard = styled.TouchableOpacity`
  background-color: #1A1D24;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #2A2F3A;
`;

export const ReportHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const ReportTitle = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
`;

export const ReportDate = styled.Text`
  color: #8A93A6;
  font-size: 12px;
`;

export const ReportDescription = styled.Text`
  color: #B0B7C4;
  font-size: 14px;
  line-height: 20px;
`;

export const StatusBadge = styled.View`
  background-color: #332525;
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 12px;
`;

export const StatusText = styled.Text`
  color: #FF5C5C;
  font-size: 12px;
  font-weight: bold;
`;

export const EmptyStateText = styled.Text`
  color: #8A93A6;
  font-size: 16px;
  text-align: center;
  margin-top: 40px;
`;

export const SectionTitle = styled.Text`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const ActionButton = styled.TouchableOpacity`
  background-color: #00E5FF;
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

export const ActionText = styled.Text`
  color: #121418;
  font-size: 16px;
  font-weight: bold;
`;

export const CancelButton = styled.TouchableOpacity`
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 32px;
`;