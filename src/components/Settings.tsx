import React from 'react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (field: keyof SettingsType, value: string | number) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="settings">
      <div className="settings-row">
        <label>OpenAI API:</label>
        <input
          type="password"
          value={settings.openaiKey}
          onChange={(e) => handleChange('openaiKey', e.target.value)}
          placeholder="OpenAI API 키를 입력하세요"
        />
      </div>
      <div className="settings-row">
        <label>Typecast API:</label>
        <input
          type="password"
          value={settings.typecastKey}
          onChange={(e) => handleChange('typecastKey', e.target.value)}
          placeholder="Typecast API 키를 입력하세요"
        />
      </div>
      <div className="settings-row">
        <label>Actor ID:</label>
        <input
          type="text"
          value={settings.actorId}
          onChange={(e) => handleChange('actorId', e.target.value)}
          placeholder="Typecast Actor ID (24자리)를 입력하세요"
        />
      </div>
      <div className="settings-row">
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
              placeholder="1"
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
              placeholder="100"
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
              placeholder="0"
            />
          </div>
          <div>
            <label>감정톤:</label>
            <select
              value={settings.emotionTone}
              onChange={(e) => handleChange('emotionTone', e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="normal-1">Normal</option>
              <option value="happy-1">Happy</option>
              <option value="sad-1">Sad</option>
              <option value="angry-1">Angry</option>
            </select>
          </div>
        </div>
      </div>
      <div className="settings-row">
        <label>상황 설정:</label>
        <textarea
          value={settings.scenario}
          onChange={(e) => handleChange('scenario', e.target.value)}
          placeholder="AI가 연기할 상황이나 역할을 설정하세요. 예: 당신은 친근한 카페 사장입니다. 손님들과 일상적인 대화를 나누며..."
        />
      </div>
    </div>
  );
};

export default Settings;