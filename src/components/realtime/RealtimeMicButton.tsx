'use client';

import { useState, useEffect, useRef } from 'react';
import { speechToText } from '@/lib/muxlisa-client';

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
  const lastMessageRef = useRef<string>('');
  const messageCountRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsConnecting(true);
      
      // Mikrofon permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Web Speech API (STT) - real-time transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.warn('SpeechRecognition not available');
          return;
        }

        const recognition = new SpeechRecognition();
        
        recognition.lang = 'uz-UZ';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Final transcript ni yuborish
          if (finalTranscript.trim()) {
            console.log('Speech recognized:', finalTranscript);
            onTranscript(finalTranscript.trim());
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          
          // Network xatosi bo'lsa, Web Speech API'ni o'chirib, faqat MediaRecorder ishlatamiz
          if (event.error === 'network' || event.error === 'no-speech' || event.error === 'aborted') {
            console.warn('Web Speech API xatosi, MediaRecorder + Muxlisa STT ishlatilmoqda');
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (err) {
                console.warn('Error stopping recognition:', err);
              }
              recognitionRef.current = null;
            }
            // MediaRecorder davom etadi, audio Muxlisa STT'ga yuboriladi
            return;
          }
          
          // Boshqa xatolar uchun
          if (event.error === 'not-allowed') {
            alert('Mikrofon ruxsati berilmagan. Iltimos, browser sozlamalaridan ruxsat bering.');
            setIsConnecting(false);
            setIsRecording(false);
            return;
          }
          
          // Recognition qayta boshlashga harakat qilish (faqat ba'zi xatolar uchun)
          if (event.error !== 'no-speech' && recognitionRef.current && mediaRecorderRef.current?.state === 'recording') {
            setTimeout(() => {
              if (recognitionRef.current && mediaRecorderRef.current?.state === 'recording') {
                try {
                  recognitionRef.current.start();
                } catch (err) {
                  console.warn('Recognition restart after error failed:', err);
                }
              }
            }, 1000);
          }
        };
        
        recognition.onend = () => {
          // Agar hali recording davom etayotgan bo'lsa, qayta boshlash
          // isRecording state ni to'g'ri tekshirish uchun ref ishlatamiz
          if (recognitionRef.current && mediaRecorderRef.current?.state === 'recording') {
            try {
              recognition.start();
            } catch (err) {
              console.warn('Recognition restart error:', err);
            }
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        console.log('Web Speech API started');
        
        // Web Speech API ishga tushdi, recording ni boshlash
        setIsConnecting(false);
        setIsRecording(true);
        onStart?.();
      } else {
        console.warn('Web Speech API not supported, using MediaRecorder only');
      }

      // User ID ni localStorage dan olish yoki default
      const childId = localStorage.getItem('bolajon_child_id') || '00000000-0000-0000-0000-000000000000';
      const sessionId = crypto.randomUUID();
      
      // WebSocket ga ulanish (backend realtime endpoint)
      const wsUrl = `ws://localhost:8000/api/realtime/conversation/${sessionId}?user_id=${childId}`;
      console.log('WebSocket connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      // WebSocket ulanmasa ham demo rejimda ishlash
      const timeoutId = setTimeout(() => {
        if (websocketRef.current?.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket timeout, using demo mode');
          setIsConnecting(false);
          setIsRecording(true);
          onStart?.();
          
          // Demo rejimda audio yozish - Muxlisa STT API qo'llab-quvvatlaydigan formatda
          try {
            let mimeType = 'audio/webm'; // Default
            const supportedTypes = [
              'audio/webm',
              'audio/ogg',
              'audio/wav',
            ];
            
            // Browser qo'llab-quvvatlaydigan formatni topish
            for (const type of supportedTypes) {
              if (MediaRecorder.isTypeSupported(type)) {
                mimeType = type;
                break;
              }
            }
            
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: mimeType,
            });
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = () => {
              // Demo rejimda hech narsa yubormaymiz
            };
            mediaRecorder.start(3000); // Har 3 sekundda chunk
          } catch (err) {
            console.warn('Demo mode MediaRecorder error:', err);
          }
        }
      }, 3000); // 3 sekunddan keyin demo rejimga o'tish
      
      // WebSocket ulansa timeout ni bekor qilish
      ws.onopen = () => {
        clearTimeout(timeoutId);
        console.log('WebSocket connected successfully');
        setIsConnecting(false);
        setIsRecording(true);
        onStart?.();

        // MediaRecorder yaratish - Muxlisa STT API qo'llab-quvvatlaydigan formatda
        // Qo'llab-quvvatlanadigan formatlar: audio/webm (codecsiz), audio/ogg, audio/wav
        let mimeType = 'audio/webm'; // Default
        const supportedTypes = [
          'audio/webm',
          'audio/ogg',
          'audio/wav',
        ];
        
        // Browser qo'llab-quvvatlaydigan formatni topish
        for (const type of supportedTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
        
        console.log('MediaRecorder mimeType:', mimeType, 'Supported:', MediaRecorder.isTypeSupported(mimeType));
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        let lastChunkTime = 0;
        const CHUNK_INTERVAL = 3000; // 3 sekundda bir marta yuborish

        let chunkCounter = 0;
        let lastMuxlisaSTTTime = 0;
        const MUXLISA_STT_INTERVAL = 5000; // 5 sekundda bir marta Muxlisa STT'ga yuborish
        
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            chunkCounter++;
            
            // WebSocket orqali backend'ga yuborish (agar ochiq bo'lsa)
            if (ws.readyState === WebSocket.OPEN) {
              const now = Date.now();
              // Chunk larni kamroq yuborish (3 sekundda bir marta)
              if (now - lastChunkTime > CHUNK_INTERVAL) {
                lastChunkTime = now;
                // Real-time audio chunk yuborish
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64Audio = reader.result as string;
                  try {
                    ws.send(
                      JSON.stringify({
                        type: 'audio_chunk',
                        audio_base64: base64Audio.split(',')[1],
                      })
                    );
                  } catch (err) {
                    console.warn('Error sending audio chunk:', err);
                  }
                };
                reader.readAsDataURL(event.data);
              }
            } else {
              // WebSocket ulanmagan yoki Web Speech API ishlamasa, Muxlisa STT'ga yuborish
              const now = Date.now();
              if (now - lastMuxlisaSTTTime > MUXLISA_STT_INTERVAL && !recognitionRef.current) {
                lastMuxlisaSTTTime = now;
                // Audio chunk'ni Muxlisa STT'ga yuborish
                try {
                  const result = await speechToText(event.data);
                  if (result.text && result.text.trim()) {
                    console.log('Muxlisa STT real-time result:', result.text);
                    onTranscript(result.text.trim());
                  }
                } catch (err) {
                  console.warn('Error sending audio to Muxlisa STT:', err);
                }
              }
            }
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };

        // Demo rejimda ham ishlash uchun - audio yozishni boshlash
        try {
          mediaRecorder.start(3000); // Har 3 sekundda chunk yuborish (kamroq xabar)
          console.log('MediaRecorder started - mikrofon ishlamoqda');
        } catch (err) {
          console.warn('MediaRecorder start error:', err);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'ai_message') {
            const messageText = data.text || '';
            
            // Bo'sh xabarlarni filter qilish
            if (!messageText.trim()) {
              return;
            }
            
            // Takrorlanishni oldini olish
            if (messageText === lastMessageRef.current) {
              messageCountRef.current++;
              // Bir xil xabar 5 martadan ko'p takrorlansa, e'tibor bermaslik
              if (messageCountRef.current > 5) {
                return;
              }
            } else {
              lastMessageRef.current = messageText;
              messageCountRef.current = 1;
            }
            
            // Backend dan kelgan bo'sh xabarlarni filter qilish
            if (messageText.includes("Siz '' dedingiz") || 
                messageText.includes("Salom! Men sizga") ||
                messageText.trim().length < 2 ||
                messageText.length > 100) {
              return;
            }
            
            console.log('AI Response:', messageText);
            // Transcript callback chaqirish
            onTranscript(messageText);
            
            // TTS audio play qilish
            if (data.audio_url) {
              const audio = new Audio(data.audio_url);
              audio.play().catch(err => console.warn('Audio play error:', err));
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setIsRecording(false);
        // Demo rejimda ham ishlash uchun
        console.warn('WebSocket ulanmadi, demo rejimda davom etamiz');
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnecting(false);
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsConnecting(false);
      
      // Mikrofon permissions xatosi
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('Mikrofon ruxsati kerak. Iltimos, browser sozlamalaridan mikrofon ruxsatini bering.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          alert('Mikrofon topilmadi. Iltimos, mikrofon ulanganligini tekshiring.');
        } else {
          console.warn('Recording error, demo rejimda davom etamiz');
        }
      } else {
        console.warn('Recording error, demo rejimda davom etamiz');
      }
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // MediaRecorder to'xtatish va audio'ni Muxlisa STT'ga yuborish
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Audio chunk'larni birlashtirib, Muxlisa STT'ga yuborish
      if (audioChunksRef.current.length > 0) {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('Sending audio to Muxlisa STT, size:', audioBlob.size);
          
          const result = await speechToText(audioBlob);
          if (result.text && result.text.trim()) {
            console.log('Muxlisa STT result:', result.text);
            onTranscript(result.text.trim());
          }
        } catch (err) {
          console.error('Error sending audio to Muxlisa STT:', err);
        }
      }
      
      audioChunksRef.current = [];
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        disabled={disabled || isConnecting}
        className={`w-16 h-16 rounded-full ${
          isRecording
            ? 'bg-red-500 animate-pulse scale-110'
            : 'bg-blue-500 hover:bg-blue-600 scale-100'
        } transition-all duration-300 shadow-2xl flex items-center justify-center text-white text-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          boxShadow: isRecording
            ? '0 0 20px rgba(239, 68, 68, 0.6)'
            : '0 0 10px rgba(59, 130, 246, 0.4)',
        }}
      >
        {isConnecting ? (
          <div className="animate-spin text-lg">⏳</div>
        ) : isRecording ? (
          '🎤'
        ) : (
          '🎙️'
        )}
      </button>
    </div>
  );
}

