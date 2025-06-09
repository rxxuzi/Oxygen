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
        <div className={`flex gap-8 border-b border-border ${className}`}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''} ${
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