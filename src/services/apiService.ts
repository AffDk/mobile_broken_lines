import AsyncStorage from '@react-native-async-storage/async-storage';
import OnDeviceLLM, { LLMResponse } from './llmService';

// Types
interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  ai_updated_content?: string;
  created_at: string;
  updated_at?: string;
  owner_id: number;
}

interface BlogPostCreate {
  title: string;
  content: string;
}

interface BlogPostUpdate {
  title?: string;
  content?: string;
  ai_updated_content?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  CURRENT_USER: 'currentUser',
  AUTH_TOKEN: 'authToken',
  NEXT_USER_ID: 'nextUserId',
  NEXT_POST_ID: 'nextPostId',
};

class LocalApiService {
  // Helper methods for storage
  private async getStorageData<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private async setStorageData<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error('Failed to save data');
    }
  }

  private generateToken(): string {
    return 'local_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async getNextId(key: string): Promise<number> {
    const nextId = await this.getStorageData(key, 1);
    await this.setStorageData(key, nextId + 1);
    return nextId;
  }

  // Lightweight on-device LLM enhancement
  private async enhanceContentWithAI(content: string): Promise<string> {
    try {
      console.log('🤖 Starting LLM enhancement...');
      
      const llm = new OnDeviceLLM();
      await llm.initialize();
      const response: LLMResponse = await llm.enhanceText(content);
      
      // Log enhancement details
      console.log(`✅ LLM Enhancement Complete:`);
      console.log(`- Model: ${response.modelUsed}`);
      console.log(`- Processing Time: ${response.processingTime}ms`);
      console.log(`- Confidence: ${(response.confidence * 100).toFixed(1)}%`);
      console.log(`- Original Length: ${content.length} chars`);
      console.log(`- Enhanced Length: ${response.enhancedText.length} chars`);
      
      return response.enhancedText;
    } catch (error) {
      console.warn('❌ LLM enhancement failed, using fallback:', error);
      
      // Simple fallback enhancement
      return content
        .replace(/\bvery good\b/gi, 'excellent')
        .replace(/\bvery bad\b/gi, 'problematic')
        .replace(/\bI think\b/gi, 'Evidence suggests')
        .replace(/\ba lot of\b/gi, 'numerous')
        .replace(/\bget\b/gi, 'obtain')
        .replace(/\bmake\b/gi, 'create');
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Get stored users
    const users: User[] = await this.getStorageData(STORAGE_KEYS.USERS, []);
    
    // Find user by username
    const user = users.find(u => u.username === credentials.username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // In a real app, you'd hash and compare passwords
    // For demo purposes, we'll use a simple check
    if (credentials.password !== 'password123') { // Simple demo password
      throw new Error('Invalid password');
    }
    
    const token = this.generateToken();
    await this.setStorageData(STORAGE_KEYS.AUTH_TOKEN, token);
    await this.setStorageData(STORAGE_KEYS.CURRENT_USER, user);
    
    return {
      access_token: token,
      token_type: 'Bearer',
      user,
    };
  }

  async register(userData: RegisterRequest): Promise<User> {
    const users: User[] = await this.getStorageData(STORAGE_KEYS.USERS, []);
    
    // Check if user already exists
    if (users.find(u => u.username === userData.username || u.email === userData.email)) {
      throw new Error('User already exists');
    }
    
    const userId = await this.getNextId(STORAGE_KEYS.NEXT_USER_ID);
    const newUser: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      is_active: true,
    };
    
    users.push(newUser);
    await this.setStorageData(STORAGE_KEYS.USERS, users);
    
    return newUser;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CURRENT_USER,
    ]);
  }

  // Blog post methods
  async getPosts(): Promise<BlogPost[]> {
    const currentUser = await this.getStorageData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    // Return only posts by current user
    return posts.filter(post => post.owner_id === currentUser.id);
  }

  async getPost(id: number): Promise<BlogPost> {
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  }

  async createPost(postData: BlogPostCreate): Promise<BlogPost> {
    const currentUser = await this.getStorageData<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    const postId = await this.getNextId(STORAGE_KEYS.NEXT_POST_ID);
    
    const newPost: BlogPost = {
      id: postId,
      title: postData.title,
      content: postData.content,
      created_at: new Date().toISOString(),
      owner_id: currentUser.id,
    };
    
    posts.push(newPost);
    await this.setStorageData(STORAGE_KEYS.POSTS, posts);
    
    return newPost;
  }

  async updatePost(id: number, postData: BlogPostUpdate): Promise<BlogPost> {
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    const updatedPost = {
      ...posts[postIndex],
      ...postData,
      updated_at: new Date().toISOString(),
    };
    
    posts[postIndex] = updatedPost;
    await this.setStorageData(STORAGE_KEYS.POSTS, posts);
    
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    const filteredPosts = posts.filter(p => p.id !== id);
    await this.setStorageData(STORAGE_KEYS.POSTS, filteredPosts);
  }

  async enhancePost(id: number): Promise<BlogPost> {
    const posts: BlogPost[] = await this.getStorageData(STORAGE_KEYS.POSTS, []);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    const post = posts[postIndex];
    const enhancedContent = await this.enhanceContentWithAI(post.content);
    
    const updatedPost = {
      ...post,
      ai_updated_content: enhancedContent,
      updated_at: new Date().toISOString(),
    };
    
    posts[postIndex] = updatedPost;
    await this.setStorageData(STORAGE_KEYS.POSTS, posts);
    
    return updatedPost;
  }

  // Health check (always returns true for local storage)
  async healthCheck(): Promise<boolean> {
    return true;
  }

  // Initialize demo data
  async initializeDemoData(): Promise<void> {
    const users = await this.getStorageData(STORAGE_KEYS.USERS, []);
    
    if (users.length === 0) {
      // Create demo user
      const demoUser: User = {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        is_active: true,
      };
      
      await this.setStorageData(STORAGE_KEYS.USERS, [demoUser]);
      await this.setStorageData(STORAGE_KEYS.NEXT_USER_ID, 2);
      
      // Create demo posts
      const demoPosts: BlogPost[] = [
        {
          id: 1,
          title: 'Welcome to Broken Lines Mobile!',
          content: 'This is your first blog post in the standalone mobile app. You can create, edit, and enhance posts with AI - all stored locally on your device!',
          created_at: new Date().toISOString(),
          owner_id: 1,
        },
        {
          id: 2,
          title: 'Getting Started with Mobile Blogging',
          content: 'Here are some tips for effective mobile blogging:\n\n1. Keep your titles engaging\n2. Write clear, concise content\n3. Use the AI enhancement feature to improve your posts\n4. Regular posting helps build your audience',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          owner_id: 1,
        },
        {
          id: 3,
          title: 'Advanced Features of the App',
          content: 'Explore the advanced features like AI enhancement, post editing, and user management. The app now supports pagination for better navigation through your posts.',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          owner_id: 1,
        },
        {
          id: 4,
          title: 'Tips for Better Writing',
          content: 'Good writing starts with clear thinking. Structure your ideas, use simple language, and always consider your audience. The AI enhancement can help improve your text flow.',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          owner_id: 1,
        },
        {
          id: 5,
          title: 'Mobile App Development Insights',
          content: 'Building mobile apps requires attention to user experience, performance, and offline capabilities. This app demonstrates local storage and simulated AI features.',
          created_at: new Date(Date.now() - 345600000).toISOString(),
          owner_id: 1,
        },
        {
          id: 6,
          title: 'The Future of Content Creation',
          content: 'Content creation is evolving with AI assistance. While this app uses simulated AI, real AI integration could provide powerful writing assistance for mobile users.',
          created_at: new Date(Date.now() - 432000000).toISOString(),
          owner_id: 1,
        },
        {
          id: 7,
          title: 'Local Storage vs Cloud Storage',
          content: 'This app uses local storage for offline functionality. Each approach has benefits: local storage for privacy and offline access, cloud storage for sync across devices.',
          created_at: new Date(Date.now() - 518400000).toISOString(),
          owner_id: 1,
        },
      ];
      
      await this.setStorageData(STORAGE_KEYS.POSTS, demoPosts);
      await this.setStorageData(STORAGE_KEYS.NEXT_POST_ID, 8);
    }
  }
}

export const apiService = new LocalApiService();
export type { User, BlogPost, BlogPostCreate, BlogPostUpdate, AuthResponse };
