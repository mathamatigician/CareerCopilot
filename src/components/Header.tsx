import React from 'react';
import {
  Sparkles,
  FileText,
  LayoutDashboard,
  User as UserIcon,
  LogIn,
  LogOut,
  PlusCircle,
  Keyboard,
  CreditCard,
  Zap,
  Infinity as InfinityIcon,
  Crown,
} from 'lucide-react';
import { User, UserSubscription } from '../types';

interface HeaderProps {
  currentTab: 'tailor' | 'dashboard' | 'profile' | 'pricing';
  onTabChange: (tab: 'tailor' | 'dashboard' | 'profile' | 'pricing') => void;
  currentUser: User | null;
  userSubscription?: UserSubscription | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onLogout: () => void;
  onNewTailoring: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  userSubscription,
  onOpenAuth,
  onLogout,
  onNewTailoring,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => onTabChange('tailor')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">Tailor<span className="text-red-600">Fit</span></span>
                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">AI</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Job Application & Match Engine</p>
              </div>
            </button>

            {/* Navigation Tabs with Shortcut Hints */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onTabChange('tailor')}
                id="nav-tailor-btn"
                title="Tailor Application (Alt + T)"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'tailor'
                    ? 'bg-red-50 text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Tailor Application</span>
              </button>

              <button
                onClick={() => onTabChange('dashboard')}
                id="nav-dashboard-btn"
                title="List Past Applications & Dashboard (Alt + A)"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-red-50 text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-rose-600" />
                <span>Past Applications</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
                  Alt+A
                </kbd>
              </button>

              <button
                onClick={() => onTabChange('profile')}
                id="nav-profile-btn"
                title="Career Profile & Credentials (Alt + P)"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-red-50 text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserIcon className="w-4 h-4 text-rose-600" />
                <span>Career Profile</span>
              </button>

              <button
                onClick={() => onTabChange('pricing')}
                id="nav-pricing-btn"
                title="Pricing & Subscription Plans (Alt + S)"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'pricing'
                    ? 'bg-red-50 text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>Pricing</span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-100 text-amber-900 border border-amber-300">
                  ₹50+
                </span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
                  Alt+S
                </kbd>
              </button>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Subscription Credits Indicator / Upgrade Button */}
            {userSubscription && (
              <button
                onClick={() => onTabChange('pricing')}
                title="View Subscription & Remaining Free Samples (Alt + S)"
                id="header-subscription-badge-btn"
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  userSubscription.isUnlimited || userSubscription.planId === 'lifetime'
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900 hover:border-amber-300'
                    : userSubscription.samplesUsed >= userSubscription.samplesLimit
                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                }`}
              >
                {userSubscription.planId === 'lifetime' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lifetime Pro</span>
                  </>
                ) : userSubscription.isUnlimited ? (
                  <>
                    <InfinityIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlimited Pro</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-red-600" />
                    <span>
                      {Math.max(0, userSubscription.samplesLimit - userSubscription.samplesUsed)} / {userSubscription.samplesLimit} Samples
                    </span>
                    <span className="text-[10px] text-red-600 font-extrabold ml-0.5 bg-white px-1.5 py-0.2 rounded border border-red-200">
                      Upgrade
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={onOpenShortcuts}
              id="open-keyboard-shortcuts-btn"
              title="View all keyboard shortcuts (?)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50/70 border border-slate-200 transition-all cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-600" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold border border-slate-200">
                ?
              </kbd>
            </button>

            <button
              onClick={onNewTailoring}
              id="new-tailoring-header-btn"
              title="New Job Tailor (Alt + N)"
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-red-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Tailor</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  onClick={() => onTabChange('profile')}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center border border-red-200 group-hover:ring-2 group-hover:ring-red-400 transition-all">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name || currentUser.username}</p>
                    <p className="text-[10px] text-slate-500 font-medium">@{currentUser.username}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  id="logout-btn"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  id="signin-header-btn"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  id="signup-header-btn"
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => onTabChange('tailor')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${currentTab === 'tailor' ? 'text-red-600 bg-red-50 font-bold' : 'text-slate-600'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailor</span>
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${currentTab === 'dashboard' ? 'text-red-600 bg-red-50 font-bold' : 'text-slate-600'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${currentTab === 'profile' ? 'text-red-600 bg-red-50 font-bold' : 'text-slate-600'}`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => onTabChange('pricing')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-md ${currentTab === 'pricing' ? 'text-red-600 bg-red-50 font-bold' : 'text-slate-600'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pricing (₹50+)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
