import React, { useState } from 'react';
import { ChatMessage, Persona } from '../types';

interface ChatPreviewProps {
  persona: Persona;
  messages: ChatMessage[];
  onUpdateMessages: (messages: ChatMessage[]) => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ persona, messages, onUpdateMessages }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const startEdit = (message: ChatMessage) => {
    setEditingId(message.id);
    setEditingContent(message.content);
  };

  const saveEdit = () => {
    if (editingId) {
      const updatedMessages = messages.map(msg =>
        msg.id === editingId ? { ...msg, content: editingContent } : msg
      );
      onUpdateMessages(updatedMessages);
      setEditingId(null);
      setEditingContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const deleteMessage = (id: string) => {
    if (window.confirm('이 메시지를 삭제하시겠습니까?')) {
      const updatedMessages = messages
        .filter(msg => msg.id !== id)
        .map((msg, index) => ({ ...msg, order: index }));
      onUpdateMessages(updatedMessages);
    }
  };

  const addMessage = (afterId: string, isUser: boolean) => {
    const afterIndex = messages.findIndex(msg => msg.id === afterId);
    const newMessage: ChatMessage = {
      id: `${Date.now()}_new`,
      content: isUser ? '새로운 사용자 메시지' : '새로운 페르소나 메시지',
      isUser,
      order: afterIndex + 1
    };

    const updatedMessages = [
      ...messages.slice(0, afterIndex + 1),
      newMessage,
      ...messages.slice(afterIndex + 1)
    ].map((msg, index) => ({ ...msg, order: index }));

    onUpdateMessages(updatedMessages);
  };

  const moveMessage = (id: string, direction: 'up' | 'down') => {
    const currentIndex = messages.findIndex(msg => msg.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) ||
      (direction === 'down' && currentIndex >= messages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedMessages = [...messages];
    [updatedMessages[currentIndex], updatedMessages[newIndex]] = 
    [updatedMessages[newIndex], updatedMessages[currentIndex]];

    // order 재설정
    updatedMessages.forEach((msg, index) => {
      msg.order = index;
    });

    onUpdateMessages(updatedMessages);
  };

  const sortedMessages = [...messages].sort((a, b) => a.order - b.order);

  return (
    <div className="chat-preview">
      <div className="chat-header">
        <h4>대화 미리보기 - {persona.name}</h4>
        <p>{persona.gender}, {persona.ageGroup}, {persona.personalityType}</p>
      </div>
      
      <div className="chat-messages">
        {sortedMessages.map((message, index) => (
          <div key={message.id} className={`chat-bubble-container ${message.isUser ? 'user-container' : 'persona-container'}`}>
            <div className={`chat-bubble ${message.isUser ? 'user-bubble' : 'persona-bubble'}`}>
              <div className="bubble-header">
                <span className="message-sender">
                  {message.isUser ? '👤 상담원' : '🤖 ' + persona.name}
                </span>
                <div className="message-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => moveMessage(message.id, 'up')}
                    disabled={index === 0}
                    title="위로 이동"
                  >
                    ↑
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => moveMessage(message.id, 'down')}
                    disabled={index === sortedMessages.length - 1}
                    title="아래로 이동"
                  >
                    ↓
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => startEdit(message)}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => deleteMessage(message.id)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => addMessage(message.id, !message.isUser)}
                    title="다음에 메시지 추가"
                  >
                    ➕
                  </button>
                </div>
              </div>
              
              <div className="bubble-content">
                {editingId === message.id ? (
                  <div className="edit-form">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button className="btn-secondary" onClick={cancelEdit}>취소</button>
                      <button className="btn-primary" onClick={saveEdit}>저장</button>
                    </div>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPreview;