import nlp from 'compromise';

interface Enhancement {
  type: 'grammar' | 'vocabulary' | 'structure' | 'engagement' | 'formatting';
  description: string;
  original: string;
  enhanced: string;
}

class OnDeviceAI {
  // Advanced text enhancement using NLP
  enhanceText(text: string): { enhancedText: string; enhancements: Enhancement[] } {
    const enhancements: Enhancement[] = [];
    let enhanced = text;

    // 1. Grammar and sentence structure improvements
    enhanced = this.improveGrammar(enhanced, enhancements);
    
    // 2. Vocabulary enhancement using NLP
    enhanced = this.enhanceVocabulary(enhanced, enhancements);
    
    // 3. Structure improvements
    enhanced = this.improveStructure(enhanced, enhancements);
    
    // 4. Add engagement elements
    enhanced = this.addEngagement(enhanced, enhancements);
    
    // 5. Format improvements
    enhanced = this.improveFormatting(enhanced, enhancements);

    return { enhancedText: enhanced, enhancements };
  }

  private improveGrammar(text: string, enhancements: Enhancement[]): string {
    let enhanced = text;
    
    // Use compromise.js for grammatical analysis
    const doc = nlp(text);
    
    // Fix common grammar issues
    const sentences = doc.sentences().json();
    let improvedSentences: string[] = [];
    
    sentences.forEach((sentence: any) => {
      let sentenceText = sentence.text;
      const original = sentenceText;
      
      // Improve passive voice to active voice where appropriate
      if (sentenceText.includes(' was ') || sentenceText.includes(' were ')) {
        // Simple passive to active conversion
        sentenceText = sentenceText.replace(/(\w+) was (\w+ed) by/, '$2 $1');
        if (sentenceText !== original) {
          enhancements.push({
            type: 'grammar',
            description: 'Converted passive voice to active voice',
            original,
            enhanced: sentenceText
          });
        }
      }
      
      // Fix sentence fragments
      if (sentenceText.length > 10 && !sentenceText.match(/[.!?]$/)) {
        sentenceText += '.';
      }
      
      // Improve sentence beginnings
      const improvements = [
        { from: /^This is/, to: 'Here we examine' },
        { from: /^There are/, to: 'We find' },
        { from: /^It is/, to: 'This proves' },
        { from: /^I think/, to: 'Evidence suggests' },
        { from: /^In my opinion/, to: 'Research indicates' },
      ];
      
      improvements.forEach(({ from, to }) => {
        if (from.test(sentenceText)) {
          const newSentence = sentenceText.replace(from, to);
          if (newSentence !== sentenceText) {
            enhancements.push({
              type: 'structure',
              description: 'Improved sentence opening',
              original: sentenceText,
              enhanced: newSentence
            });
            sentenceText = newSentence;
          }
        }
      });
      
      improvedSentences.push(sentenceText);
    });
    
    return improvedSentences.join(' ');
  }

  private enhanceVocabulary(text: string, enhancements: Enhancement[]): string {
    let enhanced = text;
    
    // Advanced vocabulary replacements
    const vocabularyMap = [
      // Weak words to strong words
      { weak: /\bvery good\b/gi, strong: 'excellent', desc: 'Replaced weak intensifier' },
      { weak: /\bvery bad\b/gi, strong: 'problematic', desc: 'Replaced weak intensifier' },
      { weak: /\bvery important\b/gi, strong: 'crucial', desc: 'Replaced weak intensifier' },
      { weak: /\bvery interesting\b/gi, strong: 'fascinating', desc: 'Replaced weak intensifier' },
      { weak: /\ba lot of\b/gi, strong: 'numerous', desc: 'Enhanced quantifier' },
      { weak: /\bbig\b/gi, strong: 'substantial', desc: 'Enhanced adjective' },
      { weak: /\bsmall\b/gi, strong: 'minimal', desc: 'Enhanced adjective' },
      { weak: /\bget\b/gi, strong: 'obtain', desc: 'Enhanced verb choice' },
      { weak: /\bmake\b/gi, strong: 'create', desc: 'Enhanced verb choice' },
      { weak: /\bshow\b/gi, strong: 'demonstrate', desc: 'Enhanced verb choice' },
      { weak: /\btell\b/gi, strong: 'indicate', desc: 'Enhanced verb choice' },
      { weak: /\bsay\b/gi, strong: 'express', desc: 'Enhanced verb choice' },
      { weak: /\bthink\b/gi, strong: 'consider', desc: 'Enhanced verb choice' },
      { weak: /\bnice\b/gi, strong: 'appealing', desc: 'Enhanced adjective' },
      { weak: /\bgood\b/gi, strong: 'effective', desc: 'Enhanced adjective' },
      { weak: /\bbad\b/gi, strong: 'ineffective', desc: 'Enhanced adjective' },
    ];

    vocabularyMap.forEach(({ weak, strong, desc }) => {
      const matches = enhanced.match(weak);
      if (matches) {
        const original = enhanced;
        enhanced = enhanced.replace(weak, strong);
        if (enhanced !== original) {
          enhancements.push({
            type: 'vocabulary',
            description: desc,
            original: matches[0],
            enhanced: strong
          });
        }
      }
    });

    return enhanced;
  }

