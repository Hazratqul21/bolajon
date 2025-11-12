'use client';

import { useState, useEffect, useRef } from 'react';

interface RealtimeMicButtonProps {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

export function RealtimeMicButton({
  onTranscript,
  onStart,
  onStop,
  disabled = false,
}: RealtimeMicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // WebSocket ga ulanish (backend realtime endpoint)
      const sessionId = crypto.randomUUID();
      const ws = new WebSocket(`ws://localhost:8000/api/realtime/conversation/${sessionId}?user_id=...&lesson_id=...`);
      websocketRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsRecording(true);
        onStart?.();

        // MediaRecorder yaratish
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            // Real-time audio chunk yuborish
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              ws.send(
                JSON.stringify({
                  type: 'audio_chunk',
                  audio_base64: base64Audio.split(',')[1],
                })
              );
            };
            reader.readAsDataURL(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(100); // Har 100ms da chunk yuborish
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ai_message') {
          // AI javobini ko'rsatish
          console.log('AI Response:', data.text);
          // TTS audio play qilish
          if (data.audio_url) {
            const audio = new Audio(data.audio_url);
            audio.play();
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsConnecting(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (websocketRef.current) {
      websocketRef.current.send(JSON.stringify({ type: 'end_session' }));
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsRecording(false);
    onStop?.();
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <button
        onClick={handleClick}
        disabled={disabled || isConnecting}
        className={`w-32 h-32 rounded-full ${
          isRecording
            ? 'bg-red-500 animate-pulse scale-110'
            : 'bg-blue-500 hover:bg-blue-600 scale-100'
        } transition-all duration-300 shadow-2xl pointer-events-auto flex items-center justify-center text-white text-4xl`}
        style={{
          boxShadow: isRecording
            ? '0 0 40px rgba(239, 68, 68, 0.6)'
            : '0 0 20px rgba(59, 130, 246, 0.4)',
        }}
      >
        {isConnecting ? (
          <div className="animate-spin">⏳</div>
        ) : isRecording ? (
          '🎤'
        ) : (
          '🎙️'
        )}
      </button>
    </div>
  );
}

