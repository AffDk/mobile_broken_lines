import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realLLMService from '../services/realLLMService';
import modelDownloader, { DownloadProgress } from '../services/modelDownloader';
import { DebugModelStatus } from '../components/DebugModelStatus';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  size: string;
  url: string;
  recommended?: boolean;
}

const ModelDownloadScreen: React.FC = () => {
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadBytes, setDownloadBytes] = useState({ downloaded: 0, total: 0 });
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [realModelStatus, setRealModelStatus] = useState<any>(null);
  const [modelDirectory, setModelDirectory] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'models' | 'debug'>('models');

  const modelOptions: ModelOption[] = [
    {
      id: 'gpt2-onnx',
      name: 'GPT-2 Base (ONNX)',
      description: 'Real GPT-2 ONNX model from OpenAI. High-quality text generation and enhancement.',
      size: '500MB',
      url: 'https://huggingface.co/openai-community/gpt2/resolve/main/onnx/model.onnx',
      recommended: true,
    },
    {
      id: 'bert-base-onnx',
      name: 'BERT Base Uncased (ONNX)',
      description: 'Real BERT ONNX model from Google. Excellent for text understanding and enhancement.',
      size: '420MB',
      url: 'https://huggingface.co/google-bert/bert-base-uncased/resolve/main/onnx/model.onnx',
    },
    {
      id: 'minilm-onnx',
      name: 'MiniLM-L6-v2 (ONNX)',
      description: 'Lightweight sentence transformer ONNX model. Fast and efficient for text processing.',
      size: '90MB',
      url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx',
    },
    {
      id: 'distilbert-onnx',
      name: 'DistilBERT Base (ONNX)',
      description: 'Smaller, faster BERT variant in ONNX format. Good balance of speed and quality.',
      size: '250MB',
      url: 'https://huggingface.co/distilbert/distilbert-base-uncased/resolve/main/onnx/model.onnx',
    },
    {
      id: 'test-model',
      name: 'Test Model (Demo)',
      description: 'Small demo file for testing purposes - creates a placeholder.',
      size: '1KB',
      url: 'https://httpbin.org/json', // Simple JSON for testing fallback
    },
  ];

  useEffect(() => {
    loadInstalledModels();
    loadRealModelStatus();
    loadModelDirectory();
  }, []);

  const loadRealModelStatus = async () => {
    try {
      console.log('🔄 Loading real model status...');
      const status = await realLLMService.getCurrentModelStatus();
      console.log('✅ Model status loaded:', status);
      setRealModelStatus(status);
    } catch (error) {
      console.error('❌ Error loading real model status:', error);
      // Set a fallback status to prevent crashes
      setRealModelStatus({
        hasRealModel: false,
        status: 'Error loading model status',
        modelType: 'Unknown',
        config: { maxTokens: 150, temperature: 0.7, systemPrompt: '' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const loadModelDirectory = async () => {
    try {
      const path = await modelDownloader.getModelPath('');
      if (path) {
        const dir = path.replace(/[^/]*$/, ''); // Remove filename to get directory
        setModelDirectory(dir);
      }
    } catch (error) {
      console.error('Error loading model directory:', error);
    }
  };

  const loadInstalledModels = async () => {
    try {
      console.log('🔄 Loading installed models...');
      const installed = await modelDownloader.getInstalledModels();
      const current = await AsyncStorage.getItem('current_model');
      
      console.log('✅ Installed models:', installed);
      console.log('✅ Current model:', current);
      
      setInstalledModels(installed || []);
      
      if (current) {
        setCurrentModel(current);
      }
    } catch (error) {
      console.error('❌ Error loading installed models:', error);
      // Set fallback empty array to prevent crashes
      setInstalledModels([]);
      setCurrentModel(null);
    }
  };

  const downloadModel = async (model: ModelOption) => {
    setDownloadingModel(model.id);
    setDownloadProgress(0);
    setDownloadBytes({ downloaded: 0, total: 0 });

    Alert.alert(
      'Download Model',
      `Download ${model.name} (${model.size})?\n\nThis will use your internet connection and may take several minutes.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setDownloadingModel(null) },
        {
          text: 'Download',
          onPress: async () => {
            try {
              console.log(`📥 Starting download of ${model.name}...`);
              
              const success = await modelDownloader.downloadModel(
                model.url, 
                model.id,
                (progress: DownloadProgress) => {
                  setDownloadProgress(Math.round(progress.progress));
                  setDownloadBytes({
                    downloaded: progress.downloadedBytes,
                    total: progress.totalBytes,
                  });
                }
              );

              if (success) {
                console.log(`✅ Download completed successfully: ${model.name}`);
                
                try {
                  // Update installed models
                  const updatedInstalled = [...installedModels, model.id];
                  setInstalledModels(updatedInstalled);
                  
                  // Set as current model
                  setCurrentModel(model.id);
                  await AsyncStorage.setItem('current_model', model.id);
                  console.log(`✅ Set ${model.id} as current model`);
                  
                  // Reinitialize the LLM service with the new model
                  console.log('🔄 Reinitializing LLM service...');
                  await realLLMService.initialize();
                  console.log('✅ LLM service reinitialized');
                  
                  // Validate and fix any model-tokenizer mismatches
                  console.log('🔄 Validating model-tokenizer compatibility...');
                  const validation = await realLLMService.validateModelTokenizerMatch();
                  if (!validation.isValid) {
                    console.log('⚠️ Model-tokenizer mismatch detected, attempting fix...');
                    const fixed = await realLLMService.fixModelTokenizerMismatch();
                    if (fixed) {
                      console.log('✅ Model-tokenizer mismatch fixed');
                    } else {
                      console.log('❌ Could not fix model-tokenizer mismatch, but model will still work with fallback');
                    }
                  } else {
                    console.log('✅ Model and tokenizer are properly matched');
                  }
                  
                  // Reload status after download and validation
                  console.log('🔄 Reloading model status...');
                  await loadRealModelStatus();
                  console.log('✅ Model status reloaded');
                  
                  Alert.alert(
                    'Success!',
                    `${model.name} has been downloaded and is now active. Your AI enhancements will now use this model!`,
                    [{ text: 'Great!', onPress: () => {} }]
                  );
                } catch (postDownloadError) {
                  console.error('❌ Error in post-download setup:', postDownloadError);
                  Alert.alert(
                    'Download Complete - Setup Warning', 
                    `${model.name} was downloaded successfully, but there was an issue activating it. Please restart the app or try selecting the model again.`
                  );
                }
              } else {
                console.log(`❌ Download failed: ${model.name}`);
                Alert.alert('Error', 'Failed to download model. Please check your internet connection and try again.');
              }
            } catch (error) {
              console.error('❌ Download process error:', error);
              
              // Provide specific error information
              let errorMessage = 'An unexpected error occurred during download.';
              if (error instanceof Error) {
                errorMessage = `Download error: ${error.message}`;
                console.error('❌ Error details:', error.stack);
              }
              
              Alert.alert(
                'Download Failed', 
                `${errorMessage}\n\nPlease check your internet connection and try again. If the problem persists, try a different model.`,
                [{ text: 'OK', onPress: () => {} }]
              );
            } finally {
              setDownloadingModel(null);
              setDownloadProgress(0);
              setDownloadBytes({ downloaded: 0, total: 0 });
            }
          },
        },
      ]
    );
  };

  const switchModel = async (modelId: string) => {
    try {
      setCurrentModel(modelId);
      await AsyncStorage.setItem('current_model', modelId);
      await realLLMService.initialize();
      
      // Validate and fix any model-tokenizer mismatches
      console.log('🔄 Validating model-tokenizer compatibility...');
      const validation = await realLLMService.validateModelTokenizerMatch();
      if (!validation.isValid) {
        console.log('⚠️ Model-tokenizer mismatch detected, attempting fix...');
        const fixed = await realLLMService.fixModelTokenizerMismatch();
        if (!fixed) {
          console.log('❌ Could not fix model-tokenizer mismatch, but model will still work with fallback');
        }
      }
      
      // Reload status after switching
      await loadRealModelStatus();
      
      Alert.alert('Model Switched', `Now using ${modelOptions.find(m => m.id === modelId)?.name}!`);
    } catch (error) {
      console.error('Error switching model:', error);
      Alert.alert('Error', 'Failed to switch model.');
    }
  };

  const removeModel = async (modelId: string) => {
    Alert.alert(
      'Remove Model',
      `Remove ${modelOptions.find(m => m.id === modelId)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await modelDownloader.removeModel(modelId);
              
              if (success) {
                const updatedInstalled = installedModels.filter(id => id !== modelId);
                setInstalledModels(updatedInstalled);
                
                if (currentModel === modelId) {
                  setCurrentModel(null);
                  await AsyncStorage.removeItem('current_model');
                  await realLLMService.initialize(); // This will use fallback
                }
                
                Alert.alert('Removed', 'Model has been removed.');
              } else {
                Alert.alert('Error', 'Failed to remove model.');
              }
            } catch (error) {
              console.error('Error removing model:', error);
              Alert.alert('Error', 'Failed to remove model.');
            }
          },
        },
      ]
    );
  };

  const renderModelCard = (model: ModelOption) => {
    const isInstalled = installedModels.includes(model.id);
    const isCurrent = currentModel === model.id;
    const isDownloading = downloadingModel === model.id;

    return (
      <View key={model.id} style={[styles.modelCard, isCurrent && styles.currentModelCard]}>
        <View style={styles.modelHeader}>
          <Text style={styles.modelName}>
            {model.name}
            {model.recommended && <Text style={styles.recommendedBadge}> ⭐ Recommended</Text>}
            {isCurrent && <Text style={styles.currentBadge}> ✅ Active</Text>}
          </Text>
          <Text style={styles.modelSize}>{model.size}</Text>
        </View>
        
        <Text style={styles.modelDescription}>{model.description}</Text>
        
        {isDownloading && (
          <View style={styles.downloadProgress}>
            <Text style={styles.downloadText}>
              Downloading... {downloadProgress}%
              {downloadBytes.total > 0 && (
                ` (${(downloadBytes.downloaded / 1024 / 1024).toFixed(1)}MB / ${(downloadBytes.total / 1024 / 1024).toFixed(1)}MB)`
              )}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
          </View>
        )}
        
        <View style={styles.modelActions}>
          {!isInstalled && !isDownloading && (
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => downloadModel(model)}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
          
          {isInstalled && !isCurrent && (
            <TouchableOpacity
              style={[styles.actionButton, styles.switchButton]}
              onPress={() => switchModel(model.id)}
            >
              <Text style={styles.switchButtonText}>Use This Model</Text>
            </TouchableOpacity>
          )}
          
          {isInstalled && (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => removeModel(model.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
          
          {isDownloading && (
            <ActivityIndicator size="small" color="#4CAF50" />
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Model Manager</Text>
        <Text style={styles.subtitle}>
          Download and manage AI models for text enhancement
        </Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'models' && styles.activeTab]}
            onPress={() => setCurrentTab('models')}
          >
            <Text style={[styles.tabText, currentTab === 'models' && styles.activeTabText]}>
              📱 Models
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'debug' && styles.activeTab]}
            onPress={() => setCurrentTab('debug')}
          >
            <Text style={[styles.tabText, currentTab === 'debug' && styles.activeTabText]}>
              🔍 Debug
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentTab === 'models' ? (
        <>
          <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          {currentModel 
            ? `Selected: ${modelOptions.find(m => m.id === currentModel)?.name}`
            : 'Selected: None'
          }
        </Text>
        <Text style={styles.statusSubtext}>
          {realModelStatus ? (
            <>
              <Text style={{ color: realModelStatus.hasRealModel ? '#4CAF50' : '#FF9800' }}>
                {realModelStatus.hasRealModel ? '✅ Real AI Model Active' : '⚠️ Using Fallback System'}
              </Text>
              {'\n'}Status: {realModelStatus.status}
              {realModelStatus.tokenizerStatus && (
                <>
                  {'\n'}Tokenizer: {realModelStatus.tokenizerStatus}
                </>
              )}
              {realModelStatus.error && (
                <>
                  {'\n'}
                  <Text style={{ color: '#f44336' }}>Error: {realModelStatus.error}</Text>
                </>
              )}
            </>
          ) : (
            'Loading status...'
          )}
        </Text>
        
        {/* Add selection debug info */}
        <Text style={[styles.statusSubtext, { marginTop: 8, fontSize: 12, color: '#666' }]}>
          Debug: Selected="{currentModel || 'none'}", 
          Installed=[{installedModels.join(', ') || 'none'}]
        </Text>
      </View>

      {/* Debug Info Section */}
      <View style={styles.debugCard}>
        <Text style={styles.debugTitle}>🔧 Debug Information</Text>
        <Text style={styles.debugText}>
          Model Storage: {modelDirectory || 'Loading...'}
          {'\n'}Installed Models: {installedModels.length} 
          {installedModels.length > 0 && (
            <>
              {'\n'}• {installedModels.join('\n• ')}
            </>
          )}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            loadInstalledModels();
            loadRealModelStatus();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: '#9c27b0', marginTop: 8 }]}
          onPress={async () => {
            try {
              // Import RNFS to check paths
              const RNFS = require('react-native-fs');
              const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
              
              console.log('=== COMPLETE PATH DEBUG ===');
              console.log('Platform:', require('react-native').Platform.OS);
              console.log('DocumentDirectoryPath:', RNFS.DocumentDirectoryPath);
              console.log('ExternalStorageDirectoryPath:', RNFS.ExternalStorageDirectoryPath);
              console.log('CachesDirectoryPath:', RNFS.CachesDirectoryPath);
              console.log('Models Directory:', modelsDir);
              console.log('=== WINDOWS EQUIVALENT PATHS ===');
              console.log('Look in these Windows folders:');
              console.log('1. C:\\Users\\afsam\\.android\\avd\\Pixel_6_API_33.avd\\');
              console.log('2. C:\\Users\\afsam\\AppData\\Local\\Android\\Sdk\\');
              console.log('3. Search for: "com.brokenlinesmobile" in File Explorer');
              console.log('4. Search for: "tinyllama-chat.onnx" in File Explorer');
              
              const exists = await RNFS.exists(modelsDir);
              console.log('Directory Exists:', exists);
              
              if (exists) {
                const files = await RNFS.readDir(modelsDir);
                console.log('Files found:', files.map((f: any) => `${f.name} (${f.size} bytes)`));
              }
              
              // Try to get more path info
              console.log('=== ADDITIONAL DEBUG INFO ===');
              console.log('MainBundlePath:', RNFS.MainBundlePath);
              console.log('LibraryDirectoryPath:', RNFS.LibraryDirectoryPath);
              
              Alert.alert(
                'Path Debug Info', 
                `Internal Path: ${modelsDir}\n\nSearch on your computer for:\n• "com.brokenlinesmobile"\n• "tinyllama-chat.onnx"\n• Check console for detailed paths!`
              );
            } catch (error) {
              console.error('Debug error:', error);
              Alert.alert('Debug Error', error instanceof Error ? error.message : 'Unknown error');
            }
          }}
        >
          <Text style={styles.refreshButtonText}>🔍 Find Computer Path</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: '#FF5722', marginTop: 8 }]}
          onPress={async () => {
            try {
              console.log('🔧 Running model-tokenizer validation...');
              
              const validation = await realLLMService.validateModelTokenizerMatch();
              
              if (validation.isValid) {
                Alert.alert(
                  '✅ Validation Passed',
                  `Model and tokenizer are properly matched!\n\nModel: ${validation.modelId}\nTokenizer: ${validation.tokenizerModel}`
                );
              } else {
                Alert.alert(
                  '⚠️ Validation Failed',
                  `Issue: ${validation.issue}\n\nRecommendation: ${validation.recommendation}`,
                  [
                    { text: 'OK', style: 'cancel' },
                    {
                      text: 'Auto-Fix',
                      onPress: async () => {
                        console.log('🔧 Attempting automatic fix...');
                        const fixed = await realLLMService.fixModelTokenizerMismatch();
                        
                        if (fixed) {
                          Alert.alert('✅ Fixed', 'Model-tokenizer mismatch has been resolved!');
                          await loadRealModelStatus(); // Refresh the status
                        } else {
                          Alert.alert('❌ Fix Failed', 'Could not automatically fix the issue. Try re-downloading the model.');
                        }
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Validation error:', error);
              Alert.alert('Validation Error', error instanceof Error ? error.message : 'Unknown error');
            }
          }}
        >
          <Text style={styles.refreshButtonText}>🔧 Validate Tokenizer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Available Models</Text>
      
      {modelOptions.map(renderModelCard)}
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Tips</Text>
        <Text style={styles.infoText}>
          • Start with TinyLlama - best balance of quality and speed{'\n'}
          • Models are downloaded once and stored locally{'\n'}
          • You can switch between models anytime{'\n'}
          • Fallback system works when no model is installed
        </Text>
      </View>
        </>
      ) : (
        <DebugModelStatus />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  modelCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentModelCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  recommendedBadge: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  currentBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modelSize: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  downloadProgress: {
    marginBottom: 15,
  },
  downloadText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  modelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  switchButton: {
    backgroundColor: '#2196F3',
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  debugCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#f57c00',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
});

export default ModelDownloadScreen;
