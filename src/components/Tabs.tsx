import { useState } from 'react';
import type { TabsProps } from '@/types/tmdb';

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex space-x-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
              transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-tmdb-secondary text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        id={`tab-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="animate-fade-in"
      >
        {activeTabContent}
      </div>
    </div>
  );
}