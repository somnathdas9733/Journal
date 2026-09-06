import { MoodConfig, MoodType, JournalPrompt } from '../types';

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  'deep-focus': {
    id: 'deep-focus',
    label: 'Deep Focus',
    color: '#00e5ff',
    bgGlow: 'rgba(0, 229, 255, 0.15)',
    iconName: 'Target',
    badgeClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50',
  },
  'clarity': {
    id: 'clarity',
    label: 'Clarity',
    color: '#38bdf8',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
    iconName: 'Compass',
    badgeClass: 'border-sky-500/40 text-sky-300 bg-sky-950/50',
  },
  'reflective': {
    id: 'reflective',
    label: 'Reflective',
    color: '#a855f7',
    bgGlow: 'rgba(168, 85, 247, 0.15)',
    iconName: 'Moon',
    badgeClass: 'border-purple-500/40 text-purple-300 bg-purple-950/50',
  },
  'creative': {
    id: 'creative',
    label: 'Creative',
    color: '#ec4899',
    bgGlow: 'rgba(236, 72, 153, 0.15)',
    iconName: 'Sparkles',
    badgeClass: 'border-pink-500/40 text-pink-300 bg-pink-950/50',
  },
  'breakthrough': {
    id: 'breakthrough',
    label: 'Breakthrough',
    color: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.15)',
    iconName: 'Zap',
    badgeClass: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50',
  },
  'gratitude': {
    id: 'gratitude',
    label: 'Gratitude',
    color: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
    iconName: 'Heart',
    badgeClass: 'border-amber-500/40 text-amber-300 bg-amber-950/50',
  },
  'peaceful': {
    id: 'peaceful',
    label: 'Peaceful',
    color: '#06b6d4',
    bgGlow: 'rgba(6, 182, 212, 0.15)',
    iconName: 'Feather',
    badgeClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50',
  },
  'anxious': {
    id: 'anxious',
    label: 'Processing / Tension',
    color: '#f43f5e',
    bgGlow: 'rgba(244, 63, 94, 0.15)',
    iconName: 'AlertCircle',
    badgeClass: 'border-rose-500/40 text-rose-300 bg-rose-950/50',
  },
};

export const DEFAULT_PROMPTS: JournalPrompt[] = [
  {
    id: 'prompt-1',
    category: 'Clarity',
    text: 'What is the most important constraint I am currently refusing to acknowledge?',
    subtext: 'Examine timelines, energy reserves, and unstated assumptions.',
  },
  {
    id: 'prompt-2',
    category: 'Brainstorming',
    text: 'If I had to achieve my 6-month goal in the next 14 days, what single lever would I pull?',
    subtext: 'Force extreme prioritization and remove polite hesitation.',
  },
  {
    id: 'prompt-3',
    category: 'Mindset',
    text: 'Where in my life or work am I confusing activity with leverage?',
    subtext: 'Identify busywork disguising a difficult decision.',
  },
  {
    id: 'prompt-4',
    category: 'Deep Work',
    text: 'What problem, if solved completely today, makes 5 other ongoing problems irrelevant?',
    subtext: 'Find root causes rather than tending to peripheral symptoms.',
  },
  {
    id: 'prompt-5',
    category: 'Emotional Release',
    text: 'What feeling or tension have I been carrying since this morning, and what is its message?',
    subtext: 'Allow space for sensation without rushing to analyze or judge.',
  },
  {
    id: 'prompt-6',
    category: 'Vision',
    text: 'What would the highest-clarity version of myself do in the next 3 hours?',
    subtext: 'Step outside the immediate cognitive noise and orchestrate.',
  },
];

export const BRAINSTORM_FRAMEWORKS = [
  {
    id: 'first-principles',
    name: 'First Principles Rebuild',
    description: 'Deconstruct down to fundamental atomic truths and rebuild solutions.',
    icon: 'Layers',
  },
  {
    id: 'scamper',
    name: 'SCAMPER Catalyst',
    description: 'Substitute, combine, adapt, modify, repurpose, eliminate, or invert.',
    icon: 'Shuffle',
  },
  {
    id: 'six-hats',
    name: 'Six Perspectives Matrix',
    description: 'Explore through logic, emotions, caution, optimism, and lateral creativity.',
    icon: 'Eye',
  },
  {
    id: 'mind-matrix',
    name: 'Impact vs Effort Quad',
    description: 'Map high-leverage quick wins, architectural foundations, and radical bets.',
    icon: 'Grid',
  },
  {
    id: 'pros-cons',
    name: 'Second-Order Trade-offs',
    description: 'Uncover hidden assumptions, second-order consequences, and opportunity costs.',
    icon: 'Scale',
  },
];
