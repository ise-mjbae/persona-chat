import React, { useState } from 'react';
import { useLearnings } from '../hooks/useLearnings';
import { usePersonas } from '../hooks/usePersonas';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings } from '../types';
import LearningForm from './LearningForm';
import ChatPreview from './ChatPreview';
import { generatePreviewChat } from '../services/learningPreview';

const ManagementPage: React.FC = () => {
  const { learnings, createLearning, updateLearning, deleteLearning, updateGeneratedChat } = useLearnings();
  const { personas } = usePersonas();
  const [settings] = useLocalStorage<Settings>('persona-chat-settings', {
    openaiKey: '', typecastKey: '', actorId: '', tempo: 1, volume: 100, pitch: 0, emotionTone: 'auto', scenario: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingLearning, setEditingLearning] = useState<string | null>(null);
  const [previewLearning, setPreviewLearning] = useState<string | null>(null);
  const [activePersonaTab, setActivePersonaTab] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddLearning = () => {
    setEditingLearning(null);
    setShowForm(true);
  };

  const handleEditLearning = (learningId: string) => {
    setEditingLearning(learningId);
    setShowForm(true);
  };

  const handleDeleteLearning = (learningId: string) => {
    if (window.confirm('정말로 이 학습을 삭제하시겠습니까?')) {
      deleteLearning(learningId);
    }
  };

  const handleSaveLearning = (learningData: any) => {
    if (editingLearning) {
      updateLearning(editingLearning, learningData);
    } else {
      createLearning(learningData);
    }
    setShowForm(false);
    setEditingLearning(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLearning(null);
  };

  const handlePreview = async (learningId: string, forceRegenerate = false) => {
    const learning = learnings.find(l => l.id === learningId);
    if (!learning || !settings.openaiKey) {
      alert('OpenAI API 키를 설정해주세요.');
      return;
    }

    // 기존 미리보기가 있고 강제 재생성이 아닌 경우, 단순히 보여주기만 함
    if (!forceRegenerate && learning.generatedChats && Object.keys(learning.generatedChats).length > 0) {
      setPreviewLearning(learningId);
      const firstPersonaId = Object.keys(learning.generatedChats)[0];
      if (firstPersonaId) {
        setActivePersonaTab(firstPersonaId);
      }
      return;
    }

    // 새로 생성하는 경우
    setIsGenerating(true);
    setPreviewLearning(learningId);

    try {
      const generatedChats: { [personaId: string]: any[] } = {};

      for (const personaCondition of learning.connectedPersonas) {
        const persona = personas.find(p => p.id === personaCondition.personaId);
        if (persona) {
          const messages = await generatePreviewChat(
            settings.openaiKey,
            learning.content,
            learning.keywords,
            learning.purpose,
            persona,
            personaCondition.satisfactionCondition
          );
          generatedChats[persona.id] = messages;
        }
      }

      updateGeneratedChat(learningId, '', generatedChats);
      updateLearning(learningId, { generatedChats });
      
      // 첫 번째 페르소나를 활성 탭으로 설정
      const firstPersonaId = Object.keys(generatedChats)[0];
      if (firstPersonaId) {
        setActivePersonaTab(firstPersonaId);
      }
    } catch (error) {
      console.error('미리보기 생성 오류:', error);
      alert('미리보기 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePreview = (learningId: string) => {
    if (window.confirm('생성된 미리보기를 삭제하시겠습니까?')) {
      updateLearning(learningId, { generatedChats: {} });
      setPreviewLearning(null);
      setActivePersonaTab('');
    }
  };

  const handleUpdateChat = (learningId: string, personaId: string, messages: any[]) => {
    updateGeneratedChat(learningId, personaId, messages);
  };

  const getPersonaName = (personaId: string) => {
    return personas.find(p => p.id === personaId)?.name || '알 수 없음';
  };

  const previewingLearning = previewLearning ? learnings.find(l => l.id === previewLearning) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>학습관리</h1>
          <p>학습 시나리오를 생성하고 관리하세요</p>
        </div>
        <button className="btn-primary" onClick={handleAddLearning}>
          + 학습 추가
        </button>
      </div>
      
      <div className="page-content">
        {learnings.length === 0 ? (
          <div className="empty-state">
            <h3>아직 생성된 학습이 없습니다</h3>
            <p>새로운 학습을 추가해보세요</p>
          </div>
        ) : (
          <div className="learning-list">
            {learnings.map(learning => (
              <div key={learning.id} className="learning-card">
                <div className="learning-header">
                  <h3>{learning.title}</h3>
                  <div className="learning-actions">
                    {learning.generatedChats && Object.keys(learning.generatedChats).length > 0 ? (
                      <>
                        <button 
                          className="btn-preview" 
                          onClick={() => handlePreview(learning.id)}
                        >
                          미리보기 보기
                        </button>
                        <button 
                          className="btn-regenerate" 
                          onClick={() => handlePreview(learning.id, true)}
                          disabled={isGenerating}
                        >
                          {isGenerating && previewLearning === learning.id ? '재생성중...' : '다시 생성'}
                        </button>
                        <button 
                          className="btn-delete-preview" 
                          onClick={() => handleDeletePreview(learning.id)}
                          title="미리보기 삭제"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreview(learning.id, true)}
                        disabled={isGenerating}
                      >
                        {isGenerating && previewLearning === learning.id ? '생성중...' : '미리보기 생성'}
                      </button>
                    )}
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEditLearning(learning.id)}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeleteLearning(learning.id)}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="learning-info">
                  <div className="info-section">
                    <h4>학습 내용</h4>
                    <p className="content-preview">{learning.content.substring(0, 200)}...</p>
                  </div>
                  
                  {learning.keywords.length > 0 && (
                    <div className="info-section">
                      <h4>키워드</h4>
                      <div className="keywords">
                        {learning.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="info-section">
                    <h4>연결된 페르소나</h4>
                    <div className="personas">
                      {learning.connectedPersonas.map(cp => (
                        <span key={cp.personaId} className="persona-tag">
                          {getPersonaName(cp.personaId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {learning.purpose && (
                    <div className="info-section">
                      <h4>목적</h4>
                      <p>{learning.purpose}</p>
                    </div>
                  )}
                </div>
                
                <div className="learning-footer">
                  <small>생성: {learning.createdAt instanceof Date ? learning.createdAt.toLocaleDateString() : new Date(learning.createdAt).toLocaleDateString()}</small>
                </div>

                {/* 미리보기가 생성된 경우 표시 */}
                {previewLearning === learning.id && learning.generatedChats && Object.keys(learning.generatedChats).length > 0 && (
                  <div className="chat-previews">
                    <h4>생성된 대화 미리보기</h4>
                    
                    {/* 페르소나 탭 */}
                    <div className="persona-tabs">
                      {Object.keys(learning.generatedChats).map(personaId => {
                        const persona = personas.find(p => p.id === personaId);
                        if (!persona) return null;
                        
                        return (
                          <button
                            key={personaId}
                            className={`persona-tab ${activePersonaTab === personaId ? 'active' : ''}`}
                            onClick={() => setActivePersonaTab(personaId)}
                          >
                            {persona.name}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* 활성 페르소나의 대화 표시 */}
                    {activePersonaTab && learning.generatedChats[activePersonaTab] && (
                      <ChatPreview
                        persona={personas.find(p => p.id === activePersonaTab)!}
                        messages={learning.generatedChats[activePersonaTab]}
                        onUpdateMessages={(updatedMessages) => handleUpdateChat(learning.id, activePersonaTab, updatedMessages)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <LearningForm
          learning={editingLearning ? learnings.find(l => l.id === editingLearning) : undefined}
          onSave={handleSaveLearning}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default ManagementPage;