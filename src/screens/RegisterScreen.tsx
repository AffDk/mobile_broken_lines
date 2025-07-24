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
import { StackNavigationProp } from '@react-navigation/stack';

import { apiService } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import { RootStackParamList } from '../navigation/RootNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService.register({ username, email, password });
      
      Alert.alert(
        'Success',
        'Account created successfully! Please log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = 'Username or email already exists.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Join Us</Text>
          <Text style={styles.logoSubtext}>Create your account</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={APP_CONFIG.COLORS.surface} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    padding: APP_CONFIG.SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: APP_CONFIG.SPACING.xl * 2,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_CONFIG.COLORS.primary,
  },
  logoSubtext: {
    fontSize: 18,
    color: APP_CONFIG.COLORS.secondary,
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
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    textAlign: 'center',
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: APP_CONFIG.SPACING.xl,
  },
  inputContainer: {
    marginBottom: APP_CONFIG.SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_CONFIG.COLORS.text,
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_CONFIG.COLORS.border,
    borderRadius: 8,
    padding: APP_CONFIG.SPACING.md,
    fontSize: 16,
    color: APP_CONFIG.COLORS.text,
    backgroundColor: APP_CONFIG.COLORS.surface,
  },
  registerButton: {
    backgroundColor: APP_CONFIG.COLORS.primary,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: APP_CONFIG.SPACING.md,
    marginBottom: APP_CONFIG.SPACING.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: APP_CONFIG.COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
