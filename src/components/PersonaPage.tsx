import React, { useState } from 'react';
import { usePersonas } from '../hooks/usePersonas';
import { VOICE_ACTORS } from '../types';
import PersonaForm from './PersonaForm';

const PersonaPage: React.FC = () => {
  const { personas, createPersona, updatePersona, deletePersona } = usePersonas();
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<string | null>(null);

  const handleAddPersona = () => {
    setEditingPersona(null);
    setShowForm(true);
  };

  const handleEditPersona = (personaId: string) => {
    setEditingPersona(personaId);
    setShowForm(true);
  };

  const handleDeletePersona = (personaId: string) => {
    if (window.confirm('정말로 이 페르소나를 삭제하시겠습니까?')) {
      deletePersona(personaId);
    }
  };

  const handleSavePersona = (personaData: any) => {
    if (editingPersona) {
      updatePersona(editingPersona, personaData);
    } else {
      createPersona(personaData);
    }
    setShowForm(false);
    setEditingPersona(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPersona(null);
  };

  const getVoiceActorName = (voiceActorId: string) => {
    return VOICE_ACTORS.find(actor => actor.id === voiceActorId)?.name || '알 수 없음';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>페르소나 관리</h1>
          <p>대화 상대방이 될 페르소나를 생성하고 관리하세요</p>
        </div>
        <button className="btn-primary" onClick={handleAddPersona}>
          + 페르소나 추가
        </button>
      </div>
      
      <div className="page-content">
        {personas.length === 0 ? (
          <div className="empty-state">
            <h3>아직 생성된 페르소나가 없습니다</h3>
            <p>새로운 페르소나를 추가해보세요</p>
          </div>
        ) : (
          <div className="persona-grid">
            {personas.map(persona => (
              <div key={persona.id} className="persona-card">
                <div className="persona-header">
                  <div className="persona-avatar">
                    {persona.name.charAt(0)}
                  </div>
                  <div className="persona-title-section">
                    <h3>{persona.name}</h3>
                    <div className="persona-subtitle">
                      <span className="persona-badge">{persona.gender}</span>
                      <span className="persona-badge">{persona.ageGroup}</span>
                      <span className="persona-badge">{persona.personalityType}</span>
                    </div>
                  </div>
                  <div className="persona-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEditPersona(persona.id)}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeletePersona(persona.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="persona-info">
                  <div className="info-row">
                    <span className="label">목소리</span>
                    <span>{getVoiceActorName(persona.voiceActorId)}</span>
                  </div>
                  {persona.additionalTraits && (
                    <div className="info-row">
                      <span className="label">특징</span>
                      <span className="traits">{persona.additionalTraits}</span>
                    </div>
                  )}
                </div>
                
                <div className="persona-footer">
                  <small>생성: {persona.createdAt instanceof Date ? persona.createdAt.toLocaleDateString() : new Date(persona.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PersonaForm
          persona={editingPersona ? personas.find(p => p.id === editingPersona) : undefined}
          onSave={handleSavePersona}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default PersonaPage;