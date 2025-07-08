import React from 'react';

interface BillingScreenProps {
  navigation: any;
}

export default function BillingScreen({ navigation }: BillingScreenProps) {
  return React.createElement('div', {
    style: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    }
  }, 'Billing Screen - Coming Soon');
} 