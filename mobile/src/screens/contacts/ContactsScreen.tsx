import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Searchbar,
  Card,
  Avatar,
  Title,
  Paragraph,
  Chip,
  FAB,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tags: string[];
  lastContact?: Date;
}

interface ContactsScreenProps {
  navigation: any;
}

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, selectedFilter, contacts]);

  const loadContacts = async () => {
    // Mock data - replace with actual API call
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'John Smith',
        title: 'CEO',
        company: 'Tech Corp',
        email: 'john@techcorp.com',
        phone: '+1 555-0123',
        tags: ['client', 'decision-maker'],
        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        title: 'Design Lead',
        company: 'Creative Studio',
        email: 'sarah@creative.com',
        phone: '+1 555-0456',
        tags: ['prospect', 'creative'],
        lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Mike Wilson',
        title: 'Marketing Director',
        company: 'Growth Inc',
        email: 'mike@growth.com',
        phone: '+1 555-0789',
        tags: ['lead', 'marketing'],
        lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];
    setContacts(mockContacts);
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(contact =>
        contact.tags.includes(selectedFilter)
      );
    }

    setFilteredContacts(filtered);
  };

  const formatLastContact = (date?: Date) => {
    if (!date) return 'No contact';
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getAvatarText = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ContactDetail', { contact: item })}
    >
      <Card style={styles.contactCard}>
        <Card.Content style={styles.contactContent}>
          <View style={styles.contactHeader}>
            <Avatar.Text
              size={50}
              label={getAvatarText(item.name)}
              style={styles.avatar}
            />
            <View style={styles.contactInfo}>
              <Title style={styles.contactName}>{item.name}</Title>
              {item.title && (
                <Paragraph style={styles.contactTitle}>{item.title}</Paragraph>
              )}
              {item.company && (
                <Paragraph style={styles.contactCompany}>{item.company}</Paragraph>
              )}
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.lastContact}>
                {formatLastContact(item.lastContact)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </View>
          
          <View style={styles.contactDetails}>
            {item.email && (
              <Text style={styles.contactDetail}>
                <Ionicons name="mail" size={14} color="#666" /> {item.email}
              </Text>
            )}
            {item.phone && (
              <Text style={styles.contactDetail}>
                <Ionicons name="call" size={14} color="#666" /> {item.phone}
              </Text>
            )}
          </View>
          
          <View style={styles.tagsContainer}>
            {item.tags.map(tag => (
              <Chip
                key={tag}
                mode="outlined"
                compact
                style={styles.tag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const filters = ['all', 'client', 'prospect', 'lead', 'decision-maker'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <Text style={styles.headerSubtitle}>
          {filteredContacts.length} contacts
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search contacts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Chip
              mode={selectedFilter === item ? 'flat' : 'outlined'}
              selected={selectedFilter === item}
              onPress={() => setSelectedFilter(item)}
              style={styles.filterChip}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.contactsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No contacts found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by scanning your first business card'}
            </Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="camera"
        onPress={() => navigation.navigate('Scan')}
        label="Scan Card"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersList: {
    paddingHorizontal: 15,
  },
  filterChip: {
    marginRight: 10,
  },
  contactsList: {
    padding: 15,
  },
  contactCard: {
    marginBottom: 15,
  },
  contactContent: {
    paddingBottom: 15,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#007AFF',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 18,
    marginBottom: 2,
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  lastContact: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  contactDetails: {
    marginBottom: 10,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
}); 