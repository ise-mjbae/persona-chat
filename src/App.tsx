import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Settings from './components/Settings';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Message, Settings as SettingsType, ConversationHistory } from './types';
import { callOpenAI, getEmotionTone } from './services/openai';
import { generateAndPlayAudio } from './services/typecast';
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
  const [settings, setSettings] = useLocalStorage<SettingsType>('persona-chat-settings', initialSettings);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('API 키와 상황 설정을 입력하고 대화를 시작하세요');
  const [isStatusSpeaking, setIsStatusSpeaking] = useState(false);

  const addMessage = useCallback((content: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const updateStatus = useCallback((message: string, speaking = false) => {
    setStatus(message);
    setIsStatusSpeaking(speaking);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (isSpeaking) return;

    const { openaiKey, typecastKey, actorId, scenario } = settings;

    if (!openaiKey || !typecastKey || !actorId || !scenario) {
      alert('모든 설정을 입력해주세요.');
      return;
    }

    addMessage(message, true);
    const newHistory: ConversationHistory[] = [...conversationHistory, { role: 'user', content: message }];
    setConversationHistory(newHistory);
    
    setIsSpeaking(true);
    updateStatus('AI가 응답을 생성중입니다...');

    try {
      const aiResponse = await callOpenAI(openaiKey, scenario, newHistory);
      addMessage(aiResponse, false);
      
      const updatedHistory = [...newHistory, { role: 'assistant', content: aiResponse }];
      setConversationHistory(updatedHistory);
      
      updateStatus('음성을 생성중입니다...');
      
      let emotionTone = settings.emotionTone;
      if (emotionTone === 'auto') {
        updateStatus('감정톤을 분석중입니다...');
        emotionTone = await getEmotionTone(openaiKey, aiResponse, newHistory);
      }
      
      updateStatus('음성을 재생중입니다...', true);
      
      await generateAndPlayAudio(
        typecastKey,
        actorId,
        aiResponse,
        emotionTone,
        settings.tempo,
        settings.volume,
        settings.pitch
      );
      
    } catch (error) {
      console.error('Error:', error);
      addMessage(`죄송합니다. 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, false);
    } finally {
      setIsSpeaking(false);
      updateStatus('메시지를 입력하세요');
    }
  }, [settings, conversationHistory, isSpeaking, addMessage, updateStatus]);

  return (
    <div className="container">
      <Header />
      <Settings settings={settings} onSettingsChange={setSettings} />
      <div className="chat-container">
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} disabled={isSpeaking} />
      </div>
      <StatusBar status={status} isSpeaking={isStatusSpeaking} />
    </div>
  );
};

export default App;