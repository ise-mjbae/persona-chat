import { useState, useCallback } from 'react';
import { Learning, ChatMessage } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useLearnings = () => {
  const [learnings, setLearnings] = useLocalStorage<Learning[]>('learnings', []);
  const [loading] = useState(false);

  const createLearning = useCallback((learningData: Omit<Learning, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLearning: Learning = {
      ...learningData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setLearnings(prev => [...prev, newLearning]);
    return newLearning;
  }, [setLearnings]);

  const updateLearning = useCallback((id: string, updates: Partial<Omit<Learning, 'id' | 'createdAt'>>) => {
    setLearnings(prev => prev.map(learning => 
      learning.id === id 
        ? { ...learning, ...updates, updatedAt: new Date() }
        : learning
    ));
  }, [setLearnings]);

  const deleteLearning = useCallback((id: string) => {
    setLearnings(prev => prev.filter(learning => learning.id !== id));
  }, [setLearnings]);

  const getLearningById = useCallback((id: string) => {
    return learnings.find(learning => learning.id === id);
  }, [learnings]);

  const updateGeneratedChat = useCallback((learningId: string, personaId: string, messages: ChatMessage[]) => {
    setLearnings(prev => prev.map(learning => 
      learning.id === learningId 
        ? { 
            ...learning, 
            generatedChats: { 
              ...learning.generatedChats, 
              [personaId]: messages 
            },
            updatedAt: new Date()
          }
        : learning
    ));
  }, [setLearnings]);

  return {
    learnings,
    loading,
    createLearning,
    updateLearning,
    deleteLearning,
    getLearningById,
    updateGeneratedChat
  };
};