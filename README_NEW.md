# 📱 BrokenLines Mobile - AI-Powered Blog App

A React Native mobile app for creating and enhancing blog posts with on-device AI assistance.

## ✨ Features

- **📝 Blog Post Creation** - Write and edit blog posts with a clean, intuitive interface
- **🤖 AI-Powered Enhancement** - Improve your writing with on-device AI that works completely offline
- **🎨 Customizable AI Behavior** - Configure writing style, tone, and focus
- **📱 Mobile-First Design** - Optimized user experience for mobile devices
- **🔒 Privacy-First** - All AI processing happens on-device, no data sent to servers

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Android Studio** with Android SDK
- **Java Development Kit (JDK)** 17

### Setup
1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd BrokenLinesMobile
   npm install
   ```

2. **Setup Android development environment:**
   - Install Android Studio
   - Set up Android SDK (API 33 recommended)
   - Create an Android Virtual Device (AVD)
   - Set environment variables: `ANDROID_HOME`, `JAVA_HOME`

3. **Run the app:**
   ```bash
   # Start Metro bundler
   npm start
   
   # Run on Android (in another terminal)
   npm run android
   ```

### Troubleshooting
- Run `npx react-native doctor` to check your development environment
- Ensure your Android emulator is running before building
- Check `DETAILED_SETUP_GUIDE.md` for comprehensive setup instructions

## 🤖 AI Enhancement System

The app includes a sophisticated on-device AI system for text enhancement:

### Features
- **100% Offline Operation** - No internet connection required
- **Multiple Writing Styles** - Formal, casual, academic, creative
- **Role-Based Enhancement** - Blog enhancer, creative writer, technical writer, casual writer
- **Configurable System Prompts** - Customize AI behavior completely
- **Fast Processing** - Advanced rule-based system optimized for mobile

### Usage
1. Write your blog post content
2. Tap "Enhance" to improve text with AI
3. Configure AI behavior via "AI Settings"
4. Preview enhancements before applying
5. Settings automatically save for future use

### Configuration Options
- **Writing Roles**: Blog enhancer, creative writer, technical writer, casual writer
- **Writing Styles**: Formal, casual, academic, creative  
- **Enhancement Focus**: Grammar, engagement, clarity, creativity
- **Custom System Prompts**: Write your own AI instructions

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── IconText.tsx    # Icon with text component
│   └── LLMConfigComponent.tsx # AI configuration UI
├── screens/            # App screens
│   ├── CreatePostScreen.tsx   # Create new posts
│   ├── EditPostScreen.tsx     # Edit existing posts
│   ├── HomeScreen.tsx         # Main screen
│   ├── LoginScreen.tsx        # User authentication
│   ├── PostDetailScreen.tsx   # View post details
│   ├── ProfileScreen.tsx      # User profile
│   └── RegisterScreen.tsx     # User registration
├── services/           # Business logic
│   ├── apiService.ts   # API communication
│   └── llmService.ts   # AI text enhancement
├── navigation/         # App navigation
│   └── RootNavigator.tsx
└── config/            # App configuration
    └── config.ts
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run clean` - Clean build cache

### Technology Stack
- **React Native 0.80** - Mobile framework
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local data storage
- **React Native Vector Icons** - Icon library

## 📚 Documentation

- **DETAILED_SETUP_GUIDE.md** - Complete Android development setup
- **AI_LLM_GUIDE.md** - AI system documentation
- **REAL_LLM_INTEGRATION_GUIDE.md** - Guide for integrating real language models
- **COMPLETE_TUTORIAL.md** - Comprehensive React Native tutorial

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the troubleshooting section in `DETAILED_SETUP_GUIDE.md`
- Run `npx react-native doctor` to diagnose common issues
- Ensure all prerequisites are properly installed
- Verify Android SDK and emulator setup

---

Built with ❤️ using React Native and TypeScript
