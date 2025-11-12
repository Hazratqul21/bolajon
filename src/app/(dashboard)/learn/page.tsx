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

  // Harfni o'qish - yozib olish va saqlash
  const handlePlayLetter = async () => {
    if (!currentLetter || isSpeakingLetter) return;
    
    setIsSpeakingLetter(true);
    
    try {
      // Cache dan tekshirish
      const cacheKey = currentLetter.letter;
      if (letterAudioCacheRef.current.has(cacheKey)) {
        const cachedAudio = letterAudioCacheRef.current.get(cacheKey)!;
        cachedAudio.currentTime = 0;
        cachedAudio.onended = () => setIsSpeakingLetter(false);
        cachedAudio.onerror = () => setIsSpeakingLetter(false);
        await cachedAudio.play();
        return;
      }
      
      // Muxlisa API dan olish
      const result = await textToSpeech(currentLetter.letter, 'child_female');
      
      let audio: HTMLAudioElement;
      
      if (result.audio_url && result.audio_url !== 'web-speech-api') {
        audio = new Audio(result.audio_url);
      } else if (result.audio_base64) {
        audio = new Audio(`data:audio/mpeg;base64,${result.audio_base64}`);
      } else {
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(currentLetter.letter);
          const voices = window.speechSynthesis.getVoices();
          const bestVoice = voices.find(v => v.lang.startsWith('tr')) || voices.find(v => v.lang.startsWith('ru')) || voices[0];
          if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang;
          }
          utterance.rate = 0.7;
          utterance.onend = () => setIsSpeakingLetter(false);
          utterance.onerror = () => setIsSpeakingLetter(false);
          window.speechSynthesis.speak(utterance);
          setIsSpeakingLetter(false);
          return;
        } else {
          setIsSpeakingLetter(false);
          return;
        }
      }
      
      // Audio ni cache ga saqlash
      audio.onended = () => setIsSpeakingLetter(false);
      audio.onerror = () => setIsSpeakingLetter(false);
      letterAudioCacheRef.current.set(cacheKey, audio);
      await audio.play();
    } catch (error) {
      console.error('Error playing letter audio:', error);
      setIsSpeakingLetter(false);
    }
  };
  
  // So'zni o'qish - yozib olish va saqlash
  const handlePlayAudio = async () => {
    if (!currentWord || isSpeakingWord) return;

    setIsPlayingAudio(true);
    setIsSpeakingWord(true);
    
    try {
      // Cache dan tekshirish
      const cacheKey = currentWord.word;
      if (audioCacheRef.current.has(cacheKey)) {
        const cachedAudio = audioCacheRef.current.get(cacheKey)!;
        cachedAudio.currentTime = 0;
        cachedAudio.onended = () => {
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
        };
        cachedAudio.onerror = () => {
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
        };
        await cachedAudio.play();
        return;
      }
      
      // Muxlisa API dan olish
      const result = await textToSpeech(currentWord.word, 'child_female');
      
      let audio: HTMLAudioElement;
      
      if (result.audio_url && result.audio_url !== 'web-speech-api') {
        audio = new Audio(result.audio_url);
      } else if (result.audio_base64) {
        audio = new Audio(`data:audio/mpeg;base64,${result.audio_base64}`);
      } else {
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(currentWord.word);
          const voices = window.speechSynthesis.getVoices();
          const bestVoice = voices.find(v => v.lang.startsWith('tr')) || voices.find(v => v.lang.startsWith('ru')) || voices[0];
          if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang;
          }
          utterance.rate = 0.7;
          utterance.onend = () => {
            setIsPlayingAudio(false);
            setIsSpeakingWord(false);
          };
          utterance.onerror = () => {
            setIsPlayingAudio(false);
            setIsSpeakingWord(false);
          };
          window.speechSynthesis.speak(utterance);
          return;
        } else {
          setIsPlayingAudio(false);
          setIsSpeakingWord(false);
          return;
        }
      }
      
      // Audio ni cache ga saqlash
      audio.onended = () => {
        setIsPlayingAudio(false);
        setIsSpeakingWord(false);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setIsSpeakingWord(false);
      };
      audioCacheRef.current.set(cacheKey, audio);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
      setIsSpeakingWord(false);
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
            <StarsDisplay stars={user.totalStars} size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}

