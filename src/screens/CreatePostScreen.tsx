import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';

import { apiService } from '../services/apiService';
import { APP_CONFIG } from '../config/config';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="create" size={32} color={APP_CONFIG.COLORS.primary} />
          <Text style={styles.headerTitle}>Create New Post</Text>
          <Text style={styles.headerSubtitle}>Share your thoughts with the world</Text>
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
              editable={!loading}
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
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearForm}
              disabled={loading || (!title && !content)}
            >
              <Icon name="clear" size={20} color={APP_CONFIG.COLORS.textSecondary} />
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
                  <Icon name="publish" size={20} color={APP_CONFIG.COLORS.surface} />
                  <Text style={styles.createButtonText}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Writing Tips</Text>
          <Text style={styles.tipText}>• Use a clear, descriptive title</Text>
          <Text style={styles.tipText}>• Break up long content with paragraphs</Text>
          <Text style={styles.tipText}>• You can enhance your post with AI later</Text>
        </View>
      </ScrollView>
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
