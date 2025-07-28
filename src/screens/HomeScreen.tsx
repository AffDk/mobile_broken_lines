import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import IconText from '../components/IconText';

import { apiService, BlogPost } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import { RootStackParamList } from '../navigation/RootNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 3;
  
  // Calculate pagination
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, endIndex);

  // Load posts when component mounts
  useEffect(() => {
    loadPosts();
  }, []);

  // Reload posts when screen comes into focus (after navigating back from other screens)
  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      const fetchedPosts = await apiService.getPosts();
      setAllPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPost = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.ai_updated_content && (
          <IconText name="auto-awesome" size={20} color={APP_CONFIG.COLORS.secondary} />
        )}
      </View>
      
      <Text style={styles.postContent} numberOfLines={3}>
        {item.ai_updated_content || item.content}
      </Text>
      
      <View style={styles.postFooter}>
        <Text style={styles.postDate}>
          {formatDate(item.created_at)}
        </Text>
        {item.updated_at && (
          <Text style={styles.postUpdated}>
            Updated: {formatDate(item.updated_at)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={[styles.paginationArrow, currentPage === 1 && styles.paginationArrowDisabled]}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
          <Text style={styles.paginationSubtext}>
            {allPosts.length} total posts
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.paginationArrow, currentPage === totalPages && styles.paginationArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={APP_CONFIG.COLORS.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currentPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconText name="article" size={64} color={APP_CONFIG.COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first post to get started!
            </Text>
          </View>
        }
        ListFooterComponent={renderPaginationControls}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.COLORS.background,
  },
  loadingText: {
    marginTop: APP_CONFIG.SPACING.md,
    fontSize: 16,
    color: APP_CONFIG.COLORS.textSecondary,
  },
  listContainer: {
    padding: APP_CONFIG.SPACING.md,
  },
  postCard: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    marginBottom: APP_CONFIG.SPACING.md,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    flex: 1,
    marginRight: APP_CONFIG.SPACING.sm,
  },
  postContent: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: APP_CONFIG.SPACING.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
  },
  postUpdated: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.textSecondary,
    marginTop: APP_CONFIG.SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
    marginTop: APP_CONFIG.SPACING.sm,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: APP_CONFIG.SPACING.md,
    paddingVertical: APP_CONFIG.SPACING.lg,
    marginTop: APP_CONFIG.SPACING.md,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_CONFIG.COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paginationButtonDisabled: {
    backgroundColor: APP_CONFIG.COLORS.background,
    shadowOpacity: 0,
    elevation: 0,
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
  },
  paginationSubtext: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    marginTop: 2,
  },
  paginationArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_CONFIG.COLORS.primary,
  },
  paginationArrowDisabled: {
    color: APP_CONFIG.COLORS.textSecondary,
  },
});

export default HomeScreen;
