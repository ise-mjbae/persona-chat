import React, { useState, useEffect } from 'react';
import { Persona, VOICE_ACTORS, AGE_GROUPS, PERSONALITY_TYPES, Gender, AgeGroup, PersonalityType } from '../types';

interface PersonaFormProps {
  persona?: Persona;
  onSave: (persona: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PersonaForm: React.FC<PersonaFormProps> = ({ persona, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '남성' as Gender,
    ageGroup: '20대 초반' as AgeGroup,
    personalityType: '신중한 고객' as PersonalityType,
    additionalTraits: '',
    voiceActorId: VOICE_ACTORS[0].id,
    tempo: 1,
    volume: 100,
    pitch: 0
  });

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name,
        gender: persona.gender,
        ageGroup: persona.ageGroup,
        personalityType: persona.personalityType,
        additionalTraits: persona.additionalTraits,
        voiceActorId: persona.voiceActorId,
        tempo: persona.tempo,
        volume: persona.volume,
        pitch: persona.pitch
      });
    }
  }, [persona]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('페르소나명을 입력해주세요.');
      return;
    }
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredVoiceActors = VOICE_ACTORS.filter(actor => actor.gender === formData.gender);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{persona ? '페르소나 수정' : '페르소나 추가'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="persona-form">
          <div className="form-group">
            <label>페르소나명 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="페르소나 이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>성별</label>
            <select
              value={formData.gender}
              onChange={(e) => {
                handleChange('gender', e.target.value);
                // 성별 변경 시 첫 번째 voice actor로 리셋
                const filteredActors = VOICE_ACTORS.filter(actor => actor.gender === e.target.value);
                if (filteredActors.length > 0) {
                  handleChange('voiceActorId', filteredActors[0].id);
                }
              }}
            >
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>

          <div className="form-group">
            <label>연령대</label>
            <select
              value={formData.ageGroup}
              onChange={(e) => handleChange('ageGroup', e.target.value)}
            >
              {AGE_GROUPS.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>성향</label>
            <select
              value={formData.personalityType}
              onChange={(e) => handleChange('personalityType', e.target.value)}
            >
              {PERSONALITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>기타 특징</label>
            <textarea
              value={formData.additionalTraits}
              onChange={(e) => handleChange('additionalTraits', e.target.value)}
              placeholder="혼자 거주, 가족과 함께 거주, 아이폰 15 소유, 가입기간, 가입상품군 등..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>목소리 타입</label>
            <select
              value={formData.voiceActorId}
              onChange={(e) => handleChange('voiceActorId', e.target.value)}
            >
              {filteredVoiceActors.map(actor => (
                <option key={actor.id} value={actor.id}>{actor.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>음성 설정</label>
            <div className="voice-settings">
              <div>
                <label>Tempo</label>
                <input
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={formData.tempo}
                  onChange={(e) => handleChange('tempo', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label>Volume</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.volume}
                  onChange={(e) => handleChange('volume', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label>Pitch</label>
                <input
                  type="number"
                  min="-10"
                  max="10"
                  value={formData.pitch}
                  onChange={(e) => handleChange('pitch', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              {persona ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonaForm;