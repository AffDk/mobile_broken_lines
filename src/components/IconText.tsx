import React from 'react';
import { Text, TextStyle } from 'react-native';

interface IconTextProps {
  name: string;
  size: number;
  color: string;
  style?: TextStyle;
}

// Map of icon names to text/emoji representations
const iconMap: { [key: string]: string } = {
  // Navigation icons
  'home': '🏠',
  'person': '👤',
  'add-circle-outline': '➕',
  'create': '✏️',
  
  // Action icons
  'edit': '✏️',
  'delete': '🗑️',
  'save': '💾',
  'publish': '📤',
  'share': '↗️',
  'refresh': '🔄',
  'logout': '🚪',
  'close': '✕',
  'clear': '✕',
  'clear-all': '🗑️',
  
  // Content icons
  'article': '📄',
  'auto-awesome': '✨',
  'info': 'ℹ️',
  
  // Navigation arrows
  'chevron-left': '‹',
  'chevron-right': '›',
  
  // Default
  'circle': '●',
};

export const IconText: React.FC<IconTextProps> = ({ name, size, color, style }) => {
  const iconText = iconMap[name] || '●';
  
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          textAlign: 'center',
          lineHeight: size + 2,
        },
        style,
      ]}
    >
      {iconText}
    </Text>
  );
};

export default IconText;
