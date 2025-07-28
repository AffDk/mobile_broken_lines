import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import IconText from '../components/IconText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { apiService, User, BlogPost } from '../services/apiService';
import { APP_CONFIG } from '../config/config';

interface ProfileScreenProps {
  user: User | null;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnection();
    loadUserStats();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await apiService.healthCheck();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const userPosts = await apiService.getPosts();
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              // Still logout locally even if server request fails
              onLogout();
            }
          },
        },
      ]
    );
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and you may need to re-login.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully');
              onLogout();
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return APP_CONFIG.COLORS.success;
      case 'disconnected':
        return APP_CONFIG.COLORS.error;
      default:
        return APP_CONFIG.COLORS.warning;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to server';
      case 'disconnected':
        return 'No server connection';
      default:
        return 'Checking connection...';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'wifi';
      case 'disconnected':
        return 'wifi-off';
      default:
        return 'sync';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <IconText name="person" size={48} color={APP_CONFIG.COLORS.surface} />
        </View>
        <Text style={styles.username}>
          {user?.username || 'User'}
        </Text>
        <Text style={styles.email}>
          {user?.email || 'No email'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          {loading ? (
            <ActivityIndicator color={APP_CONFIG.COLORS.primary} />
          ) : (
            <Text style={styles.statNumber}>{posts.length}</Text>
          )}
          <Text style={styles.statLabel}>Posts</Text>
        </View>

        <View style={styles.statCard}>
          <IconText name="auto-awesome" size={24} color={APP_CONFIG.COLORS.secondary} />
          <Text style={styles.statLabel}>AI Enhanced</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{user?.is_active ? '✓' : '✗'}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <TouchableOpacity
          style={styles.connectionCard}
          onPress={checkConnection}
        >
          <View style={styles.connectionInfo}>
            <IconText 
              name={getConnectionStatusIcon()} 
              size={24} 
              color={getConnectionStatusColor()} 
            />
            <View style={styles.connectionText}>
              <Text style={[styles.connectionStatus, { color: getConnectionStatusColor() }]}>
                {getConnectionStatusText()}
              </Text>
              <Text style={styles.connectionSubtext}>
                Tap to refresh connection
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>App Name</Text>
          <Text style={styles.infoValue}>{APP_CONFIG.APP_NAME}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{APP_CONFIG.VERSION}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={loadUserStats}
          disabled={loading}
        >
          <IconText name="refresh" size={20} color={APP_CONFIG.COLORS.primary} />
          <Text style={styles.actionButtonText}>Refresh Data</Text>
          {loading && <ActivityIndicator size="small" color={APP_CONFIG.COLORS.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={clearCache}
        >
          <IconText name="clear-all" size={20} color={APP_CONFIG.COLORS.warning} />
          <Text style={[styles.actionButtonText, { color: APP_CONFIG.COLORS.warning }]}>
            Clear Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <IconText name="logout" size={20} color={APP_CONFIG.COLORS.error} />
          <Text style={[styles.actionButtonText, { color: APP_CONFIG.COLORS.error }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with React Native
        </Text>
        <Text style={styles.footerText}>
          Powered by FastAPI Backend
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.COLORS.background,
  },
  header: {
    backgroundColor: APP_CONFIG.COLORS.primary,
    paddingTop: APP_CONFIG.SPACING.xl,
    paddingBottom: APP_CONFIG.SPACING.lg,
    paddingHorizontal: APP_CONFIG.SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: APP_CONFIG.SPACING.md,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_CONFIG.COLORS.surface,
    marginBottom: APP_CONFIG.SPACING.xs,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: APP_CONFIG.SPACING.lg,
    paddingVertical: APP_CONFIG.SPACING.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_CONFIG.COLORS.primary,
    marginBottom: APP_CONFIG.SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: APP_CONFIG.SPACING.lg,
    marginBottom: APP_CONFIG.SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    marginBottom: APP_CONFIG.SPACING.md,
  },
  connectionCard: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    marginLeft: APP_CONFIG.SPACING.md,
    flex: 1,
  },
  connectionStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionSubtext: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    marginTop: APP_CONFIG.SPACING.xs,
  },
  infoCard: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    marginBottom: APP_CONFIG.SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.text,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    marginBottom: APP_CONFIG.SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    marginTop: APP_CONFIG.SPACING.md,
  },
  actionButtonText: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.primary,
    fontWeight: '500',
    marginLeft: APP_CONFIG.SPACING.md,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: APP_CONFIG.SPACING.xl,
    marginTop: APP_CONFIG.SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    marginBottom: APP_CONFIG.SPACING.xs,
  },
});

export default ProfileScreen;
