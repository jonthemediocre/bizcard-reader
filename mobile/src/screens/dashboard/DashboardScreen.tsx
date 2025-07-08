import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Types
interface DashboardData {
  usage: {
    cardsProcessed: number;
    cardsLimit: number;
    usagePercentage: number;
  };
  subscription: {
    plan: string;
    status: string;
    nextBilling: Date;
  };
  analytics: {
    totalCards: number;
    activeUsers: number;
    integrations: number;
  };
  recentCards: Array<{
    id: string;
    name: string;
    company: string;
    processedAt: Date;
  }>;
}

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        usage: {
          cardsProcessed: 127,
          cardsLimit: 500,
          usagePercentage: 25.4,
        },
        subscription: {
          plan: 'Pro',
          status: 'active',
          nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        analytics: {
          totalCards: 127,
          activeUsers: 8,
          integrations: 3,
        },
        recentCards: [
          {
            id: '1',
            name: 'John Smith',
            company: 'Tech Corp',
            processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            company: 'Design Studio',
            processedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
          {
            id: '3',
            name: 'Mike Wilson',
            company: 'Marketing Inc',
            processedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          },
        ],
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back to BizCard Reader Enterprise
          </Text>
        </View>

        {/* Usage Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Usage This Month</Title>
            <View style={styles.usageContainer}>
              <Text style={styles.usageText}>
                {dashboardData?.usage.cardsProcessed} of {dashboardData?.usage.cardsLimit} cards processed
              </Text>
              <ProgressBar
                progress={dashboardData?.usage.usagePercentage ? dashboardData.usage.usagePercentage / 100 : 0}
                color="#007AFF"
                style={styles.progressBar}
              />
              <Text style={styles.usagePercentage}>
                {dashboardData?.usage.usagePercentage}% used
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Subscription Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.subscriptionHeader}>
              <Title>Subscription</Title>
              <Chip mode="outlined" textStyle={styles.chipText}>
                {dashboardData?.subscription.plan} Plan
              </Chip>
            </View>
            <Paragraph>
              Status: {dashboardData?.subscription.status}
            </Paragraph>
            <Paragraph>
              Next billing: {dashboardData?.subscription.nextBilling.toLocaleDateString()}
            </Paragraph>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Billing')}
              style={styles.manageButton}
            >
              Manage Subscription
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{dashboardData?.analytics.totalCards}</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="people" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{dashboardData?.analytics.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Ionicons name="link" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{dashboardData?.analytics.integrations}</Text>
              <Text style={styles.statLabel}>Integrations</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title>Recent Scans</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Contacts')}
                compact
              >
                View All
              </Button>
            </View>
            {dashboardData?.recentCards.map((card) => (
              <View key={card.id} style={styles.recentCardItem}>
                <View style={styles.recentCardInfo}>
                  <Text style={styles.recentCardName}>{card.name}</Text>
                  <Text style={styles.recentCardCompany}>{card.company}</Text>
                </View>
                <Text style={styles.recentCardTime}>
                  {formatTimeAgo(card.processedAt)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActionsContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Scan')}
                style={styles.quickActionButton}
                icon="camera"
              >
                Scan Card
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Analytics')}
                style={styles.quickActionButton}
                icon="analytics"
              >
                View Analytics
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="camera"
        onPress={() => navigation.navigate('Scan')}
        label="Scan"
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 10,
    marginBottom: 15,
  },
  usageContainer: {
    marginTop: 10,
  },
  usageText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  usagePercentage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipText: {
    fontSize: 12,
  },
  manageButton: {
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  recentCardCompany: {
    fontSize: 14,
    color: '#666',
  },
  recentCardTime: {
    fontSize: 12,
    color: '#999',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
}); 