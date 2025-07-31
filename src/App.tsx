import React, { useState } from 'react';
import Navigation, { MenuType } from './components/Navigation';
import LearningPage from './components/LearningPage';
import PersonaPage from './components/PersonaPage';
import ManagementPage from './components/ManagementPage';
import SettingsPage from './components/SettingsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Settings as SettingsType } from './types';
import './App.css';

const initialSettings: SettingsType = {
  openaiKey: '',
  typecastKey: '',
  actorId: '',
  tempo: 1,
  volume: 100,
  pitch: 0,
  emotionTone: 'normal-1',
  scenario: ''
};

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('learning');
  const [settings, setSettings] = useLocalStorage<SettingsType>('persona-chat-settings', initialSettings);


  const renderCurrentPage = () => {
    switch (activeMenu) {
      case 'learning':
        return <LearningPage />;
      case 'persona':
        return <PersonaPage />;
      case 'management':
        return <ManagementPage />;
      case 'settings':
        return <SettingsPage settings={settings} onSettingsChange={setSettings} />;
      default:
        return <LearningPage />;
    }
  };

  return (
    <div className="app">
      <Navigation activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default App;