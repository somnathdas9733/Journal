export type MoodType = 
  | 'reflective' 
  | 'clarity' 
  | 'deep-focus' 
  | 'creative' 
  | 'peaceful' 
  | 'gratitude' 
  | 'anxious' 
  | 'breakthrough';

export interface MoodConfig {
  id: MoodType;
  label: string;
  color: string;
  bgGlow: string;
  iconName: string;
  badgeClass: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  aiInsights?: {
    summary?: string;
    reflectionQuestion?: string;
    sentimentScore?: number;
    actionItem?: string;
    keywords?: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedEntryId?: string;
}

export interface BrainstormIdea {
  id: string;
  title: string;
  description: string;
  category?: string;
  actionableStep?: string;
}

export interface BrainstormBoard {
  id: string;
  topic: string;
  framework: 'first-principles' | 'scamper' | 'six-hats' | 'mind-matrix' | 'pros-cons';
  ideas: BrainstormIdea[];
  summary?: string;
  createdAt: string;
}

export interface JournalPrompt {
  id: string;
  category: 'Clarity' | 'Mindset' | 'Brainstorming' | 'Deep Work' | 'Emotional Release' | 'Vision';
  text: string;
  subtext: string;
}

export interface JournalStats {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  moodCounts: Record<MoodType, number>;
  topTags: Array<{ tag: string; count: number }>;
}
