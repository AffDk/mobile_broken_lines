import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import IconText from '../components/IconText';
import LLMConfigComponent from '../components/LLMConfigComponent';

import { apiService, BlogPost } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import { RootStackParamList } from '../navigation/RootNavigator';
import realLLMService, { SystemPromptConfig } from '../services/realLLMService';

type EditPostScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type EditPostScreenRouteProp = RouteProp<RootStackParamList, 'EditPost'>;

const EditPostScreen: React.FC = () => {
  const navigation = useNavigation<EditPostScreenNavigationProp>();
  const route = useRoute<EditPostScreenRouteProp>();
  const { postId } = route.params;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLLMConfig, setShowLLMConfig] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  useEffect(() => {
    const initializeLLM = async () => {
      try {
        // Add delay to prevent simultaneous initialization attempts
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        await realLLMService.initialize();
        console.log('✅ LLM service ready for EditPostScreen');
      } catch (error) {
        console.log('⚠️ LLM initialization completed with fallback for EditPostScreen');
      }
    };
    
    // Don't block the component, initialize in background
    initializeLLM();
  }, []);

  useEffect(() => {
    if (post) {
      const titleChanged = title !== post.title;
      const contentChanged = content !== (post.ai_updated_content || post.content);
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, content, post]);

  const loadPost = async () => {
    try {
      const fetchedPost = await apiService.getPost(postId);
      setPost(fetchedPost);
      setTitle(fetchedPost.title);
      // Use AI content if available, otherwise original content
      setContent(fetchedPost.ai_updated_content || fetchedPost.content);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (title.trim().length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters long');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return false;
    }
    return true;
  };

  const handleSavePost = async () => {
    if (!validateForm() || !post) return;

    setSaving(true);
    try {
      const updateData: any = {
        title: title.trim(),
        content: content.trim(),
      };

      // If we're editing AI content, update the AI field
      if (post.ai_updated_content && content !== post.content) {
        updateData.ai_updated_content = content.trim();
      }

      await apiService.updatePost(post.id, updateData);

      Alert.alert(
        'Success',
        'Post updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Update post error:', error);
      
      let errorMessage = 'Failed to update post. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to edit posts.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You can only edit your own posts.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleLLMConfigUpdate = (config: SystemPromptConfig) => {
    console.log('LLM configuration updated:', config);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <IconText name="edit" size={32} color={APP_CONFIG.COLORS.primary} />
          <Text style={styles.headerTitle}>Edit Post</Text>
          {post.ai_updated_content && (
            <View style={styles.aiIndicator}>
              <IconText name="auto-awesome" size={16} color={APP_CONFIG.COLORS.secondary} />
              <Text style={styles.aiText}>Editing AI-enhanced version</Text>
            </View>
          )}
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter an engaging title..."
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              maxLength={200}
              editable={!saving}
              multiline
            />
            <Text style={styles.charCount}>{title.length}/200</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write your post content here..."
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <IconText name="close" size={20} color={APP_CONFIG.COLORS.textSecondary} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
                !hasChanges && styles.disabledButton,
              ]}
              onPress={handleSavePost}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <ActivityIndicator color={APP_CONFIG.COLORS.surface} />
              ) : (
                <>
                  <IconText name="save" size={20} color={APP_CONFIG.COLORS.surface} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {hasChanges && (
          <View style={styles.changesIndicator}>
            <IconText name="info" size={16} color={APP_CONFIG.COLORS.warning} />
            <Text style={styles.changesText}>You have unsaved changes</Text>
          </View>
        )}
      </ScrollView>

      {/* LLM Configuration Modal */}
      <LLMConfigComponent
        llm={realLLMService}
        visible={showLLMConfig}
        onClose={() => setShowLLMConfig(false)}
        onConfigUpdate={handleLLMConfigUpdate}
      />
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    padding: APP_CONFIG.SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: APP_CONFIG.SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    marginTop: APP_CONFIG.SPACING.sm,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: APP_CONFIG.SPACING.sm,
    backgroundColor: APP_CONFIG.COLORS.background,
    paddingHorizontal: APP_CONFIG.SPACING.md,
    paddingVertical: APP_CONFIG.SPACING.xs,
    borderRadius: 16,
  },
  aiText: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.secondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: APP_CONFIG.SPACING.lg,
  },
  inputContainer: {
    marginBottom: APP_CONFIG.SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_CONFIG.COLORS.text,
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.border,
    borderRadius: 8,
    padding: APP_CONFIG.SPACING.md,
    fontSize: 18,
    color: APP_CONFIG.COLORS.text,
    backgroundColor: APP_CONFIG.COLORS.surface,
    fontWeight: '500',
    minHeight: 60,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.border,
    borderRadius: 8,
    padding: APP_CONFIG.SPACING.md,
    fontSize: 16,
    color: APP_CONFIG.COLORS.text,
    backgroundColor: APP_CONFIG.COLORS.surface,
    minHeight: 200,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    textAlign: 'right',
    marginTop: APP_CONFIG.SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.border,
    flex: 0.4,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.textSecondary,
    marginLeft: APP_CONFIG.SPACING.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.COLORS.primary,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    flex: 0.55,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: APP_CONFIG.COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: APP_CONFIG.SPACING.xs,
  },
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.COLORS.warning,
  },
  changesText: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.warning,
    marginLeft: APP_CONFIG.SPACING.xs,
    fontWeight: '500',
  },
});

export default EditPostScreen;
