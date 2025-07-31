import React, { useState, useEffect } from 'react';
import { Learning, PersonaCondition } from '../types';
import { usePersonas } from '../hooks/usePersonas';

interface LearningFormProps {
  learning?: Learning;
  onSave: (learning: Omit<Learning, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const LearningForm: React.FC<LearningFormProps> = ({ learning, onSave, onCancel }) => {
  const { personas } = usePersonas();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    keywords: [] as string[],
    connectedPersonas: [] as PersonaCondition[],
    purpose: '',
    generatedChats: {} as { [personaId: string]: any[] }
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (learning) {
      setFormData({
        title: learning.title,
        content: learning.content,
        keywords: learning.keywords,
        connectedPersonas: learning.connectedPersonas,
        purpose: learning.purpose,
        generatedChats: learning.generatedChats
      });
    }
  }, [learning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('학습 제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('학습 내용을 입력해주세요.');
      return;
    }
    if (formData.connectedPersonas.length === 0) {
      alert('최소 1개 이상의 페르소나를 선택해주세요.');
      return;
    }
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const togglePersona = (personaId: string) => {
    const isSelected = formData.connectedPersonas.some(cp => cp.personaId === personaId);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        connectedPersonas: prev.connectedPersonas.filter(cp => cp.personaId !== personaId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        connectedPersonas: [...prev.connectedPersonas, { personaId, satisfactionCondition: '' }]
      }));
    }
  };

  const updatePersonaCondition = (personaId: string, condition: string) => {
    setFormData(prev => ({
      ...prev,
      connectedPersonas: prev.connectedPersonas.map(cp =>
        cp.personaId === personaId ? { ...cp, satisfactionCondition: condition } : cp
      )
    }));
  };

  // const getPersonaName = (personaId: string) => {
  //   return personas.find(p => p.id === personaId)?.name || '알 수 없음';
  // };

  return (
    <div className="modal-overlay">
      <div className="modal-content learning-modal">
        <div className="modal-header">
          <h2>{learning ? '학습 수정' : '학습 추가'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="learning-form">
          <div className="form-group">
            <label>학습 제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="학습 제목을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>배워야할 내용 전문 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="판매해야하는 상품에 대한 설명이나 학습할 내용을 입력하세요"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>핵심 키워드</label>
            <div className="keyword-input">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="키워드를 입력하고 Enter를 누르세요"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <button type="button" onClick={addKeyword} className="btn-add">추가</button>
            </div>
            <div className="keywords-list">
              {formData.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                  <button type="button" onClick={() => removeKeyword(index)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>연결할 페르소나 *</label>
            {personas.length === 0 ? (
              <p className="no-personas">페르소나가 없습니다. 먼저 페르소나를 생성해주세요.</p>
            ) : (
              <div className="persona-selection">
                {personas.map(persona => {
                  const isSelected = formData.connectedPersonas.some(cp => cp.personaId === persona.id);
                  const condition = formData.connectedPersonas.find(cp => cp.personaId === persona.id)?.satisfactionCondition || '';
                  
                  return (
                    <div key={persona.id} className="persona-item">
                      <div className="persona-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePersona(persona.id)}
                        />
                        <span>{persona.name} ({persona.gender}, {persona.ageGroup})</span>
                      </div>
                      {isSelected && (
                        <input
                          type="text"
                          placeholder="만족 조건 (선택사항)"
                          value={condition}
                          onChange={(e) => updatePersonaCondition(persona.id, e.target.value)}
                          className="condition-input"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>학습의 목적</label>
            <textarea
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              placeholder="예: 항의표시를 하러 온 페르소나의 화를 누그러뜨리기, 제품에 관심을 가지고 온 고객에게 구매의사 듣기 등"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              {learning ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningForm;