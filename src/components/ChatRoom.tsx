import React, { useState, useRef, useEffect } from 'react';
import { Learning, Persona, Message, ConversationHistory, VOICE_ACTORS } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings } from '../types';
import { callOpenAI, getEmotionTone } from '../services/openai';
import { generateAndPlayAudio } from '../services/typecast';

interface ChatRoomProps {
  learning: Learning;
  persona: Persona;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ learning, persona, onBack }) => {
  const [settings] = useLocalStorage<Settings>('persona-chat-settings', {
    openaiKey: '', typecastKey: '', actorId: '', tempo: 1, volume: 100, pitch: 0, emotionTone: 'auto', scenario: ''
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('메시지를 입력하고 대화를 시작해보세요');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading && !isSpeaking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, isSpeaking]);

  const addMessage = (content: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const updateStatus = (message: string, speaking = false) => {
    setStatus(message);
  };

  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || isLoading || isSpeaking) return;

    if (!settings.openaiKey || !settings.typecastKey) {
      alert('설정에서 API 키를 입력해주세요.');
      return;
    }

    // 사용자 메시지 추가
    addMessage(message, true);
    const newHistory: ConversationHistory[] = [...conversationHistory, { role: 'user', content: message }];
    setConversationHistory(newHistory);
    setUserInput('');
    
    setIsLoading(true);
    updateStatus('AI가 응답을 생성중입니다...');

    try {
      // 페르소나 정보와 학습 내용을 바탕으로 시스템 프롬프트 생성
      const personaCondition = learning.connectedPersonas.find(cp => cp.personaId === persona.id);
      const systemPrompt = `
당신은 다음과 같은 특성을 가진 고객입니다:

이름: ${persona.name}
성별: ${persona.gender}
연령대: ${persona.ageGroup}
성향: ${persona.personalityType}
추가 특징: ${persona.additionalTraits}
${personaCondition?.satisfactionCondition ? `만족 조건: ${personaCondition.satisfactionCondition}` : ''}

상황:
${learning.content}

핵심 키워드: ${learning.keywords.join(', ')}

학습 목적: ${learning.purpose}

상담원(사용자)이 당신에게 상품이나 서비스를 설명하고 판매하려고 합니다. 당신은 ${persona.personalityType} 성격에 맞게 자연스럽게 반응해주세요. 질문하고, 의심하고, 조건을 요구하거나, 만족할 때는 긍정적으로 반응해주세요.
`;

      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...newHistory
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messagesWithSystem,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      addMessage(aiResponse, false);
      
      const updatedHistory = [...newHistory, { role: 'assistant', content: aiResponse }];
      setConversationHistory(updatedHistory);
      
      updateStatus('음성을 생성중입니다...');
      setIsSpeaking(true);
      
      // 해당 페르소나의 지원 감정톤 목록 가져오기
      const voiceActor = VOICE_ACTORS.find(va => va.id === persona.voiceActorId);
      const supportedTones = voiceActor?.supportedEmotionTones || ['normal-1'];
      
      // 감정톤 결정
      let emotionTone = settings.emotionTone;
      if (emotionTone === 'auto') {
        updateStatus('감정톤을 분석중입니다...');
        emotionTone = await getEmotionTone(settings.openaiKey, aiResponse, newHistory, supportedTones);
      }
      
      // 지원되지 않는 감정톤인 경우 기본값으로 변경
      if (!supportedTones.includes(emotionTone)) {
        emotionTone = supportedTones[0];
      }
      
      updateStatus('음성을 재생중입니다...');
      
      // 페르소나의 음성 설정 사용
      await generateAndPlayAudio(
        settings.typecastKey,
        persona.voiceActorId,
        aiResponse,
        emotionTone,
        persona.tempo,
        persona.volume,
        persona.pitch
      );
      
    } catch (error) {
      console.error('Error:', error);
      addMessage(`죄송합니다. 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, false);
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
      updateStatus('메시지를 입력하세요');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <button className="btn-back" onClick={onBack}>
          ← 뒤로가기
        </button>
        <div className="chat-info">
          <h2>{learning.title}</h2>
          <div className="persona-info">
            <span className="persona-name">{persona.name}</span>
            <span className="persona-details">
              {persona.gender} · {persona.ageGroup} · {persona.personalityType}
            </span>
          </div>
        </div>
        <div className="learning-purpose">
          {learning.purpose && <small>목적: {learning.purpose}</small>}
        </div>
      </div>

      <div className="chat-messages-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-message">
                <h3>🎯 학습 시작!</h3>
                <p><strong>{persona.name}</strong>과(와) 대화를 시작해보세요.</p>
                <div className="learning-info">
                  <p><strong>학습 내용:</strong> {learning.content.substring(0, 200)}...</p>
                  {learning.keywords.length > 0 && (
                    <div className="keywords">
                      <strong>핵심 키워드:</strong>
                      {learning.keywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`chat-bubble-container ${message.isUser ? 'user-container' : 'persona-container'}`}>
              <div className={`chat-bubble ${message.isUser ? 'user-bubble' : 'persona-bubble'}`}>
                <div className="bubble-header">
                  <span className="message-sender">
                    {message.isUser ? '👤 상담원 (나)' : `🤖 ${persona.name}`}
                  </span>
                  <small className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </small>
                </div>
                <div className="bubble-content">
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-area">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isSpeaking}
            placeholder="메시지를 입력하세요..."
            maxLength={500}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || isSpeaking || !userInput.trim()}
            className="send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
        <div className="status-bar">
          <span className={`status ${isSpeaking ? 'speaking' : ''}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;