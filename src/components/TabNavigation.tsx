import './TabNavigation.css';

interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  showHint?: boolean;
  hintText?: string;
}

export function TabNavigation({ tabs, activeTab, onTabChange, showHint, hintText }: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
      {showHint && hintText && (
        <span className="tab-hint">{hintText}</span>
      )}
    </div>
  );
}

