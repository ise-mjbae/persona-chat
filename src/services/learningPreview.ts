import { ChatMessage, Persona } from '../types';

export const generatePreviewChat = async (
  openaiKey: string,
  content: string,
  keywords: string[],
  purpose: string,
  persona: Persona,
  condition?: string
): Promise<ChatMessage[]> => {
  const systemPrompt = `
당신은 주어진 페르소나 역할을 연기하는 AI입니다.

상황 설정:
- 유저(상담원/직원)가 페르소나(고객)에게 상품이나 서비스를 설명하고 판매하려고 합니다.
- 페르소나는 고객 역할로, 질문하고 반응하고 때로는 거부하거나 조건을 요구합니다.
- 유저는 학습 내용을 바탕으로 페르소나를 설득하고 만족시켜야 합니다.

페르소나(고객) 정보:
- 이름: ${persona.name}
- 성별: ${persona.gender}
- 연령대: ${persona.ageGroup}
- 성향: ${persona.personalityType}
- 추가 특징: ${persona.additionalTraits}
${condition ? `- 만족하는 조건: ${condition}` : ''}

학습 내용 (유저가 설명해야 할 상품/서비스): ${content}

핵심 키워드: ${keywords.join(', ')}

학습 목적: ${purpose}

7턴 정도의 자연스러운 대화를 생성해주세요:
- 페르소나(고객)가 먼저 문의나 관심을 표현하며 시작
- 유저(상담원)가 학습 내용을 바탕으로 설명하고 응답
- 페르소나는 자신의 성향에 맞게 질문, 의심, 조건 제시 등을 함
- 현실적이고 자연스러운 상담 상황으로 구성

대화 형식:
페르소나: (고객으로서 첫 문의나 관심 표현)
유저: (상담원으로서 응답)
페르소나: (고객 반응)
유저: (상담원 설명)
...

페르소나의 성격과 상황에 맞게 현실적인 고객 대화를 만들어주세요.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const chatText = data.choices[0].message.content;

    // 대화 텍스트를 파싱하여 ChatMessage 배열로 변환
    const messages: ChatMessage[] = [];
    const lines = chatText.split('\n').filter((line: string) => line.trim());
    
    let order = 0;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('페르소나:') || trimmedLine.startsWith(persona.name + ':')) {
        const content = trimmedLine.replace(/^(페르소나:|[^:]+:)\s*/, '');
        if (content) {
          messages.push({
            id: `${Date.now()}_${order}`,
            content,
            isUser: false,
            order: order++
          });
        }
      } else if (trimmedLine.startsWith('유저:') || trimmedLine.startsWith('사용자:')) {
        const content = trimmedLine.replace(/^(유저:|사용자:)\s*/, '');
        if (content) {
          messages.push({
            id: `${Date.now()}_${order}`,
            content,
            isUser: true,
            order: order++
          });
        }
      }
    }

    return messages;
  } catch (error) {
    console.error('대화 생성 오류:', error);
    throw error;
  }
};