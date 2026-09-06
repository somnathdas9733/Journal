import { JournalEntry, BrainstormBoard, ChatMessage, MoodType } from '../types';

/**
 * Strips all undefined properties recursively from an object to guarantee clean payload hygiene.
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

const STORAGE_KEYS = {
  ENTRIES: 'paradigm_journal_entries_v1',
  BRAINSTORM: 'paradigm_journal_brainstorm_v1',
  CHAT_MESSAGES: 'paradigm_journal_chat_v1',
  THEME_PREF: 'paradigm_journal_theme_v1'
};

const DEFAULT_SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-seed-1',
    title: 'Designing the architecture of the mind',
    content: `Today I sat down to break down our core assumptions around mental focus. In high-output engineering and creative systems, friction rarely comes from lack of motivation—it stems from cognitive overload and undefined decision trees.

Key observation: When I write in structured bullet points followed by unconstrained prose, the signal-to-noise ratio improves dramatically.

Next step:
- Test 90-minute deep work blocks with zero notifications.
- Revisit our low-code orchestration pipeline with the team.`,
    mood: 'deep-focus',
    tags: ['Architecture', 'Productivity', 'Systems'],
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    aiInsights: {
      summary: 'Deep dive into cognitive friction and structured decision-making protocols.',
      reflectionQuestion: 'What is the single highest-leverage decision tree you can automate this week?',
      sentimentScore: 0.88,
      actionItem: 'Execute 90-min uninterrupted block tomorrow morning.',
      keywords: ['Architecture', 'Focus', 'Systems Thinking']
    }
  },
  {
    id: 'entry-seed-2',
    title: 'Breakthrough on async execution pipeline',
    content: `Finally solved the event propagation bottleneck. By decoupling state mutation from canvas rendering and establishing a clean fallback ladder, the UI response latency dropped to near-instantaneous.

Grateful for the breakthrough. The key was stepping away for a walk to let my subconscious process the graph dependencies rather than brute-forcing the debugger.`,
    mood: 'breakthrough',
    tags: ['Breakthrough', 'Engineering', 'Mindset'],
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    aiInsights: {
      summary: 'Technical breakthrough enabled by deliberate mental diffuse mode thinking.',
      reflectionQuestion: 'How can you deliberately build walks or diffuse thinking time into your problem-solving sprints?',
      sentimentScore: 0.94,
      actionItem: 'Document the decoupling pattern for future reference.',
      keywords: ['Latency', 'Diffuse Thinking', 'Architecture']
    }
  }
];

export function loadStoredEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      saveStoredEntries(DEFAULT_SAMPLE_ENTRIES);
      return DEFAULT_SAMPLE_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAMPLE_ENTRIES;
  } catch (error) {
    console.error('Failed to load stored entries:', error);
    return DEFAULT_SAMPLE_ENTRIES;
  }
}

export function saveStoredEntries(entries: JournalEntry[]): boolean {
  try {
    const sanitized = sanitizePayload(entries);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Failed to save entries to localStorage:', error);
    throw new Error('Persistence write failure. Local storage capacity may be exceeded.');
  }
}

export function loadStoredBrainstorms(): BrainstormBoard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRAINSTORM);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load brainstorm boards:', error);
    return [];
  }
}

export function saveStoredBrainstorms(boards: BrainstormBoard[]): boolean {
  try {
    const sanitized = sanitizePayload(boards);
    localStorage.setItem(STORAGE_KEYS.BRAINSTORM, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Failed to save brainstorms:', error);
    throw new Error('Failed to persist brainstorm board.');
  }
}

export function loadStoredChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function saveStoredChatMessages(messages: ChatMessage[]): boolean {
  try {
    const sanitized = sanitizePayload(messages);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Failed to save chat messages:', error);
    return false;
  }
}
