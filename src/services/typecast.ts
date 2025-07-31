export const generateAndPlayAudio = async (
  apiKey: string,
  actorId: string,
  text: string,
  emotionTone: string,
  tempo: number,
  volume: number,
  pitch: number
): Promise<void> => {
  try {
    // 1단계: /api/speak 호출하여 speak_v2_url 획득
    const speakResponse = await fetch('https://typecast.ai/api/speak', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        actor_id: actorId,
        text: text,
        lang: 'auto',
        model_version: 'latest',
        xapi_hd: true,
        tempo: tempo,
        volume: volume,
        pitch: pitch,
        max_seconds: 60,
        xapi_audio_format: 'wav',
        emotion_tone_preset: emotionTone
      })
    });

    if (!speakResponse.ok) {
      throw new Error(`Typecast API 오류: ${speakResponse.status}`);
    }

    const speakData = await speakResponse.json();
    const speakV2Url = speakData.result.speak_v2_url;
    
    if (!speakV2Url) {
      throw new Error('speak_v2_url을 받지 못했습니다.');
    }
    
    // 2단계: speak_v2_url로 GET 요청하여 audio_download_url 획득
    let audioDownloadUrl = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!audioDownloadUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(speakV2Url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.result.status === 'done' && statusData.result.audio_download_url) {
          audioDownloadUrl = statusData.result.audio_download_url;
        } else if (statusData.result.status === 'error') {
          throw new Error('음성 생성에 실패했습니다.');
        }
      }
      
      attempts++;
    }
    
    if (!audioDownloadUrl) {
      throw new Error('음성 생성 시간이 초과되었습니다.');
    }
    
    // 3단계: audio_download_url에서 최종 음성 파일 다운로드
    const audioResponse = await fetch(audioDownloadUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`음성 파일 다운로드 실패: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
    
  } catch (error) {
    console.error('Typecast API 오류:', error);
    
    // Web Speech API로 대체
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }
};