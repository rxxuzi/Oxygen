import React from 'react';

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
    return (
        <div className={`flex gap-8 border-b border-zinc-800 ${className}`}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id 
                            ? 'text-zinc-100 border-b-2 border-blue-500' 
                            : 'text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent'
                    } ${
                        tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !tab.disabled && onTabChange(tab.id)}
                    disabled={tab.disabled}
                >
                    {tab.icon && (
                        <span className="mr-2">{tab.icon}</span>
                    )}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}