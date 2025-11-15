'use client';

import { useState, useEffect, useRef } from 'react';
import { UZBEK_ALPHABET } from '@/data/alphabet';
import { LetterCard } from '@/components/learn/LetterCard';
import { WordPractice } from '@/components/learn/WordPractice';
import { VoiceRecorder } from '@/components/learn/VoiceRecorder';
import { AIFeedbackComponent } from '@/components/learn/AIFeedback';
import { ProgressBar } from '@/components/gamification/ProgressBar';
import { StarsDisplay } from '@/components/gamification/StarsDisplay';
import { useLearningStore } from '@/store/learning-store';
import { useUserStore } from '@/store/user-store';
import type { AIFeedback } from '@/types/api';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/lib/muxlisa-client';

export default function LearnPage() {
  const { currentLetterIndex, currentWordIndex, setCurrentLetterIndex, setCurrentWordIndex, currentFeedback, setCurrentFeedback } = useLearningStore();
  const { user } = useUserStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingLetter, setIsSpeakingLetter] = useState(false);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);
  
  // Audio cache - yozib olingan ovozlarni saqlash
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const letterAudioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const currentLetter = UZBEK_ALPHABET[currentLetterIndex];
  const currentWord = currentLetter?.words[currentWordIndex];

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!currentWord || !user) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('expectedWord', currentWord.word);
      formData.append('letter', currentLetter.letter);

      const response = await fetch('/api/speech/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentFeedback(result.data.feedback);

        // Update progress
        const score = result.data.feedback.isCorrect
          ? Math.floor(result.data.feedback.accuracy / 10) * 10
          : 0;

        await fetch('/api/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            letter: currentLetter.letter,
            letterIndex: currentLetterIndex,
            word: currentWord.word,
            isCorrect: result.data.feedback.isCorrect,
            score,
            accuracy: result.data.feedback.accuracy,
            userSpeech: result.data.transcribedText || '',
            aiFeedback: result.data.feedback.feedback || '',
            duration: 0, // Can be calculated from recording time
          }),
        });
      }
    } catch (error) {
      console.error('Error analyzing speech:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Harflar uchun o'zbek tilida to'g'ri talaffuz qilish uchun fonetik matnlar
  const getUzbekPhoneticText = (text: string, letterName?: string): string => {
    // Agar letterName bo'lsa, undan foydalanish (eng to'g'ri)
    if (letterName) {
      return letterName;
    }
    
    // Harflar uchun maxsus matnlar - Web Speech API uchun to'g'ri talaffuz qilish
    const letterPhonetics: Record<string, string> = {
      'A': 'a',
      'B': 'be',
      'D': 'de',
      'E': 'e',
      'F': 'ef',
      'G': 'ge',
      'H': 'ha',
      'I': 'i',
      'J': 'je',
      'K': 'ka',
      'L': 'el',
      'M': 'em',
      'N': 'en',
      'O': 'o',
      'P': 'pe',
      'Q': 'qe',
      'R': 'er',
      'S': 'es',
      'T': 'te',
      'U': 'u',
      'V': 've',
      'X': 'xa',
      'Y': 'ye',
      'Z': 'ze',
      'O\'': 'o',
      'G\'': 'ge',
      'Sh': 'sha',
      'Ch': 'cha',
      'Ng': 'en ge',
    };
    
    if (letterPhonetics[text]) {
      return letterPhonetics[text];
    }
    
    return text.toLowerCase();
  };
  
  // Fallback TTS funksiyasi - o'zbek tilida to'g'ri talaffuz qilish
  const fallbackTTS = (text: string, onEnd: () => void, letterName?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const phoneticText = getUzbekPhoneticText(text, letterName);
      const utterance = new SpeechSynthesisUtterance(phoneticText);
      
      const getVoices = () => window.speechSynthesis.getVoices();
      const voices = getVoices();
      
      const findBestVoice = (voiceList: SpeechSynthesisVoice[]) => {
        let voice = voiceList.find(v => v.lang.startsWith('tr'));
        if (voice) return voice;
        voice = voiceList.find(v => v.lang.startsWith('ru'));
        if (voice) return voice;
        voice = voiceList.find(v => v.lang.startsWith('kk'));
        if (voice) return voice;
        voice = voiceList.find(v => v.lang.startsWith('en'));
        if (voice) return voice;
        return voiceList[0];
      };
      
      const bestVoice = findBestVoice(voices);
      
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = 'tr-TR';
      }
      
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = getVoices();
          const updatedBestVoice = findBestVoice(updatedVoices);
          if (updatedBestVoice) {
            utterance.voice = updatedBestVoice;
            utterance.lang = updatedBestVoice.lang;
          }
          window.speechSynthesis.speak(utterance);
        };
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      onEnd();
    }
  };
  
  // Harfni o'qish - Muxlisa API dan to'g'ri ovoz olish
  const handlePlayLetter = async () => {
    if (!currentLetter || isSpeakingLetter) return;
    
    setIsSpeakingLetter(true);
    
    try {
      // Har safar yangi ovoz olish - cache ni skip qilish (Muxlisa API dan to'g'ri ovoz olish uchun)
      const letterText = currentLetter.name || currentLetter.letter;
      console.log('Muxlisa API ga yuborilayotgan matn:', letterText);
      
      // Muxlisa API dan olish - Maftuna ovozida
      const result = await textToSpeech(letterText, 'maftuna');
      console.log('🔊 Muxlisa API javobi:', result);
      
      let audio: HTMLAudioElement | null = null;
      
      // Muxlisa API dan kelgan audio ni ishlatish
      if (result.audio_base64) {
        // Base64 audio - birinchi navbatda base64 ni tekshirish
        audio = new Audio(`data:audio/mpeg;base64,${result.audio_base64}`);
        console.log('🔊 Muxlisa base64 audio ishlatilmoqda, length:', result.audio_base64.length);
      } else if (result.audio_url && result.audio_url !== 'web-speech-api') {
        // Audio URL dan yuklash
        audio = new Audio(result.audio_url);
        console.log('🔊 Muxlisa audio URL ishlatilmoqda:', result.audio_url);
      }
      
      if (audio) {
        // Muxlisa API dan kelgan audio ni ishlatish
        audio.onended = () => setIsSpeakingLetter(false);
        audio.onerror = (err) => {
          console.error('Muxlisa audio xatosi:', err);
          setIsSpeakingLetter(false);
          // Fallback ga o'tish
          fallbackTTS(currentLetter.letter, () => setIsSpeakingLetter(false), currentLetter.name);
        };
        
        // Cache ga saqlash (keyinchalik tezroq ishlatish uchun)
        const cacheKey = currentLetter.letter;
        letterAudioCacheRef.current.set(cacheKey, audio);
        
        await audio.play();
      } else {
        // Muxlisa API ishlamasa, fallback
        console.warn('Muxlisa API dan audio olinmadi, fallback ishlatilmoqda');
        fallbackTTS(currentLetter.letter, () => setIsSpeakingLetter(false), currentLetter.name);
      }
    } catch (error) {
      console.error('Error playing letter audio:', error);
      setIsSpeakingLetter(false);
      // Fallback ga o'tish
      fallbackTTS(currentLetter.letter, () => setIsSpeakingLetter(false), currentLetter.name);
    }
  };
  
  // So'zni o'qish - Muxlisa API dan to'g'ri ovoz olish
  const handlePlayAudio = async () => {
    if (!currentWord || isSpeakingWord) return;

    setIsPlayingAudio(true);
    setIsSpeakingWord(true);
    
    try {
      // Har safar yangi ovoz olish - cache ni skip qilish (Muxlisa API dan to'g'ri ovoz olish uchun)
      console.log('Muxlisa API ga yuborilayotgan so\'z:', currentWord.word);
      
      // Muxlisa API dan olish - Maftuna ovozida
      const result = await textToSpeech(currentWord.word, 'maftuna');
      console.log('🔊 Muxlisa API javobi:', result);
      
      let audio: HTMLAudioElement | null = null;
      
      // Muxlisa API dan kelgan audio ni ishlatish
      if (result.audio_base64) {
        // Base64 audio - birinchi navbatda base64 ni tekshirish
        audio = new Audio(`data:audio/mpeg;base64,${result.audio_base64}`);
        console.log('🔊 Muxlisa base64 audio ishlatilmoqda, length:', result.audio_base64.length);
      } else if (result.audio_url && result.audio_url !== 'web-speech-api') {
        // Audio URL dan yuklash
        audio = new Audio(result.audio_url);
        console.log('🔊 Muxlisa audio URL ishlatilmoqda:', result.audio_url);
      }
      
      if (audio) {
        // Muxlisa API dan kelgan audio ni ishlatish
        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
        };
        audio.onerror = (err) => {
          console.error('Muxlisa audio xatosi:', err);
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
          // Fallback ga o'tish
          fallbackTTS(currentWord.word, () => {
            setIsPlayingAudio(false);
            setIsSpeakingWord(false);
          });
        };
        
        // Cache ga saqlash (keyinchalik tezroq ishlatish uchun)
        const cacheKey = currentWord.word;
        audioCacheRef.current.set(cacheKey, audio);
        
        await audio.play();
      } else {
        // Muxlisa API ishlamasa, fallback
        console.warn('Muxlisa API dan audio olinmadi, fallback ishlatilmoqda');
        fallbackTTS(currentWord.word, () => {
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
      setIsSpeakingWord(false);
      // Fallback ga o'tish
      fallbackTTS(currentWord.word, () => {
        setIsPlayingAudio(false);
        setIsSpeakingWord(false);
      });
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < currentLetter.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentFeedback(null);
    } else if (currentLetterIndex < UZBEK_ALPHABET.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1);
      setCurrentWordIndex(0);
      setCurrentFeedback(null);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setCurrentFeedback(null);
    } else if (currentLetterIndex > 0) {
      setCurrentLetterIndex(currentLetterIndex - 1);
      setCurrentWordIndex(UZBEK_ALPHABET[currentLetterIndex - 1].words.length - 1);
      setCurrentFeedback(null);
    }
  };

  if (!currentLetter || !currentWord) {
    return <div className="container mx-auto px-4 py-16">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-9xl font-bold text-blue-600 mb-4">{currentLetter.letter}</div>
            <h1 className="text-3xl font-bold mb-4">
              {currentLetter.letter} harfini o'rganamiz
            </h1>
            {/* Harfni o'qish tugmasi */}
            <Button
              onClick={handlePlayLetter}
              disabled={isSpeakingLetter}
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 text-white mb-4"
            >
              {isSpeakingLetter ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Ovoz berilmoqda...
                </>
              ) : (
                <>
                  <span className="mr-2">🔊</span>
                  Harfni o'qish
                </>
              )}
            </Button>
          </div>
          <ProgressBar
            current={currentLetterIndex + 1}
            total={UZBEK_ALPHABET.length}
            label="Harflar"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {UZBEK_ALPHABET.slice(
            Math.max(0, currentLetterIndex - 1),
            Math.min(UZBEK_ALPHABET.length, currentLetterIndex + 2)
          ).map((letter, idx) => {
            const actualIndex = Math.max(0, currentLetterIndex - 1) + idx;
            return (
              <LetterCard
                key={letter.letter}
                letter={letter}
                isActive={actualIndex === currentLetterIndex}
                onClick={() => {
                  setCurrentLetterIndex(actualIndex);
                  setCurrentWordIndex(0);
                  setCurrentFeedback(null);
                }}
              />
            );
          })}
        </div>

        <div className="mb-8">
          <WordPractice
            word={currentWord}
            onPlayAudio={handlePlayAudio}
            isRecording={isAnalyzing}
            isPlayingAudio={isPlayingAudio}
          />
        </div>

        {!currentFeedback && (
          <div className="mb-8">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {currentFeedback && (
          <div className="mb-8">
            <AIFeedbackComponent feedback={currentFeedback} />
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={handlePreviousWord} variant="outline">
                ← Oldingi
              </Button>
              <Button onClick={handleNextWord} className="bg-blue-600 hover:bg-blue-700">
                Keyingi →
              </Button>
            </div>
          </div>
        )}

        {user && (
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-2">Sizning yulduzlaringiz:</p>
            <StarsDisplay stars={user.totalStars || 0} size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}

