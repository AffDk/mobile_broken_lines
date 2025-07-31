import React, { useState, useEffect } from 'react';
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
import realLLMService, { SystemPromptConfig } from '../services/realLLMService';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showLLMConfig, setShowLLMConfig] = useState(false);
  
  // AI Enhancement state
  const [originalContent, setOriginalContent] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isShowingEnhanced, setIsShowingEnhanced] = useState(false);
  const [hasEnhancedVersion, setHasEnhancedVersion] = useState(false);

  // Initialize LLM service when component mounts
  useEffect(() => {
    const initializeLLM = async () => {
      try {
        // Add delay to prevent simultaneous initialization attempts
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        await realLLMService.initialize();
        console.log('✅ LLM service ready for CreatePostScreen');
      } catch (error) {
        console.log('⚠️ LLM initialization completed with fallback for CreatePostScreen');
      }
    };
    
    // Don't block the component, initialize in background
    initializeLLM();
  }, []);

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
            // Reset AI enhancement state
            setOriginalContent('');
            setEnhancedContent('');
            setHasEnhancedVersion(false);
            setIsShowingEnhanced(false);
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
      const result = await realLLMService.enhanceText(content);
      
      // Store both versions
      setOriginalContent(content);
      setEnhancedContent(result.enhancedText);
      setHasEnhancedVersion(true);
      setIsShowingEnhanced(true); // Switch to enhanced version
      setContent(result.enhancedText); // Update the displayed content
      
      // Create status message based on whether fallback was used
      const statusMessage = result.isFallback 
        ? `⚠️ Enhanced using intelligent fallback system (${result.fallbackReason})\n\nProcessing time: ${result.processingTime}ms\nModel: ${result.modelUsed}`
        : `✅ Enhanced using real AI model\n\nProcessing time: ${result.processingTime}ms\nModel: ${result.modelUsed}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`;
      
      Alert.alert(
        'Content Enhanced! ✨',
        `Your content has been enhanced and saved. You can now toggle between original and enhanced versions using the toggle button.\n\n${statusMessage}`,
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      console.error('Enhancement error:', error);
      Alert.alert('Error', 'Failed to enhance content. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const toggleContentVersion = () => {
    if (!hasEnhancedVersion) return;
    
    if (isShowingEnhanced) {
      // Switch to original
      setContent(originalContent);
      setIsShowingEnhanced(false);
    } else {
      // Switch to enhanced
      setContent(enhancedContent);
      setIsShowingEnhanced(true);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // If user manually edits, update the appropriate version
    if (hasEnhancedVersion) {
      if (isShowingEnhanced) {
        setEnhancedContent(newContent);
      } else {
        setOriginalContent(newContent);
      }
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
      const result = await realLLMService.enhanceText(title);
      
      // Create status message based on whether fallback was used
      const statusInfo = result.isFallback 
        ? `\n\n⚠️ Enhanced using intelligent fallback system\nModel: ${result.modelUsed}`
        : `\n\n✅ Enhanced using real AI model\nModel: ${result.modelUsed}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`;
      
      Alert.alert(
        'Title Enhanced',
        `Original: "${title}"\n\nEnhanced: "${result.enhancedText}"${statusInfo}`,
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
              <View style={styles.contentButtonsRow}>
                {hasEnhancedVersion && (
                  <TouchableOpacity
                    style={[styles.toggleButton, isShowingEnhanced && styles.activeToggleButton]}
                    onPress={toggleContentVersion}
                    disabled={enhancing}
                  >
                    <IconText 
                      name={isShowingEnhanced ? "auto-fix-high" : "edit"} 
                      size={14} 
                      color={isShowingEnhanced ? APP_CONFIG.COLORS.surface : APP_CONFIG.COLORS.primary} 
                    />
                    <Text style={[
                      styles.toggleButtonText, 
                      isShowingEnhanced && styles.activeToggleButtonText
                    ]}>
                      {isShowingEnhanced ? "AI ✨" : "Original"}
                    </Text>
                  </TouchableOpacity>
                )}
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
            </View>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={handleContentChange}
              placeholder="Write your post content here..."
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              multiline
              scrollEnabled={true}
              textAlignVertical="top"
              editable={!loading && !enhancing}
            />
            <View style={styles.contentInfoRow}>
              <Text style={styles.charCount}>
                {content.length} characters
              </Text>
              {hasEnhancedVersion && (
                <Text style={styles.versionIndicator}>
                  Showing: {isShowingEnhanced ? "AI Enhanced ✨" : "Original 📝"}
                </Text>
              )}
            </View>
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
  scrollContainer: {
    flexGrow: 1,
    padding: APP_CONFIG.SPACING.lg,
    paddingBottom: APP_CONFIG.SPACING.xl * 2, // Extra bottom padding for save button visibility
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
    maxHeight: 300, // Limit max height so save button stays visible
    lineHeight: 24,
    textAlignVertical: 'top', // Ensure text starts at top
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
  contentButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_CONFIG.SPACING.sm,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: APP_CONFIG.SPACING.sm,
    paddingVertical: APP_CONFIG.SPACING.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.primary,
    backgroundColor: 'transparent',
  },
  activeToggleButton: {
    backgroundColor: APP_CONFIG.COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeToggleButtonText: {
    color: APP_CONFIG.COLORS.surface,
  },
  contentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: APP_CONFIG.SPACING.xs,
  },
  versionIndicator: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.secondary,
    fontWeight: '500',
  },
});

export default CreatePostScreen;
