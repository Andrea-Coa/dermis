import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UsageTextDisplayProps {
  usage: string;
}

// Component to render formatted usage instructions
const UsageTextDisplay: React.FC<UsageTextDisplayProps> = ({ usage }) => {
  const formatUsageText = (text: string): React.ReactNode[] => {
    if (!text) return [];
  
    const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim());
  
    return paragraphs.map((paragraph: string, index: number) => {
      const trimmedParagraph = paragraph.trim();
      const isEnumerated = /^\d+\./.test(trimmedParagraph);
  
      if (isEnumerated) {
        const items = trimmedParagraph.split(/\n(?=\d+\.)/).filter((item) => item.trim());
  
        return (
          <View key={index} style={styles.enumeratedList}>
            {items.map((item: string, itemIndex: number) => {
              const cleanItem = item.trim();
              const match = cleanItem.match(/^(\d+\.)\s*(.*)$/s);
  
              if (!match) return null;
  
              const [, number, content] = match;
  
              // Look for sub-items like a., b., etc.
              const subItems = content.split(/\n(?=[a-z]\.\s)/i);
              const mainContent = subItems.shift()?.trim() || '';
  
              return (
                <View key={itemIndex} style={styles.enumeratedItem}>
                  <Text style={styles.enumeratedNumber}>{number}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.enumeratedContent}>{mainContent}</Text>
  
                    {subItems.length > 0 && (
                      <View style={styles.subEnumeratedList}>
                        {subItems.map((sub, subIndex) => {
                          const subMatch = sub.trim().match(/^([a-z]\.)\s*(.*)$/i);
                          if (!subMatch) return null;
                          const [, subLetter, subText] = subMatch;
  
                          return (
                            <View key={subIndex} style={styles.subEnumeratedItem}>
                              <Text style={styles.subEnumeratedLetter}>{subLetter}</Text>
                              <Text style={styles.subEnumeratedContent}>{subText.trim()}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      }
  
      // Bullet list
      const isBulletList = /^[•\-\*]/.test(trimmedParagraph) || trimmedParagraph.includes('\n•') || trimmedParagraph.includes('\n-');
      if (isBulletList) {
        const items = trimmedParagraph.split(/\n(?=[•\-\*])/).filter((item: string) => item.trim());
        return (
          <View key={index} style={styles.bulletList}>
            {items.map((item: string, itemIndex: number) => {
              const cleanItem = item.trim().replace(/^[•\-\*]\s*/, '');
              return (
                <View key={itemIndex} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletContent}>{cleanItem}</Text>
                </View>
              );
            })}
          </View>
        );
      }
  
      // Regular paragraph
      return (
        <Text key={index} style={styles.paragraph}>
          {trimmedParagraph}
        </Text>
      );
    });
  };
  

  const formattedContent = formatUsageText(usage);

  return (
    <View style={styles.container}>
      {formattedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 16,
  },
  enumeratedList: {
    marginBottom: 16,
  },
  enumeratedItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 10,
  },
  enumeratedNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a44230',
    minWidth: 25,
    marginTop: 1,
  },
  enumeratedContent: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
    flex: 1,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#a44230',
    fontWeight: 'bold',
    minWidth: 20,
    marginTop: 1,
  },
  bulletContent: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
    flex: 1,
  },
  subEnumeratedList: {
    marginTop: 4,
    marginLeft: 10, // reduced from 20
  },
  subEnumeratedItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  subEnumeratedLetter: {
    fontSize: 14,
    color: '#a44230',
    fontWeight: 'bold',
    minWidth: 18,  // reduced from 20
  },
  subEnumeratedContent: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
    flex: 1,
  },
  
  
});

export default UsageTextDisplay;