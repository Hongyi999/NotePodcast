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
        <div key={tab} className="tab-item">
          <button
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
            type="button"
            aria-label={tab}
          >
            {tab}
          </button>
          <div className="tab-tooltip" role="tooltip">
            <div className="tab-tooltip-content">{tab}</div>
          </div>
        </div>
      ))}
      {showHint && hintText && (
        <span className="tab-hint">{hintText}</span>
      )}
    </div>
  );
}