  private improveStructure(text: string, enhancements: Enhancement[]): string {
    let enhanced = text;
    
    // Analyze text structure using NLP
    const doc = nlp(text);
    const sentences = doc.sentences();
    
    // Add transitions between sentences if missing
    if (sentences.length > 2) {
      const transitions = [
        'Furthermore,', 'Additionally,', 'Moreover,', 'In contrast,', 
        'However,', 'Nevertheless,', 'Consequently,', 'Therefore,'
      ];
      
      const sentenceArray = sentences.json().map((s: any) => s.text);
      const improvedSentences = [sentenceArray[0]]; // Keep first sentence as is
      
      for (let i = 1; i < sentenceArray.length; i++) {
        const sentence = sentenceArray[i];
        // Add transition to some sentences (not all to avoid over-enhancement)
        if (i === Math.floor(sentenceArray.length / 2) && sentence.length > 20) {
          const transition = transitions[Math.floor(Math.random() * transitions.length)];
          const enhancedSentence = `${transition} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
          improvedSentences.push(enhancedSentence);
          
          enhancements.push({
            type: 'structure',
            description: 'Added transitional phrase',
            original: sentence,
            enhanced: enhancedSentence
          });
        } else {
          improvedSentences.push(sentence);
        }
      }
      
      enhanced = improvedSentences.join(' ');
    }

    return enhanced;
  }

  private addEngagement(text: string, enhancements: Enhancement[]): string {
    let enhanced = text;
    
    // Add engaging elements
    const hasQuestion = /\?/.test(text);
    const isLongEnough = text.length > 100;
    
    if (isLongEnough && !hasQuestion) {
      // Add an engaging question at the end
      const questions = [
        '\n\nWhat are your thoughts on this perspective?',
        '\n\nHow does this align with your experience?',
        '\n\nWhat additional insights would you add?',
        '\n\nDo you see similar patterns in your field?',
        '\n\nWhat questions does this raise for you?'
      ];
      
      const question = questions[Math.floor(Math.random() * questions.length)];
      enhanced += question;
      
      enhancements.push({
        type: 'engagement',
        description: 'Added engaging question',
        original: text,
        enhanced: enhanced
      });
    }

    return enhanced;
  }

  private improveFormatting(text: string, enhancements: Enhancement[]): string {
    let enhanced = text;
    
    // Improve paragraph structure
    enhanced = enhanced.replace(/\.\s*([A-Z])/g, '.\n\n$1');
    
    // Convert lists to bullet points
    const listPattern = /(\w+),\s*(\w+),?\s*and\s*(\w+)/g;
    const listMatches = enhanced.match(listPattern);
    if (listMatches) {
      enhanced = enhanced.replace(listPattern, (match, item1, item2, item3) => {
        enhancements.push({
          type: 'formatting',
          description: 'Converted list to bullet points',
          original: match,
          enhanced: `• ${item1}\n• ${item2}\n• ${item3}`
        });
        return `• ${item1}\n• ${item2}\n• ${item3}`;
      });
    }
    
    // Clean up extra whitespace
    enhanced = enhanced.replace(/\n\n\n+/g, '\n\n').trim();

    return enhanced;
  }

  // Get summary of enhancements made
  getEnhancementSummary(enhancements: Enhancement[]): string {
    const counts = enhancements.reduce((acc, enhancement) => {
      acc[enhancement.type] = (acc[enhancement.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summary = Object.entries(counts)
      .map(([type, count]) => `${count} ${type} improvement${count > 1 ? 's' : ''}`)
      .join(', ');

    return `Made ${enhancements.length} total improvements: ${summary}`;
  }
}

export const onDeviceAI = new OnDeviceAI();
export type { Enhancement };
