'use client';

import { useState } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🖥️ NEWSROOM OPERATING SYSTEM (NewsOS) - LANGUAGE TABS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tab component for switching between English and Bengali editors
 * 
 * ══════════════════════════════════════════════════════════════════════════
 */

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface LanguageTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function LanguageTabs({ tabs, defaultTab }: LanguageTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || '');

  const activeContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className="border border-[var(--newsos-border-default)]">
      {/* Tab Headers */}
      <div className="flex border-b border-[var(--newsos-border-default)] bg-[var(--newsos-bg-secondary)]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors
              border-r border-[var(--newsos-border-default)] last:border-r-0
              ${activeTab === tab.value
                ? 'bg-[var(--newsos-bg-primary)] text-[var(--newsos-text-primary)] border-b-2 border-b-[var(--newsos-accent-primary)] -mb-px'
                : 'text-[var(--newsos-text-tertiary)] hover:bg-[var(--newsos-bg-hover)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--newsos-bg-primary)]">
        {activeContent}
      </div>
    </div>
  );
}
