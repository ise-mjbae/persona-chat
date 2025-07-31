import { ConversationHistory } from '../types';

export const callOpenAI = async (
  apiKey: string,
  scenario: string,
  conversationHistory: ConversationHistory[]
): Promise<string> => {
  const messages = [
    { role: 'system', content: scenario },
    ...conversationHistory
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const getEmotionTone = async (
  apiKey: string,
  aiResponse: string,
  conversationHistory: ConversationHistory[],
  supportedTones: string[] = ['normal-1', 'happy-1', 'sad-1', 'angry-1']
): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `다음 텍스트의 감정을 분석하여 음성 생성에 적합한 감정톤을 선택해주세요. 다음 중 하나만 선택하세요: ${supportedTones.join(', ')}. 답변은 선택한 감정톤만 출력하세요.`
          },
          {
            role: 'user',
            content: `대화 맥락: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n분석할 텍스트: ${aiResponse}`
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const selectedTone = data.choices[0].message.content.trim();
      return supportedTones.includes(selectedTone) ? selectedTone : supportedTones[0];
    }
  } catch (error) {
    console.error('감정톤 분석 오류:', error);
  }
  return supportedTones[0];
};