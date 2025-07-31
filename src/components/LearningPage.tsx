import React, { useState } from 'react';
import { useLearnings } from '../hooks/useLearnings';
import { usePersonas } from '../hooks/usePersonas';
import { Learning, Persona } from '../types';
import ChatRoom from './ChatRoom';

const LearningPage: React.FC = () => {
  const { learnings } = useLearnings();
  const { personas } = usePersonas();
  const [selectedLearning, setSelectedLearning] = useState<Learning | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isInChat, setIsInChat] = useState(false);

  // 완료된 학습만 필터링 (미리보기가 생성된 학습)
  const completedLearnings = learnings.filter(learning => 
    learning.generatedChats && Object.keys(learning.generatedChats).length > 0
  );

  const handleLearningSelect = (learning: Learning) => {
    setSelectedLearning(learning);
    setSelectedPersona(null); // 페르소나 선택 초기화
  };

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handleStartChat = () => {
    if (selectedLearning && selectedPersona) {
      setIsInChat(true);
    }
  };

  const handleBackToSelection = () => {
    setIsInChat(false);
  };

  const getPersonaName = (personaId: string) => {
    return personas.find(p => p.id === personaId)?.name || '알 수 없음';
  };

  const getAvailablePersonas = (learning: Learning) => {
    return learning.connectedPersonas
      .map(cp => personas.find(p => p.id === cp.personaId))
      .filter(Boolean) as Persona[];
  };

  // 채팅 화면 표시
  if (isInChat && selectedLearning && selectedPersona) {
    return (
      <ChatRoom 
        learning={selectedLearning} 
        persona={selectedPersona} 
        onBack={handleBackToSelection}
      />
    );
  }

  if (completedLearnings.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>학습하기</h1>
            <p>생성된 학습 시나리오를 선택하고 페르소나와 대화를 연습해보세요</p>
          </div>
        </div>
        <div className="page-content">
          <div className="empty-state">
            <h3>아직 완료된 학습이 없습니다</h3>
            <p>학습관리에서 학습을 생성하고 미리보기를 완료해주세요</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>학습하기</h1>
          <p>생성된 학습 시나리오를 선택하고 페르소나와 대화를 연습해보세요</p>
        </div>
      </div>
      
      <div className="page-content">
        <div className="learning-practice-container">
          {/* 학습 선택 */}
          <div className="practice-section">
            <h3>1단계: 학습 선택</h3>
            <div className="learning-selection">
              {completedLearnings.map(learning => (
                <div 
                  key={learning.id} 
                  className={`learning-option ${selectedLearning?.id === learning.id ? 'selected' : ''}`}
                  onClick={() => handleLearningSelect(learning)}
                >
                  <div className="option-header">
                    <h4>{learning.title}</h4>
                    <div className="option-meta">
                      <span>{Object.keys(learning.generatedChats || {}).length}개 페르소나</span>
                    </div>
                  </div>
                  <div className="option-content">
                    <p>{learning.content.substring(0, 150)}...</p>
                    {learning.keywords.length > 0 && (
                      <div className="keywords">
                        {learning.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="keyword-tag small">{keyword}</span>
                        ))}
                        {learning.keywords.length > 3 && <span className="more">+{learning.keywords.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 페르소나 선택 */}
          {selectedLearning && (
            <div className="practice-section">
              <h3>2단계: 페르소나 선택</h3>
              <div className="persona-selection">
                {getAvailablePersonas(selectedLearning).map(persona => (
                  <div 
                    key={persona.id} 
                    className={`persona-option ${selectedPersona?.id === persona.id ? 'selected' : ''}`}
                    onClick={() => handlePersonaSelect(persona)}
                  >
                    <div className="persona-avatar">
                      {persona.gender === '남성' ? '👨' : '👩'}
                    </div>
                    <div className="persona-info">
                      <h4>{persona.name}</h4>
                      <div className="persona-details">
                        <span>{persona.gender}</span>
                        <span>{persona.ageGroup}</span>
                        <span>{persona.personalityType}</span>
                      </div>
                      {/* 해당 페르소나의 만족 조건 표시 */}
                      {selectedLearning.connectedPersonas.find(cp => cp.personaId === persona.id)?.satisfactionCondition && (
                        <div className="satisfaction-condition">
                          <small>만족조건: {selectedLearning.connectedPersonas.find(cp => cp.personaId === persona.id)?.satisfactionCondition}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 시작 버튼 */}
          {selectedLearning && selectedPersona && (
            <div className="practice-section">
              <h3>3단계: 대화 시작</h3>
              <div className="start-section">
                <div className="selected-info">
                  <div className="info-item">
                    <span className="label">선택된 학습:</span>
                    <span className="value">{selectedLearning.title}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">선택된 페르소나:</span>
                    <span className="value">{selectedPersona.name} ({selectedPersona.gender}, {selectedPersona.ageGroup})</span>
                  </div>
                  {selectedLearning.purpose && (
                    <div className="info-item">
                      <span className="label">학습 목적:</span>
                      <span className="value">{selectedLearning.purpose}</span>
                    </div>
                  )}
                </div>
                <button className="btn-start-chat" onClick={handleStartChat}>
                  🚀 대화 시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;