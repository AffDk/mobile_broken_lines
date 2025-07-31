import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IconText from '../components/IconText';

// Import screens
import {
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  CreatePostScreen,
  EditPostScreen,
  PostDetailScreen,
  ProfileScreen,
  ModelDownloadScreen,
} from '../screens';

// Types for navigation props
import type { User } from '../services/apiService';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  PostDetail: { postId: number };
  EditPost: { postId: number };
};

export type MainTabParamList = {
  Home: undefined;
  CreatePost: undefined;
  Models: undefined;
  Profile: undefined;
};

// Props interfaces
interface MainTabNavigatorProps {
  user: User | null;
  onLogout: () => void;
}

interface RootNavigatorProps {
  isAuthenticated: boolean;
  user: User | null;
  onLogin: (user: User, token: string) => void;
  onLogout: () => void;
}

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator (for authenticated users)
function MainTabNavigator({ user, onLogout }: MainTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'CreatePost') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'circle';
          }

          return <IconText name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Posts' }}
      />
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{ title: 'Create' }}
      />
      <Tab.Screen 
        name="Models" 
        component={ModelDownloadScreen} 
        options={{ title: 'AI Models' }}
      />
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
      >
        {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function RootNavigator({ 
  isAuthenticated, 
  user, 
  onLogin, 
  onLogout 
}: RootNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens
        <>
          <Stack.Screen name="Main">
            {(props) => <MainTabNavigator {...props} user={user} onLogout={onLogout} />}
          </Stack.Screen>
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{ headerShown: true, title: 'Post Detail' }}
          />
          <Stack.Screen 
            name="EditPost" 
            component={EditPostScreen}
            options={{ headerShown: true, title: 'Edit Post' }}
          />
        </>
      ) : (
        // Non-authenticated screens
        <>
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: true, title: 'Login' }}
          >
            {(props) => <LoginScreen {...props} onLogin={onLogin} />}
          </Stack.Screen>
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: true, title: 'Register' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
