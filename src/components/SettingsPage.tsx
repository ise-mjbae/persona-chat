import React from 'react';
import { Settings as SettingsType } from '../types';

interface SettingsPageProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (field: keyof SettingsType, value: string | number) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>설정</h1>
        <p>API 키와 기본 설정을 관리하세요</p>
      </div>
      <div className="page-content">
        <div className="settings-section">
          <h3>API 설정</h3>
          <div className="settings-row">
            <label>OpenAI API 키:</label>
            <input
              type="password"
              value={settings.openaiKey}
              onChange={(e) => handleChange('openaiKey', e.target.value)}
              placeholder="OpenAI API 키를 입력하세요"
            />
          </div>
          <div className="settings-row">
            <label>Typecast API 키:</label>
            <input
              type="password"
              value={settings.typecastKey}
              onChange={(e) => handleChange('typecastKey', e.target.value)}
              placeholder="Typecast API 키를 입력하세요"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>기본 음성 설정</h3>
          <div className="settings-group">
            <div>
              <label>Tempo:</label>
              <input
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.tempo}
                onChange={(e) => handleChange('tempo', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label>Volume:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => handleChange('volume', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label>Pitch:</label>
              <input
                type="number"
                min="-10"
                max="10"
                value={settings.pitch}
                onChange={(e) => handleChange('pitch', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;