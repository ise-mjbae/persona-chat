import { useState, useCallback } from 'react';
import { Persona } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const usePersonas = () => {
  const [personas, setPersonas] = useLocalStorage<Persona[]>('personas', []);
  const [loading, setLoading] = useState(false);

  const createPersona = useCallback((personaData: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPersona: Persona = {
      ...personaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPersonas(prev => [...prev, newPersona]);
    return newPersona;
  }, [setPersonas]);

  const updatePersona = useCallback((id: string, updates: Partial<Omit<Persona, 'id' | 'createdAt'>>) => {
    setPersonas(prev => prev.map(persona => 
      persona.id === id 
        ? { ...persona, ...updates, updatedAt: new Date() }
        : persona
    ));
  }, [setPersonas]);

  const deletePersona = useCallback((id: string) => {
    setPersonas(prev => prev.filter(persona => persona.id !== id));
  }, [setPersonas]);

  const getPersonaById = useCallback((id: string) => {
    return personas.find(persona => persona.id === id);
  }, [personas]);

  return {
    personas,
    loading,
    createPersona,
    updatePersona,
    deletePersona,
    getPersonaById
  };
};