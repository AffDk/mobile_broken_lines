/**
 * Broken Lines Mobile - Blog App with LLM Integration
 * Mobile equivalent of the FastAPI web application
 * 
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import { User, apiService } from './src/services/apiService';
import { APP_CONFIG } from './src/config/config';

// Force English locale for the app
import { I18nManager } from 'react-native';
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// Types
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Main App Component
function App(): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state on app start
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize demo data if needed
      await apiService.initializeDemoData();
      
      // Preload LLM service safely (non-blocking)
      initializeLLMServiceSafely();
      
      // Load auth state
      await loadAuthState();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const initializeLLMServiceSafely = async () => {
    try {
      // Import and initialize LLM service in the background
      const { default: realLLMService } = await import('./src/services/realLLMService');
      
      // Initialize in background, don't wait for it
      realLLMService.initialize().catch(error => {
        console.log('⚠️ LLM service initialization failed, will use fallback:', error);
      });
    } catch (error) {
      console.log('⚠️ Failed to import LLM service, will use fallback when needed:', error);
    }
  };

  const loadAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('currentUser');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
        });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (user: User, token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        user,
        token,
      });
    } catch (error) {
      console.error('Error saving auth state:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'currentUser']);
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_CONFIG.COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={APP_CONFIG.COLORS.background}
      />
      <RootNavigator 
        isAuthenticated={authState.isAuthenticated}
        user={authState.user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.COLORS.background,
  },
});

export default App;
