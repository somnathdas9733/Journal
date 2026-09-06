import React, { useState, useEffect, useCallback } from 'react';
import { 
  JournalEntry, 
  BrainstormBoard, 
  ChatMessage, 
  JournalPrompt 
} from './types';
import { 
  fetchUserEntries, 
  saveUserEntry, 
  deleteUserEntry, 
  fetchUserChats, 
  saveUserChat, 
  clearUserChats, 
  fetchUserBrainstorms, 
  saveUserBrainstorm, 
  deleteUserBrainstorm 
} from './lib/firestoreService';
import { AuthProvider, useAuth, AppUser } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { JournalHero } from './components/JournalHero';
import { JournalEditor } from './components/JournalEditor';
import { EntryList } from './components/EntryList';
import { AIChatView } from './components/AIChatView';
import { BrainstormCanvas } from './components/BrainstormCanvas';
import { PromptGenerator } from './components/PromptGenerator';
import { AnalyticsView } from './components/AnalyticsView';
import { FloatingAIWidget } from './components/FloatingAIWidget';
import { ToastContainer, ToastMessage } from './components/Toast';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080e] flex flex-col items-center justify-center text-slate-300">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-2xl shadow-cyan-500/20 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs font-mono text-cyan-300/80 uppercase tracking-widest flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Authenticating Session...</span>
        </p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <PrivateDashboard user={user} />;
}

