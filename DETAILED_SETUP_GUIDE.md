# 🔧 Complete Android Development Setup Guide

## ❌ **Current Errors Explained:**
- `'adb' is not recognized` → Android SDK tools not in PATH
- `No emulators found` → No Android Virtual Device created
- `JAVA_HOME is not set` → Java Development Kit not configured
- `error Failed to install` → Missing Android development tools

## 📋 **Complete Setup Process (Step-by-Step)**

### **Step 1: Install Java Development Kit (JDK)**

1. **Download JDK 17:**
   - Go to: https://adoptium.net/temurin/releases/
   - Download: **OpenJDK 17 LTS** for Windows x64
   - File will be: `OpenJDK17U-jdk_x64_windows_hotspot_17.x.x_xx.msi`

2. **Install JDK:**
   - Run the downloaded `.msi` file
   - Install to default location: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot\`
   - Complete installation

3. **Set JAVA_HOME Environment Variable:**
   ```
   Windows Key + R → type "sysdm.cpl" → Enter
   → Advanced tab → Environment Variables
   → System variables → New
   ```
   - **Variable name:** `JAVA_HOME`
   - **Variable value:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot` (adjust version)
   - Click OK

4. **Add Java to PATH:**
   - In System variables, find "Path" → Edit
   - Click "New" → Add: `%JAVA_HOME%\bin`
   - Click OK on all dialogs

5. **Verify Java Installation:**
   ```powershell
   java --version
   javac --version
   ```
   Should show Java 17.x.x

### **Step 2: Install Android Studio**

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download latest version for Windows
   - File: `android-studio-xxxx.x.x.x-windows.exe`

2. **Install Android Studio:**
   - Run the installer
   - Choose "Standard" installation
   - Accept all licenses
   - Let it download Android SDK components
   - **This will take 10-20 minutes**

3. **Complete Setup Wizard:**
   - Launch Android Studio after installation
   - Complete the setup wizard
   - Choose "Standard" setup
   - Select UI theme (your choice)
   - Let it download additional components

### **Step 3: Configure Android SDK**

1. **Open SDK Manager:**
   - In Android Studio: Tools → SDK Manager
   - Or click the SDK Manager icon in toolbar

2. **Install Required SDK Platforms:**
   - **SDK Platforms tab:**
     - ✅ Android 14.0 (API 34) - Latest
     - ✅ Android 13.0 (API 33) - Recommended for React Native
     - ✅ Android 12.0 (API 31)

3. **Install SDK Tools:**
   - **SDK Tools tab:**
     - ✅ **Android SDK Build-Tools** (will install latest version automatically - usually 34.0.0 or 35.0.0)
     - ✅ **Android Emulator** 
     - ✅ **Android SDK Platform-Tools**
     - ✅ **Android SDK Command-line Tools (latest)**
     - ✅ **Intel x86 Emulator Accelerator (HAXM installer)** (if available)

4. **Note SDK Location:**
   - Remember the Android SDK Location (usually: `C:\Users\YourName\AppData\Local\Android\Sdk`)

### **Step 4: Set Android Environment Variables**

1. **Set ANDROID_HOME:**
   ```
   Windows Key + R → "sysdm.cpl" → Environment Variables
   → System variables → New
   ```
   - **Variable name:** `ANDROID_HOME`
   - **Variable value:** `C:\Users\YourName\AppData\Local\Android\Sdk` (your actual path)

2. **Add Android Tools to PATH:**
   - Edit System PATH variable
   - Add these entries:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

3. **Restart Your Computer** (Important!)

### **Step 5: Create Android Virtual Device (Emulator)**

1. **Open AVD Manager:**
   - In Android Studio: Tools → AVD Manager
   - Or click AVD Manager icon

2. **Create Virtual Device:**
   - Click "Create Virtual Device"
   - **Choose Device:** Pixel 6 (recommended)
   - Click "Next"

3. **Choose System Image:**
   - **Release Name:** Latest (Android 14/API 34) or Android 13/API 33
   - Click "Download" if not already downloaded
   - Select the image and click "Next"

4. **Configure AVD:**
   - **AVD Name:** `Pixel_6_API_33` (or similar)
   - **Advanced Settings:**
     - RAM: 4096 MB (if your computer has 8GB+ RAM)
     - Internal Storage: 6000 MB
   - Click "Finish"

### **Step 6: Test Your Setup**

1. **Verify Environment Variables:**
   ```powershell
   # Open NEW PowerShell window (important!)
   echo $env:JAVA_HOME
   echo $env:ANDROID_HOME
   java --version
   adb version
   ```

2. **Run React Native Doctor:**
   ```powershell
   cd "c:\local\my_project_attempts\mobile_broken_lines\BrokenLinesMobile"
   npx react-native doctor
   ```
   Should show ✅ for all requirements

### **Step 7: Launch Emulator and Run App**

1. **Start Emulator:**
   ```powershell
   # Option 1: From Android Studio
   # Open Android Studio → AVD Manager → Click ▶️ next to your emulator

   # Option 2: From Command Line
   emulator -avd Pixel_6_API_33
   ```

2. **Wait for Emulator to Boot:**
   - First boot takes 2-5 minutes
   - Wait until you see Android home screen

3. **Run Your App:**
   ```powershell
   cd "c:\local\my_project_attempts\mobile_broken_lines\BrokenLinesMobile"
   
   # Terminal 1: Start Metro
   npx react-native start
   
   # Terminal 2: Install and run app (wait for Metro to start first)
   npx react-native run-android
   ```

## 🚀 **Alternative: Use Physical Android Device**

If emulator is too slow:

1. **Enable Developer Options:**
   - Settings → About phone → Tap "Build number" 7 times
   - Go back → Developer options

2. **Enable USB Debugging:**
   - Developer options → USB debugging → ON

3. **Connect Phone via USB:**
   - Connect phone to computer
   - Allow USB debugging on phone

4. **Verify Connection:**
   ```powershell
   adb devices
   ```
   Should show your device

## 🛠️ **Troubleshooting Common Issues**

### **"JAVA_HOME not set"**
- Restart computer after setting environment variables
- Use exact path from Java installation
- Check PATH includes `%JAVA_HOME%\bin`

### **"adb not recognized"**
- Restart computer after setting ANDROID_HOME
- Verify PATH includes `%ANDROID_HOME%\platform-tools`

### **"No emulators found"**
- Create AVD in Android Studio first
- Start emulator before running `npx react-native run-android`

### **Emulator won't start**
- Enable Hyper-V in Windows features
- Install Intel HAXM from SDK Manager
- Try different API level (33 instead of 34)

### **App install fails**
- Clean project: `cd android && ./gradlew clean && cd ..`
- Reset Metro: `npx react-native start --reset-cache`

## ⏱️ **Time Estimate:**
- **First-time setup:** 1-2 hours (mostly waiting for downloads)
- **After setup:** 2-3 minutes to start app

## 📞 **Need Help?**
If you encounter issues:
1. Run `npx react-native doctor` to diagnose
2. Check that all environment variables are set correctly
3. Restart computer after setting environment variables
4. Make sure emulator is running before `npx react-native run-android`

Once setup is complete, your standalone mobile app will run perfectly! 🎉
