'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { recordAudio } from '@/lib/utils/audio';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  duration?: number;
}

export function VoiceRecorder({ onRecordingComplete, duration = 5000 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCountdown(Math.ceil(duration / 1000));

      // Countdown timer
      let remaining = Math.ceil(duration / 1000);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          stopRecording();
        }
      }, 1000);

      // Auto-stop after duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, duration);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Mikrofonga kirish imkoni bo\'lmadi. Iltimos, ruxsat bering.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsRecording(false);
    setCountdown(0);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        size="lg"
        className={`${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white text-xl px-8 py-6`}
      >
        {isRecording ? (
          <>
            ⏹️ To'xtatish {countdown > 0 && `(${countdown}s)`}
          </>
        ) : (
          '🎤 Yozib olishni boshlash'
        )}
      </Button>
      {isRecording && (
        <div className="text-sm text-gray-600 animate-pulse">
          Yozib olinmoqda...
        </div>
      )}
    </div>
  );
}