function PrivateDashboard({ user }: { user: AppUser }) {
  const [activeTab, setActiveTab] = useState<'entries' | 'editor' | 'brainstorm' | 'chat' | 'prompts' | 'analytics'>('entries');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEditingEntry, setActiveEditingEntry] = useState<JournalEntry | null>(null);
  const [chatContextEntry, setChatContextEntry] = useState<JournalEntry | null>(null);
  const [brainstorms, setBrainstorms] = useState<BrainstormBoard[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Initialize data on mount or when user changes
  useEffect(() => {
    let isSubscribed = true;

    async function loadUserData() {
      setIsDataLoading(true);
      try {
        const [loadedEntries, loadedBoards, loadedChats] = await Promise.all([
          fetchUserEntries(user.uid, user.isDemo),
          fetchUserBrainstorms(user.uid, user.isDemo),
          fetchUserChats(user.uid, user.isDemo),
        ]);

        if (isSubscribed) {
          setEntries(loadedEntries);
          setBrainstorms(loadedBoards);
          setChatMessages(loadedChats);
        }
      } catch (err) {
        console.error('Failed to load user records from Firestore:', err);
      } finally {
        if (isSubscribed) {
          setIsDataLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isSubscribed = false;
    };
  }, [user.uid, user.isDemo]);

  // Toast management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Save Entry handler with strict Firestore isolation
  const handleSaveEntry = async (entryToSave: JournalEntry) => {
    try {
      const existingIdx = entries.findIndex((e) => e.id === entryToSave.id);
      let updatedList: JournalEntry[];

      if (existingIdx >= 0) {
        updatedList = entries.map((e) => (e.id === entryToSave.id ? entryToSave : e));
      } else {
        updatedList = [entryToSave, ...entries];
      }

      await saveUserEntry(user.uid, entryToSave, user.isDemo);
      setEntries(updatedList);
      setActiveEditingEntry(null);
      setActiveTab('entries');

      addToast({
        type: 'success',
        title: 'Reflection Saved to Cloud Firestore',
        message: `"${entryToSave.title}" has been safely archived to your account.`,
      });
    } catch (err: any) {
      console.error('Save failed:', err);
      addToast({
        type: 'error',
        title: 'Cloud Persistence Failure',
        message: err?.message || 'Could not write reflection to storage.',
        actionLabel: 'Retry Save',
        onAction: () => handleSaveEntry(entryToSave),
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteUserEntry(user.uid, id, user.isDemo);
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      addToast({
        type: 'info',
        title: 'Entry Deleted',
        message: 'The reflection was removed from your archive.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.message || 'Could not delete entry.',
      });
    }
  };

  // Start a new blank entry
  const handleStartNewEntry = (initialTitle?: string, initialContent?: string) => {
    setActiveEditingEntry(
      initialTitle || initialContent
        ? {
            id: `entry-${Date.now()}`,
            title: initialTitle || '',
            content: initialContent || '',
            mood: 'deep-focus',
            tags: ['Focus'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : null
    );
    setActiveTab('editor');
  };

  // AI Chat discussion regarding a specific entry
  const handleChatAboutEntry = (entry: JournalEntry) => {
    setChatContextEntry(entry);
    setActiveTab('chat');
  };

  // Safe API helper that parses errors gracefully without throwing JSON syntax errors
  const safeApiCall = async <T = any,>(url: string, payload: any): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMessage = `Request failed with status ${res.status}`;
      try {
        const errData = await res.json();
        errMessage = errData.error || errMessage;
      } catch {
        const text = await res.text();
        if (text) errMessage = text;
      }
      throw new Error(errMessage);
    }

    return res.json();
  };

  // AI Chat message sender (multi-turn conversation with Firestore persistence)
  const handleSendChatMessage = async (text: string, persona: string = 'reflective', context?: string) => {
    if (!text.trim() || !user) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      relatedEntryId: chatContextEntry?.id,
    };

    const updatedWithUser = [...chatMessages, userMsg];
    setChatMessages(updatedWithUser);
    await saveUserChat(user.uid, userMsg, user.isDemo);

    try {
      const data = await safeApiCall<{ reply: string }>('/api/ai/chat', {
        message: text,
        history: chatMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        context: context || '',
        persona,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      setChatMessages(finalMessages);
      await saveUserChat(user.uid, assistantMsg, user.isDemo);
    } catch (err: any) {
      console.error('Chat error:', err);
      addToast({
        type: 'error',
        title: 'Reflection Error',
        message: err?.message || 'Unable to connect with AI model ladder.',
      });
    }
  };

  // Generate Brainstorm Board
  const handleGenerateBrainstorm = async (topic: string, framework: string): Promise<BrainstormBoard | null> => {
    try {
      const json = await safeApiCall<{ data?: any }>('/api/ai/brainstorm', { topic, framework });

      const newBoard: BrainstormBoard = {
        id: `board-${Date.now()}`,
        topic,
        framework: framework as any,
        ideas: json.data?.ideas || [],
        summary: json.data?.summary || '',
        createdAt: new Date().toISOString(),
      };

      const updatedBoards = [newBoard, ...brainstorms];
      await saveUserBrainstorm(user.uid, newBoard, user.isDemo);
      setBrainstorms(updatedBoards);

      addToast({
        type: 'success',
        title: 'Brainstorm Matrix Generated',
        message: `Deconstructed "${topic}" into ${newBoard.ideas.length} strategic angles.`,
      });

      return newBoard;
    } catch (err: any) {
      console.error('Brainstorm failed:', err);
      addToast({
        type: 'error',
        title: 'Brainstorming Failed',
        message: err?.message || 'Check connection or model key status.',
      });
      return null;
    }
  };

  const handleDeleteBrainstorm = async (id: string) => {
    await deleteUserBrainstorm(user.uid, id, user.isDemo);
    const updated = brainstorms.filter((b) => b.id !== id);
    setBrainstorms(updated);
  };

  // Expand thought with AI
  const handleExpandThought = async (rawThought: string): Promise<string> => {
    try {
      const data = await safeApiCall<{ expandedText?: string }>('/api/ai/expand-thought', { rawThought });
      return data.expandedText || rawThought;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Expansion Failed',
        message: err?.message || 'Could not expand thought.',
      });
      return rawThought;
    }
  };

  // Analyze entry with AI
  const handleAnalyzeAi = async (title: string, content: string) => {
    try {
      const data = await safeApiCall<{ analysis?: any }>('/api/ai/analyze-entry', { title, content });
      return data.analysis;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Analysis Error',
        message: err?.message || 'Failed to analyze entry.',
      });
      return null;
    }
  };

  // Generate dynamic AI prompts
  const handleGenerateAiPrompts = async (mood: string, focus: string): Promise<JournalPrompt[]> => {
    try {
      const data = await safeApiCall<{ prompts?: JournalPrompt[] }>('/api/ai/prompts', { mood, focusArea: focus });
      return data.prompts || [];
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Prompt Generation Failed',
        message: err?.message || 'Unable to generate fresh inquiries.',
      });
      return [];
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    try {
      const payload = {
        user: { uid: user.uid, email: user.email, displayName: user.displayName },
        exportedAt: new Date().toISOString(),
        version: '2.0',
        entries,
        brainstorms,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paradigm-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Backup Exported',
        message: 'Your journal archive and brainstorms were exported safely.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err?.message || 'Could not generate backup file.',
      });
    }
  };

  // Journaling on a specific prompt
  const handleSelectPrompt = (prompt: JournalPrompt) => {
    handleStartNewEntry(
      `Inquiry: ${prompt.text}`,
      `> **${prompt.text}**\n> *${prompt.subtext}*\n\n`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05080e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Alert System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Navbar with User Profile & Sign Out */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'editor') setActiveEditingEntry(null);
          setActiveTab(tab);
        }}
        onNewEntry={() => handleStartNewEntry()}
        onExportData={handleExportData}
        entryCount={entries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {isDataLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
            <span className="text-xs font-mono text-cyan-300">Retrieving Firestore documents...</span>
          </div>
        ) : (
          <>
            {/* Render Views */}
            {activeTab === 'entries' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Hero Showcase */}
                <JournalHero
                  onStartChat={() => setActiveTab('chat')}
                  onNewEntry={() => handleStartNewEntry()}
                  onOpenBrainstorm={() => setActiveTab('brainstorm')}
                  onOpenPrompts={() => setActiveTab('prompts')}
                  entryCount={entries.length}
                />

                {/* List of Entries */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
                      <span>Reflection Archive</span>
                      <span className="text-xs font-mono font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                        {entries.length} records
                      </span>
                    </h2>
                  </div>
                  <EntryList
                    entries={entries}
                    onSelectEntry={(e) => {
                      setActiveEditingEntry(e);
                      setActiveTab('editor');
                    }}
                    onDeleteEntry={handleDeleteEntry}
                    onNewEntry={() => handleStartNewEntry()}
                    onChatAboutEntry={handleChatAboutEntry}
                  />
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="animate-in fade-in duration-300">
                <JournalEditor
                  initialEntry={activeEditingEntry}
                  onSave={handleSaveEntry}
                  onCancel={() => {
                    setActiveEditingEntry(null);
                    setActiveTab('entries');
                  }}
                  onAnalyzeAi={handleAnalyzeAi}
                  onExpandThought={handleExpandThought}
                />
              </div>
            )}

            {activeTab === 'brainstorm' && (
              <div className="animate-in fade-in duration-300">
                <BrainstormCanvas
                  boards={brainstorms}
                  onGenerateBoard={handleGenerateBrainstorm}
                  onSaveToJournal={(title, content) => handleStartNewEntry(title, content)}
                  onDeleteBoard={handleDeleteBrainstorm}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="animate-in fade-in duration-300">
                <AIChatView
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  onSaveAsEntry={(title, content) => handleStartNewEntry(title, content)}
                  onClearHistory={async () => {
                    await clearUserChats(user.uid, user.isDemo);
                    setChatMessages([]);
                    addToast({
                      type: 'info',
                      title: 'Chat History Cleared',
                      message: 'Your reflection dialogue has been reset in Cloud Firestore.',
                    });
                  }}
                  recentEntries={entries}
                  activeEntryContext={chatContextEntry}
                  onClearContext={() => setChatContextEntry(null)}
                />
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="animate-in fade-in duration-300">
                <PromptGenerator
                  onSelectPrompt={handleSelectPrompt}
                  onGenerateAiPrompts={handleGenerateAiPrompts}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-in fade-in duration-300">
                <AnalyticsView entries={entries} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating AI Companion Widget */}
      {activeTab !== 'chat' && !isDataLoading && (
        <FloatingAIWidget
          onOpenFullChat={() => setActiveTab('chat')}
          recentContext={
            entries.length > 0
              ? `Recent entry: ${entries[0].title} - ${entries[0].content.slice(0, 300)}`
              : ''
          }
          onSavedAsEntry={(title, content) => handleStartNewEntry(title, content)}
        />
      )}

      {/* Subtle Footer */}
      <footer className="border-t border-white/8 bg-[#05080e]/90 backdrop-blur-xl py-8 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span>Paradigm Cognitive Journal • Powered by Gemini 3.6 Flash & Cloud Firestore</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>User Isolated ({user.email || user.uid})</span>
            <span>•</span>
            <span>Firestore Document Store</span>
            <span>•</span>
            <span>Socratic AI Ladder</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
