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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiService } from '../services/apiService';
import { APP_CONFIG } from '../config/config';
import { RootStackParamList } from '../navigation/RootNavigator';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface LoginScreenProps {
  onLogin: (user: any, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login({ username, password });
      
      // Save auth state
      await AsyncStorage.setItem('authToken', response.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // Call parent component's login handler
      onLogin(response.user, response.access_token);
      
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Broken Lines</Text>
          <Text style={styles.logoSubtext}>Mobile</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoText}>Username: demo</Text>
            <Text style={styles.demoText}>Password: password123</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
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
              placeholder="Enter your password"
              placeholderTextColor={APP_CONFIG.COLORS.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={APP_CONFIG.COLORS.surface} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
  loginButton: {
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
  loginButtonText: {
    color: APP_CONFIG.COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.primary,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: APP_CONFIG.COLORS.background,
    padding: APP_CONFIG.SPACING.md,
    borderRadius: 8,
    marginBottom: APP_CONFIG.SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.COLORS.secondary,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.COLORS.text,
    marginBottom: APP_CONFIG.SPACING.sm,
  },
  demoText: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default LoginScreen;
