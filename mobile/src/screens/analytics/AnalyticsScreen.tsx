import React from 'react';

interface AnalyticsScreenProps {
  navigation: any;
}

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  return React.createElement('div', {
    style: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    }
  }, 'Analytics Screen - Coming Soon');
} 