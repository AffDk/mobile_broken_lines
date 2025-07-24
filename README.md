# 📱 BrokenLines Mobile - React Native Blog App

A full-featured mobile blog application built with React Native, TypeScript, and on-device AI text enhancement.

## ✨ Features

- 🔐 **User Authentication** - Login and registration system
- 📝 **Blog Management** - Create, edit, delete blog posts
- 📄 **Pagination** - Browse posts with 3 per page
- 🤖 **AI Enhancement** - On-device text improvement (no API required)
- 💾 **Offline First** - All data stored locally with AsyncStorage
- 📱 **Native Performance** - Smooth mobile experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Android Studio with Android SDK
- Android emulator or physical device

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Metro bundler:**
   ```bash
   npx react-native start
   ```

3. **Run on Android:**
   ```bash
   npx react-native run-android
   ```

4. **Login with demo account:**
   - Username: `demo`
   - Password: `password123`

## 📚 Learning Resources

- **[📖 Complete Tutorial](./COMPLETE_TUTORIAL.md)** - Comprehensive guide for beginners
- **[🚀 Quick Test Guide](./QUICK_TEST_GUIDE.md)** - Testing and troubleshooting
- **[⚙️ Detailed Setup Guide](./DETAILED_SETUP_GUIDE.md)** - Environment setup

## 🛠️ Technology Stack

- **React Native 0.80** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **AsyncStorage** - Local data persistence
- **Advanced NLP Processor** - On-device AI text enhancement

## 📱 Demo

The app includes:
- Sample blog posts with pagination
- AI-powered text enhancement
- Smooth navigation between screens
- Local user management
- Responsive mobile UI

## 🎯 Project Structure

```
src/
├── screens/          # UI screens (Home, Create, Edit, etc.)
├── navigation/       # App routing and navigation
├── services/         # Business logic (API, AI enhancement)
└── config/          # App configuration
```

## 🤖 AI Enhancement

Features a sophisticated **Advanced NLP Processor v2** that provides:
- Advanced grammatical analysis
- Contextual vocabulary enhancement
- Semantic structure optimization
- Style and engagement improvements
- 150-350ms processing time
- ~5MB memory footprint
- 100% offline operation

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run tests
npm test

# Type checking
npm run typecheck

# Clean build
npm run clean
```

### Debugging

- Press `j` in Metro terminal for Chrome DevTools
- Press `r` to reload the app
- Press `d` to open developer menu

## 📋 Testing Features

1. **Blog Posts**: Create, edit, delete posts
2. **AI Enhancement**: Toggle AI improvement for text
3. **Pagination**: Navigate through multiple pages
4. **User System**: Register new users, login/logout

## 🚨 Troubleshooting

See the **[Quick Test Guide](./QUICK_TEST_GUIDE.md)** for common issues and solutions.

## 🏗️ Architecture

The app follows React Native best practices:
- Component-based architecture
- TypeScript for type safety
- Local-first data storage
- Modular service layer
- Native platform integration

---

**Built with ❤️ using React Native and TypeScript**
