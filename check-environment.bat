@echo off
echo ========================================
echo   Android Development Environment Check
echo ========================================
echo.

echo Checking Java Installation...
java --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java not found or not in PATH
    echo Please install JDK 17 and set JAVA_HOME
) else (
    echo ✅ Java is installed
)
echo.

echo Checking JAVA_HOME...
if "%JAVA_HOME%"=="" (
    echo ❌ JAVA_HOME environment variable not set
) else (
    echo ✅ JAVA_HOME: %JAVA_HOME%
)
echo.

echo Checking Android SDK...
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME environment variable not set
) else (
    echo ✅ ANDROID_HOME: %ANDROID_HOME%
)
echo.

echo Checking ADB (Android Debug Bridge)...
adb version 2>nul
if %errorlevel% neq 0 (
    echo ❌ ADB not found in PATH
    echo Make sure ANDROID_HOME\platform-tools is in PATH
) else (
    echo ✅ ADB is working
)
echo.

echo Checking for connected devices/emulators...
adb devices 2>nul
echo.

echo Checking available emulators...
emulator -list-avds 2>nul
if %errorlevel% neq 0 (
    echo ❌ Emulator command not found or no AVDs created
    echo Create an Android Virtual Device in Android Studio
) else (
    echo ✅ Emulator command working
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo If you see ❌ above, follow the setup guide:
echo DETAILED_SETUP_GUIDE.md
echo.
echo If all show ✅, you can run:
echo 1. Start emulator (Android Studio or 'emulator -avd YourAVDName')
echo 2. npx react-native run-android
echo.
pause
