import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realLLMService from '../services/realLLMService';
import { ModelDownloader } from '../services/modelDownloader';

export const DebugModelStatus = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadDebugInfo = async () => {
    setRefreshing(true);
    try {
      // Get AsyncStorage data safely
      const currentModel = await AsyncStorage.getItem('current_model');
      const allKeys = await AsyncStorage.getAllKeys();
      const modelKeys = allKeys.filter(key => key.includes('model'));
      
      const modelData: any = {};
      for (const key of modelKeys) {
        modelData[key] = await AsyncStorage.getItem(key);
      }

      // Get real LLM service status safely
      let realStatus;
      try {
        realStatus = await realLLMService.getCurrentModelStatus();
      } catch (statusError) {
        console.error('Error getting LLM status:', statusError);
        realStatus = {
          hasRealModel: false,
          status: 'Error loading status',
          modelType: 'Unknown',
          config: { maxTokens: 150, temperature: 0.7, systemPrompt: '' },
          error: 'Status loading failed'
        };
      }

      let modelInfo;
      try {
        modelInfo = realLLMService.getModelInfo();
      } catch (infoError) {
        console.error('Error getting model info:', infoError);
        modelInfo = { isLoaded: false, error: 'Info loading failed' };
      }

      // Get model downloader info safely
      let installedModels: any[] = [];
      let modelPaths: Record<string, string | null> = {};
      
      try {
        const downloader = ModelDownloader.getInstance();
        installedModels = await downloader.getInstalledModels();
        
        for (const model of installedModels) {
          const modelId = typeof model === 'string' ? model : model.id;
          const path = await downloader.getModelPath(modelId);
          modelPaths[modelId] = path;
        }
      } catch (downloaderError) {
        console.error('Error getting downloader info:', downloaderError);
        installedModels = [];
        modelPaths = {};
      }

      setDebugInfo({
        currentModel,
        allModelKeys: modelKeys,
        modelData,
        realStatus,
        modelInfo,
        installedModels,
        modelPaths,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Debug info error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setRefreshing(false);
  };

  const testModelSelection = async () => {
    try {
      await AsyncStorage.setItem('current_model', 'test-model');
      Alert.alert('Test', 'Set current_model to test-model');
      loadDebugInfo();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const clearModelData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const modelKeys = keys.filter(key => key.includes('model'));
      await AsyncStorage.multiRemove(modelKeys);
      Alert.alert('Cleared', 'All model data cleared');
      loadDebugInfo();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testEnhancement = async () => {
    try {
      const result = await realLLMService.enhanceText('This is a test text.');
      
      const statusMessage = result.isFallback 
        ? `⚠️ USING FALLBACK SYSTEM\nReason: ${result.fallbackReason}`
        : `✅ USING REAL AI MODEL`;
      
      Alert.alert('Enhancement Result', `
${statusMessage}

Model Used: ${result.modelUsed}
Confidence: ${result.confidence}
Time: ${result.processingTime}ms
Tokens: ${result.tokensGenerated}

Result: ${result.enhancedText.substring(0, 150)}...
      `);
    } catch (error) {
      Alert.alert('Enhancement Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        🔍 Model Debug Console
      </Text>
      
      <TouchableOpacity
        onPress={loadDebugInfo}
        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginBottom: 16 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Debug Info'}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={testModelSelection}
          style={{ backgroundColor: '#FF9500', padding: 10, borderRadius: 6, marginRight: 8, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            🧪 Test Select
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearModelData}
          style={{ backgroundColor: '#FF3B30', padding: 10, borderRadius: 6, marginRight: 8, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            🗑️ Clear Data
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testEnhancement}
          style={{ backgroundColor: '#34C759', padding: 10, borderRadius: 6, flex: 1 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            ✨ Test AI
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>📊 Current Status</Text>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Current Model: {debugInfo.currentModel || 'None'}
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Status: {debugInfo.realStatus?.status || 'Loading...'}
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Has Real Model: {debugInfo.realStatus?.hasRealModel ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Model Type: {debugInfo.realStatus?.modelType || 'Unknown'}
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>💾 AsyncStorage Data</Text>
        <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
          {JSON.stringify(debugInfo.modelData, null, 2)}
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>📁 Installed Models</Text>
        <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
          {JSON.stringify(debugInfo.installedModels, null, 2)}
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>🛤️ Model Paths</Text>
        <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
          {JSON.stringify(debugInfo.modelPaths, null, 2)}
        </Text>
      </View>

      <Text style={{ fontSize: 10, color: '#666', textAlign: 'center', marginTop: 16 }}>
        Last updated: {debugInfo.timestamp}
      </Text>
    </ScrollView>
  );
};
