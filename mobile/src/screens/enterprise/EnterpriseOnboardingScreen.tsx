import React from 'react';

interface EnterpriseOnboardingScreenProps {
  navigation: any;
}

export default function EnterpriseOnboardingScreen({ navigation }: EnterpriseOnboardingScreenProps) {
  return React.createElement('div', {
    style: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    }
  }, 'Enterprise Onboarding - Coming Soon');
} 