import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { apiService, BlogPost } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import { RootStackParamList } from '../navigation/RootNavigator';

type PostDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { postId } = route.params;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [showAIVersion, setShowAIVersion] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const fetchedPost = await apiService.getPost(postId);
      setPost(fetchedPost);
      // Show AI version by default if it exists
      setShowAIVersion(!!fetchedPost.ai_updated_content);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePost = async () => {
    if (!post) return;

    setEnhancing(true);
    try {
      const enhancedPost = await apiService.enhancePost(post.id);
      setPost(enhancedPost);
      setShowAIVersion(true);
      Alert.alert('Success', 'Post enhanced with AI!');
    } catch (error) {
      console.error('Error enhancing post:', error);
      Alert.alert('Error', 'Failed to enhance post with AI');
    } finally {
      setEnhancing(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      const content = showAIVersion && post.ai_updated_content 
        ? post.ai_updated_content 
        : post.content;
      
      await Share.share({
        message: `${post.title}\n\n${content}`,
        title: post.title,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={APP_CONFIG.COLORS.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const currentContent = showAIVersion && post.ai_updated_content 
    ? post.ai_updated_content 
    : post.content;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{post.title}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.date}>
              Created: {formatDate(post.created_at)}
            </Text>
            {post.updated_at && (
              <Text style={styles.date}>
                Updated: {formatDate(post.updated_at)}
              </Text>
            )}
          </View>

          {post.ai_updated_content && (
            <View style={styles.versionToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !showAIVersion && styles.toggleButtonActive,
                ]}
                onPress={() => setShowAIVersion(false)}
              >
                <Text style={[
                  styles.toggleButtonText,
                  !showAIVersion && styles.toggleButtonTextActive,
                ]}>
                  Original
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showAIVersion && styles.toggleButtonActive,
                ]}
                onPress={() => setShowAIVersion(true)}
              >
                <Icon 
                  name="auto-awesome" 
                  size={16} 
                  color={showAIVersion ? APP_CONFIG.COLORS.surface : APP_CONFIG.COLORS.secondary} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  showAIVersion && styles.toggleButtonTextActive,
                ]}>
                  AI Enhanced
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.content}>{currentContent}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Icon name="share" size={24} color={APP_CONFIG.COLORS.primary} />
        </TouchableOpacity>

        {!post.ai_updated_content && (
          <TouchableOpacity
            style={[styles.actionButton, enhancing && styles.disabledButton]}
            onPress={handleEnhancePost}
            disabled={enhancing}
          >
            {enhancing ? (
              <ActivityIndicator color={APP_CONFIG.COLORS.secondary} />
            ) : (
              <Icon name="auto-awesome" size={24} color={APP_CONFIG.COLORS.secondary} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditPost', { postId: post.id })}
        >
          <Icon name="edit" size={24} color={APP_CONFIG.COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeletePost}
        >
          <Icon name="delete" size={24} color={APP_CONFIG.COLORS.error} />
        </TouchableOpacity>
      </View>
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
  errorText: {
    fontSize: 18,
    color: APP_CONFIG.COLORS.error,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_CONFIG.COLORS.text,
    lineHeight: 32,
    marginBottom: APP_CONFIG.SPACING.md,
  },
  metaContainer: {
    marginBottom: APP_CONFIG.SPACING.md,
  },
  date: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
    marginBottom: APP_CONFIG.SPACING.xs,
  },
  versionToggle: {
    flexDirection: 'row',
    backgroundColor: APP_CONFIG.COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONFIG.SPACING.sm,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: APP_CONFIG.COLORS.secondary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_CONFIG.COLORS.textSecondary,
    marginLeft: 4,
  },
  toggleButtonTextActive: {
    color: APP_CONFIG.COLORS.surface,
  },
  contentContainer: {
    padding: APP_CONFIG.SPACING.lg,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: APP_CONFIG.COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.COLORS.surface,
    paddingVertical: APP_CONFIG.SPACING.md,
    paddingHorizontal: APP_CONFIG.SPACING.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    backgroundColor: APP_CONFIG.COLORS.background,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PostDetailScreen;
