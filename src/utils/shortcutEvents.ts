export interface ShortcutDefinition {
  category: 'Navigation' | 'Application Tailoring' | 'Skills & Gap Analysis' | 'Document Studio' | 'Daily Motivation & Mindset' | 'System & Modals';
  keys: string[];
  description: string;
  actionId: string;
  badge?: string;
  id: string;
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'view_shortcuts',
    category: 'System & Modals',
    keys: ['?'],
    description: 'View all keyboard shortcuts & help cheat sheet',
    actionId: 'TOGGLE_SHORTCUTS_MODAL',
    badge: 'Universal',
  },
  {
    id: 'view_shortcuts_cmd',
    category: 'System & Modals',
    keys: ['Ctrl / ⌘', '/'],
    description: 'Quick open shortcuts modal',
    actionId: 'TOGGLE_SHORTCUTS_MODAL',
  },
  {
    id: 'list_past_applications',
    category: 'Navigation',
    keys: ['Alt', 'A'],
    description: 'List past applications & review dashboard history',
    actionId: 'NAV_DASHBOARD',
    badge: 'Requested Case',
  },
  {
    id: 'nav_tailor',
    category: 'Navigation',
    keys: ['Alt', 'T'],
    description: 'Go to Tailor Application studio',
    actionId: 'NAV_TAILOR',
  },
  {
    id: 'nav_profile',
    category: 'Navigation',
    keys: ['Alt', 'P'],
    description: 'Go to Career Profile & Certifications',
    actionId: 'NAV_PROFILE',
  },
  {
    id: 'generate_current_application',
    category: 'Application Tailoring',
    keys: ['Ctrl / ⌘', 'Enter'],
    description: 'Generate tailored CV & Cover Letter for current job listing',
    actionId: 'GENERATE_APPLICATION',
    badge: 'Requested Case',
  },
  {
    id: 'new_application_tailor',
    category: 'Application Tailoring',
    keys: ['Alt', 'N'],
    description: 'Start a new job application tailoring workflow',
    actionId: 'NEW_TAILORING',
  },
  {
    id: 'next_motivation_quote',
    category: 'Daily Motivation & Mindset',
    keys: ['Alt', 'Q'],
    description: 'Shuffle to next positive motivation quote',
    actionId: 'NEXT_QUOTE',
  },
  {
    id: 'view_all_quotes',
    category: 'Daily Motivation & Mindset',
    keys: ['Alt', 'Shift', 'Q'],
    description: 'Open full motivation quotes library and text export',
    actionId: 'OPEN_QUOTES_LIBRARY',
  },
  {
    id: 'highlight_matching_skills',
    category: 'Skills & Gap Analysis',
    keys: ['Alt', 'M'],
    description: 'Highlight and filter matching candidate skills',
    actionId: 'HIGHLIGHT_MATCHING_SKILLS',
    badge: 'Requested Case',
  },
  {
    id: 'highlight_missing_skills',
    category: 'Skills & Gap Analysis',
    keys: ['Alt', 'X'],
    description: 'Highlight and filter critical missing skills & gaps',
    actionId: 'HIGHLIGHT_MISSING_SKILLS',
    badge: 'Requested Case',
  },
  {
    id: 'toggle_all_skills',
    category: 'Skills & Gap Analysis',
    keys: ['Alt', 'S'],
    description: 'Show all evaluated skills in decision matrix',
    actionId: 'SHOW_ALL_SKILLS',
  },
  {
    id: 'toggle_tailored_docs',
    category: 'Document Studio',
    keys: ['Alt', 'D'],
    description: 'Switch between Match Decision Center and Tailored Documents',
    actionId: 'TOGGLE_DOCS_VIEW',
  },
  {
    id: 'toggle_resume_edit',
    category: 'Document Studio',
    keys: ['Ctrl / ⌘', 'E'],
    description: 'Toggle inline edit mode for Tailored Resume',
    actionId: 'TOGGLE_EDIT_MODE',
  },
  {
    id: 'close_modals',
    category: 'System & Modals',
    keys: ['Esc'],
    description: 'Close active modal, proof lightbox, or reset focus',
    actionId: 'CLOSE_MODALS',
  },
];

// Helper to broadcast keyboard events
export const triggerShortcutAction = (actionId: string, payload?: any) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tailorfit:shortcut', {
        detail: { actionId, payload },
      })
    );
  }
};
