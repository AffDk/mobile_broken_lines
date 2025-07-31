import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realLLMService, { RealLLMService, SystemPromptConfig, LLMConfig } from '../services/realLLMService';

interface LLMConfigComponentProps {
  llm: typeof realLLMService;
  visible: boolean;
  onClose: () => void;
  onConfigUpdate: (config: SystemPromptConfig) => void;
}

const LLMConfigComponent: React.FC<LLMConfigComponentProps> = ({
  llm,
  visible,
  onClose,
  onConfigUpdate,
}) => {
  const [config, setConfig] = useState<SystemPromptConfig>({
    role: 'blog_enhancer',
    style: 'casual',
    focus: 'clarity',
  });
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [maxTokens, setMaxTokens] = useState('256');
  const [temperature, setTemperature] = useState('0.7');
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadConfiguration();
      updateModelInfo();
    }
  }, [visible]);

  const loadConfiguration = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('llm_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed.systemPrompt || config);
        setCustomPrompt(parsed.customPrompt || '');
        setUseCustomPrompt(parsed.useCustomPrompt || false);
        setMaxTokens(parsed.maxTokens?.toString() || '256');
        setTemperature(parsed.temperature?.toString() || '0.7');
      }
    } catch (error) {
      console.error('Failed to load LLM configuration:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      const configToSave = {
        systemPrompt: config,
        customPrompt,
        useCustomPrompt,
        maxTokens: parseInt(maxTokens),
        temperature: parseFloat(temperature),
      };
      
      await AsyncStorage.setItem('llm_config', JSON.stringify(configToSave));
      
      // Update LLM configuration
      const promptConfig: SystemPromptConfig = {
        ...config,
        customPrompt: useCustomPrompt ? customPrompt : undefined,
      };
      
      llm.setSystemPrompt(promptConfig);
      llm.updateConfig({
        maxTokens: parseInt(maxTokens),
        temperature: parseFloat(temperature),
      });
      
      onConfigUpdate(promptConfig);
      
      // Refresh model info after saving
      await updateModelInfo();
      
      Alert.alert('Success', 'Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save LLM configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const updateModelInfo = async () => {
    try {
      const status = await llm.getCurrentModelStatus();
      setModelInfo(status);
    } catch (error) {
      console.error('Failed to get model status:', error);
      const fallbackInfo = llm.getModelInfo();
      setModelInfo(fallbackInfo);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Configuration',
      'Are you sure you want to reset to default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setConfig({
              role: 'blog_enhancer',
              style: 'casual',
              focus: 'clarity',
            });
            setCustomPrompt('');
            setUseCustomPrompt(false);
            setMaxTokens('256');
            setTemperature('0.7');
          },
        },
      ]
    );
  };

  const previewCurrentPrompt = () => {
    const promptConfig: SystemPromptConfig = {
      ...config,
      customPrompt: useCustomPrompt ? customPrompt : undefined,
    };
    
    llm.setSystemPrompt(promptConfig);
    const currentPrompt = llm.getSystemPrompt();
    
    Alert.alert(
      'Current System Prompt',
      currentPrompt,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const testConfiguration = async () => {
    try {
      const testText = "This is test text for checking the LLM configuration.";
      const result = await llm.enhanceText(testText);
      
      // Create status message based on whether fallback was used
      const statusInfo = result.isFallback 
        ? `\n\n⚠️ Using intelligent fallback system\nReason: ${result.fallbackReason}\nModel: ${result.modelUsed}`
        : `\n\n✅ Using real AI model\nModel: ${result.modelUsed}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`;
      
      Alert.alert(
        'Test Result',
        `Original: "${testText}"\n\nEnhanced: "${result.enhancedText}"\n\nProcessing time: ${result.processingTime}ms${statusInfo}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Test Failed', 'Failed to test configuration: ' + (error as Error).message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LLM Configuration</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Model Info */}
          {modelInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Model Information</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>Model: {modelInfo.modelType}</Text>
                <Text style={styles.infoText}>
                  Status: {modelInfo.hasRealModel ? (
                    <Text style={{ color: '#4CAF50' }}>✅ Real AI Model Active</Text>
                  ) : (
                    <Text style={{ color: '#FF9800' }}>⚠️ Using Fallback System</Text>
                  )}
                </Text>
                <Text style={styles.infoText}>Details: {modelInfo.status}</Text>
                {modelInfo.error && (
                  <Text style={[styles.infoText, { color: '#f44336' }]}>
                    Error: {modelInfo.error}
                  </Text>
                )}
                <Text style={styles.infoText}>Max Tokens: {modelInfo.config.maxTokens}</Text>
                <Text style={styles.infoText}>Temperature: {modelInfo.config.temperature}</Text>
                <TouchableOpacity 
                  style={styles.refreshStatusButton}
                  onPress={() => updateModelInfo()}
                >
                  <Text style={styles.refreshStatusText}>🔄 Refresh Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Writing Role</Text>
            <View style={styles.optionGrid}>
              {[
                { key: 'blog_enhancer', label: 'Blog Enhancer', icon: '📝' },
                { key: 'creative_writer', label: 'Creative Writer', icon: '🎨' },
                { key: 'technical_writer', label: 'Technical Writer', icon: '⚙️' },
                { key: 'casual_writer', label: 'Casual Writer', icon: '💬' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[
                    styles.optionButton,
                    config.role === role.key && styles.selectedOption,
                  ]}
                  onPress={() => setConfig({ ...config, role: role.key as any })}
                >
                  <Text style={styles.optionIcon}>{role.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    config.role === role.key && styles.selectedOptionText,
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Style Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Writing Style</Text>
            <View style={styles.optionGrid}>
              {[
                { key: 'formal', label: 'Formal', icon: '🎩' },
                { key: 'casual', label: 'Casual', icon: '👕' },
                { key: 'academic', label: 'Academic', icon: '🎓' },
                { key: 'creative', label: 'Creative', icon: '🌟' },
              ].map((style) => (
                <TouchableOpacity
                  key={style.key}
                  style={[
                    styles.optionButton,
                    config.style === style.key && styles.selectedOption,
                  ]}
                  onPress={() => setConfig({ ...config, style: style.key as any })}
                >
                  <Text style={styles.optionIcon}>{style.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    config.style === style.key && styles.selectedOptionText,
                  ]}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Focus Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enhancement Focus</Text>
            <View style={styles.optionGrid}>
              {[
                { key: 'grammar', label: 'Grammar', icon: '📚' },
                { key: 'engagement', label: 'Engagement', icon: '🎯' },
                { key: 'clarity', label: 'Clarity', icon: '💡' },
                { key: 'creativity', label: 'Creativity', icon: '🚀' },
              ].map((focus) => (
                <TouchableOpacity
                  key={focus.key}
                  style={[
                    styles.optionButton,
                    config.focus === focus.key && styles.selectedOption,
                  ]}
                  onPress={() => setConfig({ ...config, focus: focus.key as any })}
                >
                  <Text style={styles.optionIcon}>{focus.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    config.focus === focus.key && styles.selectedOptionText,
                  ]}>
                    {focus.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Advanced Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Max Tokens</Text>
              <TextInput
                style={styles.numberInput}
                value={maxTokens}
                onChangeText={setMaxTokens}
                keyboardType="numeric"
                placeholder="256"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Temperature (Creativity)</Text>
              <TextInput
                style={styles.numberInput}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
                placeholder="0.7"
              />
            </View>
          </View>

          {/* Custom Prompt */}
          <View style={styles.section}>
            <View style={styles.customPromptHeader}>
              <Text style={styles.sectionTitle}>Custom System Prompt</Text>
              <Switch
                value={useCustomPrompt}
                onValueChange={setUseCustomPrompt}
              />
            </View>
            
            {useCustomPrompt && (
              <TextInput
                style={styles.textArea}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="Enter your custom system prompt here..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.previewButton} onPress={previewCurrentPrompt}>
              <Text style={styles.buttonText}>👁️ Preview Prompt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testButton} onPress={testConfiguration}>
              <Text style={styles.buttonText}>🧪 Test Config</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
              <Text style={styles.buttonText}>🔄 Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={saveConfiguration}>
              <Text style={styles.buttonText}>💾 Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#2196f3',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  customPromptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#9c27b0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshStatusButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  refreshStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LLMConfigComponent;
