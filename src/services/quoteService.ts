import { MotivationalQuote, QuoteSettings, QuoteTopic } from '../types';
import { MOTIVATIONAL_QUOTES } from '../data/motivationalQuotes';

const QUOTE_SETTINGS_KEY = 'tailorfit_quote_settings_v1';
const FAVORITE_QUOTES_KEY = 'tailorfit_favorite_quotes_v1';

export const ALL_QUOTE_TOPICS: QuoteTopic[] = [
  'resilience',
  'action_momentum',
  'purpose_meaning',
  'confidence_worth',
  'calm_peace',
  'career_growth',
  'stoic_wisdom',
];

export interface TimeSlotDetails {
  slotIndex: number;
  totalSlots: number;
  label: string;
  subLabel: string;
  iconName: string;
  timeRange: string;
  targetSlotName: 'morning' | 'evening' | 'any';
}

export const quoteService = {
  getSettings(): QuoteSettings {
    try {
      const stored = localStorage.getItem(QUOTE_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          frequencyPerDay: Math.min(5, Math.max(1, Number(parsed.frequencyPerDay) || 2)),
          selectedTopics:
            Array.isArray(parsed.selectedTopics) && parsed.selectedTopics.length > 0
              ? parsed.selectedTopics
              : ALL_QUOTE_TOPICS,
          autoRotate: parsed.autoRotate ?? true,
          showActionCue: parsed.showActionCue ?? true,
          isBannerCollapsed: parsed.isBannerCollapsed ?? false,
        };
      }
    } catch {
      // ignore
    }
    return {
      frequencyPerDay: 2, // default: 2 times daily (morning & evening)
      selectedTopics: ALL_QUOTE_TOPICS,
      autoRotate: true,
      showActionCue: true,
      isBannerCollapsed: false,
    };
  },

  saveSettings(settings: Partial<QuoteSettings>): QuoteSettings {
    const current = this.getSettings();
    const updated: QuoteSettings = {
      ...current,
      ...settings,
      frequencyPerDay: Math.min(5, Math.max(1, Number(settings.frequencyPerDay ?? current.frequencyPerDay))),
      selectedTopics:
        settings.selectedTopics && settings.selectedTopics.length > 0
          ? settings.selectedTopics
          : current.selectedTopics.length > 0
          ? current.selectedTopics
          : ALL_QUOTE_TOPICS,
    };
    try {
      localStorage.setItem(QUOTE_SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  getCurrentTimeSlot(frequency: number = 2): TimeSlotDetails {
    const now = new Date();
    const currentHour = now.getHours(); // 0 to 23
    const freq = Math.min(5, Math.max(1, frequency));

    if (freq === 1) {
      return {
        slotIndex: 0,
        totalSlots: 1,
        label: 'Daily Spark & Purpose',
        subLabel: 'All-Day Mindset',
        iconName: 'Sun',
        timeRange: 'All Day (24h)',
        targetSlotName: 'any',
      };
    }

    if (freq === 2) {
      // Default: Morning (6am - 6pm) & Evening (6pm - 6am)
      if (currentHour >= 6 && currentHour < 18) {
        return {
          slotIndex: 0,
          totalSlots: 2,
          label: 'Morning Spark & Energy',
          subLabel: 'Dawn to Afternoon',
          iconName: 'Sunrise',
          timeRange: '06:00 - 18:00',
          targetSlotName: 'morning',
        };
      } else {
        return {
          slotIndex: 1,
          totalSlots: 2,
          label: 'Evening Reflection & Calm',
          subLabel: 'Dusk to Rest',
          iconName: 'Sunset',
          timeRange: '18:00 - 06:00',
          targetSlotName: 'evening',
        };
      }
    }

    if (freq === 3) {
      if (currentHour >= 6 && currentHour < 14) {
        return {
          slotIndex: 0,
          totalSlots: 3,
          label: 'Morning Purpose',
          subLabel: 'Start Your Day',
          iconName: 'Sunrise',
          timeRange: '06:00 - 14:00',
          targetSlotName: 'morning',
        };
      } else if (currentHour >= 14 && currentHour < 20) {
        return {
          slotIndex: 1,
          totalSlots: 3,
          label: 'Afternoon Momentum',
          subLabel: 'Stay The Course',
          iconName: 'Sun',
          timeRange: '14:00 - 20:00',
          targetSlotName: 'any',
        };
      } else {
        return {
          slotIndex: 2,
          totalSlots: 3,
          label: 'Night Peace & Recovery',
          subLabel: 'Unwind & Recharge',
          iconName: 'Moon',
          timeRange: '20:00 - 06:00',
          targetSlotName: 'evening',
        };
      }
    }

    if (freq === 4) {
      if (currentHour >= 6 && currentHour < 12) {
        return {
          slotIndex: 0,
          totalSlots: 4,
          label: 'Morning Clarity',
          subLabel: 'Ignition',
          iconName: 'Sunrise',
          timeRange: '06:00 - 12:00',
          targetSlotName: 'morning',
        };
      } else if (currentHour >= 12 && currentHour < 17) {
        return {
          slotIndex: 1,
          totalSlots: 4,
          label: 'Midday Action',
          subLabel: 'Execution',
          iconName: 'Zap',
          timeRange: '12:00 - 17:00',
          targetSlotName: 'any',
        };
      } else if (currentHour >= 17 && currentHour < 21) {
        return {
          slotIndex: 2,
          totalSlots: 4,
          label: 'Evening Reflection',
          subLabel: 'Progress Check',
          iconName: 'Sunset',
          timeRange: '17:00 - 21:00',
          targetSlotName: 'evening',
        };
      } else {
        return {
          slotIndex: 3,
          totalSlots: 4,
          label: 'Night Grounding',
          subLabel: 'Rest & Resilience',
          iconName: 'Moon',
          timeRange: '21:00 - 06:00',
          targetSlotName: 'evening',
        };
      }
    }

    // 5 times daily
    if (currentHour >= 6 && currentHour < 10) {
      return {
        slotIndex: 0,
        totalSlots: 5,
        label: 'Dawn Drive & Courage',
        subLabel: 'Morning Kickoff',
        iconName: 'Sunrise',
        timeRange: '06:00 - 10:00',
        targetSlotName: 'morning',
      };
    } else if (currentHour >= 10 && currentHour < 14) {
      return {
        slotIndex: 1,
        totalSlots: 5,
        label: 'Midday Focus & Grit',
        subLabel: 'Peak Execution',
        iconName: 'Zap',
        timeRange: '10:00 - 14:00',
        targetSlotName: 'any',
      };
    } else if (currentHour >= 14 && currentHour < 18) {
      return {
        slotIndex: 2,
        totalSlots: 5,
        label: 'Afternoon Breakthrough',
        subLabel: 'Second Wind',
        iconName: 'Sun',
        timeRange: '14:00 - 18:00',
        targetSlotName: 'any',
      };
    } else if (currentHour >= 18 && currentHour < 22) {
      return {
        slotIndex: 3,
        totalSlots: 5,
        label: 'Twilight Perspective',
        subLabel: 'Gratitude & Balance',
        iconName: 'Sunset',
        timeRange: '18:00 - 22:00',
        targetSlotName: 'evening',
      };
    } else {
      return {
        slotIndex: 4,
        totalSlots: 5,
        label: 'Night Serenity & Sleep',
        subLabel: 'Peace of Mind',
        iconName: 'Moon',
        timeRange: '22:00 - 06:00',
        targetSlotName: 'evening',
      };
    }
  },

  getAllQuotes(): MotivationalQuote[] {
    return MOTIVATIONAL_QUOTES;
  },

  getFilteredQuotes(topics: QuoteTopic[]): MotivationalQuote[] {
    if (!topics || topics.length === 0) return MOTIVATIONAL_QUOTES;
    const filtered = MOTIVATIONAL_QUOTES.filter((q) => topics.includes(q.topic));
    return filtered.length > 0 ? filtered : MOTIVATIONAL_QUOTES;
  },

  getActiveQuote(settings?: QuoteSettings, manualOffset: number = 0): {
    quote: MotivationalQuote;
    slot: TimeSlotDetails;
  } {
    const config = settings || this.getSettings();
    const slot = this.getCurrentTimeSlot(config.frequencyPerDay);
    const candidateQuotes = this.getFilteredQuotes(config.selectedTopics);

    // Calculate deterministic day seed
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const seed = now.getFullYear() * 1000 + dayOfYear;

    // Deterministic index per slot and day, plus user manual offset
    const index = Math.abs((seed * 7 + slot.slotIndex * 13 + manualOffset) % candidateQuotes.length);
    const quote = candidateQuotes[index] || candidateQuotes[0];

    return { quote, slot };
  },

  getFavoriteQuoteIds(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITE_QUOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleFavoriteQuote(id: string): string[] {
    const current = this.getFavoriteQuoteIds();
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      localStorage.setItem(FAVORITE_QUOTES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  formatQuotesAsText(quotes: MotivationalQuote[], title: string = 'TailorFit AI — Daily Motivation & Purpose Collection'): string {
    const now = new Date();
    const lines: string[] = [
      '======================================================================',
      `  ${title.toUpperCase()}`,
      `  Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      `  Total Quotes: ${quotes.length}`,
      '======================================================================\n',
    ];

    quotes.forEach((q, idx) => {
      lines.push(`[#${idx + 1}] ${q.categoryLabel.toUpperCase()}`);
      lines.push(`"${q.text}"`);
      lines.push(`— ${q.author}`);
      if (q.actionCue) {
        lines.push(`⚡ Action Oriented Micro-Cue: ${q.actionCue}`);
      }
      lines.push('----------------------------------------------------------------------\n');
    });

    lines.push('💡 Tip: Keep taking daily small steps. Your consistency will open the right door.');
    lines.push('Generated by TailorFit AI — https://ai.studio/build');

    return lines.join('\n');
  },

  downloadQuotesAsTextFile(quotes: MotivationalQuote[], filename: string = 'tailorfit-motivation-quotes.txt') {
    const textContent = this.formatQuotesAsText(quotes);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  async copyQuotesToClipboard(quotes: MotivationalQuote[]): Promise<boolean> {
    try {
      const textContent = this.formatQuotesAsText(quotes);
      await navigator.clipboard.writeText(textContent);
      return true;
    } catch {
      return false;
    }
  },
};
