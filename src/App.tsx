import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { TailorStudio } from './components/TailorStudio';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { DailyMotivationBanner } from './components/DailyMotivationBanner';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ShortcutToast } from './components/ShortcutToast';
import { KEYBOARD_SHORTCUTS, triggerShortcutAction } from './utils/shortcutEvents';
import { api } from './services/api';
import { User, UserProfile, JobApplicationRecord } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'tailor' | 'dashboard' | 'profile'>('tailor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [keyCounter, setKeyCounter] = useState(0); // for resetting tailor studio on 'New Tailor'

  useEffect(() => {
    // Initial fetch of user & profile
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      api
        .getProfile()
        .then((p) => setUserProfile(p))
        .catch(() => {
          // fallback
        });
    }
  }, []);

  // Global Keyboard Shortcuts Event Handler
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Escape everywhere
      if (e.key === 'Escape') {
        setShortcutsModalOpen(false);
        setAuthModalOpen(false);
        return;
      }

      // Check Help modal shortcut (? or Cmd/Ctrl + /)
      if (
        (e.key === '?' && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key === '/')
      ) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // If user is actively typing in an input field, only allow Ctrl/Cmd shortcuts
      if (isInput && !(e.metaKey || e.ctrlKey || e.altKey)) {
        return;
      }

      // 1. Generate Current CV and Cover Letter (Ctrl/Cmd + Enter)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        triggerShortcutAction('GENERATE_APPLICATION', 'Generating application & scoring...');
        return;
      }

      // 2. Navigation: Dashboard / Applications (1 or Alt + 1 or Alt + A)
      if ((!isInput && e.key === '1') || (e.altKey && (e.key === '1' || e.key.toLowerCase() === 'a'))) {
        e.preventDefault();
        triggerShortcutAction('NAV_DASHBOARD', 'Switched to Past Applications Dashboard');
        return;
      }

      // 3. Navigation: Tailor Studio (2 or Alt + 2 or Alt + T)
      if ((!isInput && e.key === '2') || (e.altKey && (e.key === '2' || e.key.toLowerCase() === 't'))) {
        e.preventDefault();
        triggerShortcutAction('NAV_TAILOR', 'Switched to Tailor Studio');
        return;
      }

      // 4. Navigation: Profile & Certifications (3 or Alt + 3 or Alt + P)
      if ((!isInput && e.key === '3') || (e.altKey && (e.key === '3' || e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        triggerShortcutAction('NAV_PROFILE', 'Switched to Profile & Certifications');
        return;
      }

      // 5. New Tailoring (Alt + N)
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        triggerShortcutAction('NEW_TAILORING', 'Started new tailoring session');
        return;
      }

      // 6. Highlight Matching Skills (Alt + M or Shift + M when not in input)
      if ((e.altKey && e.key.toLowerCase() === 'm') || (!isInput && e.shiftKey && e.key.toLowerCase() === 'm')) {
        e.preventDefault();
        triggerShortcutAction('HIGHLIGHT_MATCHING_SKILLS', 'Highlighted Matched Skills');
        return;
      }

      // 7. Highlight Missing Skills (Alt + X or Shift + X when not in input)
      if ((e.altKey && e.key.toLowerCase() === 'x') || (!isInput && e.shiftKey && e.key.toLowerCase() === 'x')) {
        e.preventDefault();
        triggerShortcutAction('HIGHLIGHT_MISSING_SKILLS', 'Highlighted Missing Required Skills');
        return;
      }

      // 8. Toggle Documents / Matrix View (Alt + D)
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        triggerShortcutAction('TOGGLE_DOCS_VIEW', 'Toggled Studio View');
        return;
      }

      // 9. Daily Motivation Quote Shortcuts (Alt + Q and Alt + Shift + Q)
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        triggerShortcutAction('OPEN_QUOTES_LIBRARY', 'Opened Motivation Quotes Library');
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        triggerShortcutAction('NEXT_QUOTE', 'Shuffled to Next Motivation Quote');
        return;
      }

      // 10. Toggle Edit Mode in Resume (Ctrl/Cmd + E)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        triggerShortcutAction('TOGGLE_EDIT_MODE', 'Toggled Resume Edit Mode');
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  // Listen for dispatched shortcut actions
  useEffect(() => {
    const handleShortcutExecution = (e: any) => {
      const { actionId, label } = e.detail || {};
      if (!actionId) return;

      if (label) {
        setToastMessage(label);
      }

      switch (actionId) {
        case 'NAV_DASHBOARD':
          setCurrentTab('dashboard');
          break;
        case 'NAV_TAILOR':
          setCurrentTab('tailor');
          break;
        case 'NAV_PROFILE':
          setCurrentTab('profile');
          break;
        case 'NEW_TAILORING':
          handleNewTailoring();
          break;
        case 'SHOW_SHORTCUTS':
          setShortcutsModalOpen(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('tailorfit:shortcut', handleShortcutExecution);
    return () => window.removeEventListener('tailorfit:shortcut', handleShortcutExecution);
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User, profile: UserProfile) => {
    setCurrentUser(user);
    setUserProfile(profile);
  };

  const handleLogout = () => {
    api.setCurrentUser(null);
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentTab('tailor');
  };

  const handleNewTailoring = () => {
    setKeyCounter((prev) => prev + 1);
    setCurrentTab('tailor');
  };

  const handleApplicationSaved = (_app: JobApplicationRecord) => {
    // Optional notification or state update
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onNewTailoring={handleNewTailoring}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {/* Daily Motivation & Purpose Header Section */}
        <DailyMotivationBanner onNotify={(msg) => setToastMessage(msg)} />

        {currentTab === 'tailor' && (
          <TailorStudio
            key={keyCounter}
            userProfile={userProfile}
            onApplicationSaved={handleApplicationSaved}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView onNewApplication={handleNewTailoring} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={currentUser}
            profile={userProfile}
            onProfileUpdated={(up) => setUserProfile(up)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Tailor<span className="text-red-600">Fit</span> AI</span>
            <span>• Intelligent Job Application Tailoring & Resume Scoring</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="hover:text-red-600 cursor-pointer font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Keyboard Shortcuts</span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded border border-slate-200">
                ?
              </kbd>
            </button>
            <span>•</span>
            <p>Powered by Modular ATS Evaluator Engine & Gemini API</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        shortcuts={KEYBOARD_SHORTCUTS}
      />

      {/* Shortcut Execution Feedback Toast */}
      {toastMessage && (
        <ShortcutToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
