import React, { useState, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import IconText from '../components/IconText';
import LLMConfigComponent from '../components/LLMConfigComponent';

import { apiService } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import OnDeviceLLM, { SystemPromptConfig } from '../services/llmService';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showLLMConfig, setShowLLMConfig] = useState(false);
  
  // LLM instance
  const llmRef = useRef<OnDeviceLLM>(new OnDeviceLLM());

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

  const handleCreatePost = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService.createPost({
        title: title.trim(),
        content: content.trim(),
      });

      Alert.alert(
        'Success',
        'Post created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setContent('');
              // Navigate back to home tab
              navigation.navigate('Home' as never);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Create post error:', error);
      
      let errorMessage = 'Failed to create post. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to create posts.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setTitle('');
            setContent('');
          },
        },
      ]
    );
  };

  const enhanceContent = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content to enhance');
      return;
    }

    setEnhancing(true);
    try {
      const result = await llmRef.current.enhanceText(content);
      
      Alert.alert(
        'Content Enhanced',
        `✨ Your content has been enhanced!\n\nProcessing time: ${result.processingTime}ms\nModel: ${result.modelUsed}`,
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Use Enhanced',
            onPress: () => setContent(result.enhancedText),
          },
          {
            text: 'Preview Both',
            onPress: () => showEnhancementPreview(content, result.enhancedText),
          },
        ]
      );
    } catch (error) {
      console.error('Enhancement error:', error);
      Alert.alert('Error', 'Failed to enhance content. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const showEnhancementPreview = (original: string, enhanced: string) => {
    Alert.alert(
      'Enhancement Preview',
      `Original:\n"${original.substring(0, 100)}${original.length > 100 ? '...' : ''}"\n\nEnhanced:\n"${enhanced.substring(0, 100)}${enhanced.length > 100 ? '...' : ''}"`,
      [
        { text: 'Keep Original', style: 'cancel' },
        { text: 'Use Enhanced', onPress: () => setContent(enhanced) },
      ]
    );
  };

  const enhanceTitle = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title to enhance');
      return;
    }

    setEnhancing(true);
    try {
      const result = await llmRef.current.enhanceText(title);
      
      Alert.alert(
        'Title Enhanced',
        `Original: "${title}"\n\nEnhanced: "${result.enhancedText}"`,
        [
          { text: 'Keep Original', style: 'cancel' },
          { text: 'Use Enhanced', onPress: () => setTitle(result.enhancedText) },
        ]
      );
    } catch (error) {
      console.error('Title enhancement error:', error);
      Alert.alert('Error', 'Failed to enhance title. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleLLMConfigUpdate = (config: SystemPromptConfig) => {
    console.log('LLM configuration updated:', config);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <IconText name="create" size={32} color={APP_CONFIG.COLORS.primary} />
          <Text style={styles.headerTitle}>Create New Post</Text>
          <Text style={styles.headerSubtitle}>Share your thoughts with the world</Text>
          
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => setShowLLMConfig(true)}
          >
            <IconText name="settings" size={20} color={APP_CONFIG.COLORS.primary} />
            <Text style={styles.configButtonText}>AI Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Title *</Text>
              <TouchableOpacity
                style={styles.enhanceButton}
                onPress={enhanceTitle}
                disabled={enhancing || !title.trim()}
              >
                {enhancing ? (
                  <ActivityIndicator size="small" color={APP_CONFIG.COLORS.primary} />
                ) : (
                  <>
                    <IconText name="auto-fix-high" size={16} color={APP_CONFIG.COLORS.primary} />
                    <Text style={styles.enhanceButtonText}>Enhance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter an engaging title..."
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              maxLength={200}
              editable={!loading && !enhancing}
              multiline
            />
            <Text style={styles.charCount}>{title.length}/200</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Content *</Text>
              <TouchableOpacity
                style={styles.enhanceButton}
                onPress={enhanceContent}
                disabled={enhancing || !content.trim()}
              >
                {enhancing ? (
                  <ActivityIndicator size="small" color={APP_CONFIG.COLORS.primary} />
                ) : (
                  <>
                    <IconText name="auto-fix-high" size={16} color={APP_CONFIG.COLORS.primary} />
                    <Text style={styles.enhanceButtonText}>Enhance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write your post content here..."
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              editable={!loading && !enhancing}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearForm}
              disabled={loading || (!title && !content)}
            >
              <IconText name="clear" size={20} color={APP_CONFIG.COLORS.textSecondary} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabledButton]}
              onPress={handleCreatePost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={APP_CONFIG.COLORS.surface} />
              ) : (
                <>
                  <IconText name="publish" size={20} color={APP_CONFIG.COLORS.surface} />
                  <Text style={styles.createButtonText}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🤖 AI-Powered Writing Tips</Text>
          <Text style={styles.tipText}>• Use AI enhancement to improve grammar and flow</Text>
          <Text style={styles.tipText}>• Configure AI settings for different writing styles</Text>
          <Text style={styles.tipText}>• AI works completely offline - no internet needed!</Text>
          <Text style={styles.tipText}>• Try enhancing titles and content separately</Text>
        </View>
      </ScrollView>

      {/* LLM Configuration Modal */}
      <LLMConfigComponent
        llm={llmRef.current}
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
  scrollContainer: {
    flexGrow: 1,
    padding: APP_CONFIG.SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: APP_CONFIG.SPACING.xl,
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: APP_CONFIG.SPACING.md,
    paddingHorizontal: APP_CONFIG.SPACING.md,
    paddingVertical: APP_CONFIG.SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  configButtonText: {
    color: APP_CONFIG.COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: APP_CONFIG.SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    marginTop: APP_CONFIG.SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.textSecondary,
    marginTop: APP_CONFIG.SPACING.xs,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_CONFIG.COLORS.text,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: APP_CONFIG.SPACING.sm,
    paddingVertical: APP_CONFIG.SPACING.xs,
    borderRadius: 6,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.primary,
  },
  enhanceButtonText: {
    color: APP_CONFIG.COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.border,
    flex: 0.4,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.textSecondary,
    marginLeft: APP_CONFIG.SPACING.xs,
  },
  createButton: {
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
  createButtonText: {
    color: APP_CONFIG.COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: APP_CONFIG.SPACING.xs,
  },
  tipsContainer: {
    backgroundColor: APP_CONFIG.COLORS.surface,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.COLORS.secondary,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  tipText: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
    marginBottom: APP_CONFIG.SPACING.xs,
    lineHeight: 20,
  },
});

export default CreatePostScreen;
