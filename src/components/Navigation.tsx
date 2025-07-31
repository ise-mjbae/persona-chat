import React from 'react';

export type MenuType = 'learning' | 'persona' | 'management' | 'settings';

interface NavigationProps {
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeMenu, onMenuChange }) => {
  const menuItems = [
    { key: 'learning' as MenuType, label: '학습하기', icon: '📚' },
    { key: 'persona' as MenuType, label: '페르소나 관리', icon: '👥' },
    { key: 'management' as MenuType, label: '학습관리', icon: '📋' },
    { key: 'settings' as MenuType, label: '설정', icon: '⚙️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>AI 페르소나 채팅</h2>
      </div>
      <div className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={() => onMenuChange(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;