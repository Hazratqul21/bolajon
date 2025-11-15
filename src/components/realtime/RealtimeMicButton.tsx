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
  const isStartingRef = useRef<boolean>(false); // Takrorlanishni oldini olish

  // MediaRecorder + Muxlisa STT funksiyasi
  const startMediaRecorderWithMuxlisa = (stream: MediaStream) => {
    // Agar allaqachon ishlamoqda bo'lsa, qaytaramiz
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('⚠️ MediaRecorder allaqachon ishlamoqda');
      return;
    }

    try {
      let mimeType = 'audio/webm';
      const supportedTypes = [
        'audio/webm',
        'audio/ogg',
        'audio/wav',
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log('📹 MediaRecorder mimeType:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      let lastMuxlisaSTTTime = 0;
      const MUXLISA_STT_INTERVAL = 3000; // 3 soniyaga kamaytirdik (tezroq javob uchun)
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Muxlisa STT'ni tezroq chaqiramiz
          const now = Date.now();
          if (now - lastMuxlisaSTTTime > MUXLISA_STT_INTERVAL && !recognitionRef.current) {
            lastMuxlisaSTTTime = now;
            try {
              console.log('🎤 Muxlisa STT ga audio yuborilmoqda...');
              const result = await speechToText(event.data);
              if (result.transcript && result.transcript.trim()) {
                const cleanedTranscript = result.transcript.trim();
                
                // Sonlarni filtrlash (0-9, bir xonali yoki ko'p xonali sonlar)
                const hasNumbers = /\d/.test(cleanedTranscript);
                if (hasNumbers) {
                  console.log('⚠️ Muxlisa STT: Sonlar tashlab ketildi:', cleanedTranscript);
                  return;
                }
                
                // Faqat sonlardan iborat bo'lsa, tashlab ketish
                if (/^\d+$/.test(cleanedTranscript.replace(/\s/g, ''))) {
                  console.log('⚠️ Muxlisa STT: Faqat sonlar, tashlab ketildi:', cleanedTranscript);
                  return;
                }
                
                // Qisqa transcriptlarni filtrlash (2 belgidan kam)
                if (cleanedTranscript.length < 3) {
                  console.log('⚠️ Muxlisa STT: Qisqa transcript, tashlab ketildi:', cleanedTranscript);
                  return;
                }
                
                // Keraksiz so'zlarni filtrlash
                const unwantedPhrases = [
                  'salom', 'hello', 'hi', 'hey',
                  'uh', 'um', 'ah', 'eh', 'hmm',
                  'the', 'a', 'an', 'is', 'are', 'was', 'were',
                  'bu', 'shu', 'u', 'o', 'ha', 'yo\'q',
                ];
                
                const words = cleanedTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                
                // Agar barcha so'zlar keraksiz bo'lsa, tashlab ketish
                const allUnwanted = words.every(word => 
                  unwantedPhrases.includes(word) || word.length <= 1
                );
                
                if (allUnwanted) {
                  console.log('⚠️ Muxlisa STT: Barcha so\'zlar keraksiz, tashlab ketildi:', cleanedTranscript);
                  return;
                }
                
                // Faqat haqiqiy so'zlar bo'lsa, qabul qilish
                const validWords = words.filter(word => 
                  word.length > 2 && !unwantedPhrases.includes(word) && !/^\d+$/.test(word)
                );
                
                if (validWords.length > 0 && cleanedTranscript.length >= 3) {
                  console.log('✅ Muxlisa STT result:', cleanedTranscript);
                  onTranscript(cleanedTranscript);
                } else {
                  console.log('⚠️ Muxlisa STT: Keraksiz transcript filtrlashdan o\'tdi:', cleanedTranscript);
                }
              } else if (result.error) {
                console.warn('⚠️ Muxlisa STT error:', result.error);
              }
            } catch (err) {
              console.warn('⚠️ Error sending audio to Muxlisa STT:', err);
            }
          }
        }
      };
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorder.start(2000); // 2 soniyada bir marta (tezroq javob uchun)
      console.log('✅ MediaRecorder started - darhol ishlamoqda');
      
      // State'ni yangilaymiz
      setIsConnecting(false);
      setIsRecording(true);
      isStartingRef.current = false;
      onStart?.();
    } catch (err) {
      console.error('❌ MediaRecorder start error:', err);
      setIsConnecting(false);
      setIsRecording(false);
      isStartingRef.current = false;
    }
  };

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
    // Takrorlanishni oldini olish
    if (isStartingRef.current || isRecording || isConnecting) {
      console.warn('⚠️ Mikrofon allaqachon ishlamoqda yoki ishga tushirilmoqda');
      return;
    }
    
    try {
      // Darhol state'ni yangilaymiz (foydalanuvchi ko'radi)
      isStartingRef.current = true;
      setIsConnecting(true);
      console.log('🎙️ Mikrofon ishga tushirilmoqda...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log('✅ Mikrofon ruxsati olindi');
      
      // Ruxsat olgandan keyin recording state'ni yangilaymiz
      setIsRecording(true);
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.warn('SpeechRecognition not available, using MediaRecorder + Muxlisa STT');
          // MediaRecorder'ni ishga tushiramiz
          startMediaRecorderWithMuxlisa(stream);
          return;
        }

        const recognition = new SpeechRecognition();
        
        // O'zbek tilini to'g'ri sozlash
        recognition.lang = 'uz-UZ';
        recognition.continuous = true;
        recognition.interimResults = false; // Faqat final natijalarni olish (keraksiz narsalarni oldini olish uchun)
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          
          // Faqat final natijalarni olamiz (interimResults = false bo'lgani uchun)
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          
          // Faqat final transcript'larni qabul qilamiz (keraksiz narsalarni oldini olish uchun)
          if (finalTranscript.trim()) {
            const cleanedTranscript = finalTranscript.trim();
            
            // Sonlarni filtrlash (0-9, bir xonali yoki ko'p xonali sonlar)
            const hasNumbers = /\d/.test(cleanedTranscript);
            if (hasNumbers) {
              console.log('⚠️ Web Speech API: Sonlar tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Faqat sonlardan iborat bo'lsa, tashlab ketish
            if (/^\d+$/.test(cleanedTranscript.replace(/\s/g, ''))) {
              console.log('⚠️ Web Speech API: Faqat sonlar, tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Qisqa transcriptlarni filtrlash (2 belgidan kam)
            if (cleanedTranscript.length < 3) {
              console.log('⚠️ Web Speech API: Qisqa transcript, tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Keraksiz so'zlarni filtrlash
            const unwantedPhrases = [
              'salom', 'hello', 'hi', 'hey',
              'uh', 'um', 'ah', 'eh', 'hmm',
              'the', 'a', 'an', 'is', 'are', 'was', 'were',
              'bu', 'shu', 'u', 'o', 'ha', 'yo\'q',
            ];
            
            // So'zlarni ajratib olish va filtrlash
            const words = cleanedTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
            
            // Agar barcha so'zlar keraksiz bo'lsa, tashlab ketish
            const allUnwanted = words.every(word => 
              unwantedPhrases.includes(word) || word.length <= 1
            );
            
            if (allUnwanted) {
              console.log('⚠️ Web Speech API: Barcha so\'zlar keraksiz, tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Faqat haqiqiy so'zlar bo'lsa, qabul qilish
            const validWords = words.filter(word => 
              word.length > 2 && !unwantedPhrases.includes(word) && !/^\d+$/.test(word)
            );
            
            // Agar kamida 1 ta to'g'ri so'z bo'lsa va uzunligi 3 dan katta bo'lsa
            if (validWords.length > 0 && cleanedTranscript.length >= 3) {
              console.log('✅ Web Speech API recognized (final):', cleanedTranscript);
              onTranscript(cleanedTranscript);
            } else {
              console.log('⚠️ Keraksiz transcript filtrlashdan o\'tdi:', cleanedTranscript);
            }
          }
        };
        
        recognition.onerror = (event: any) => {
          const errorType = event.error || 'Unknown';
          
          // "aborted" - bu normal, chunki foydalanuvchi yoki kod to'xtatgan
          if (errorType === 'aborted') {
            console.log('ℹ️ Speech recognition aborted (normal)');
            return;
          }
          
          // "no-speech" - bu ham normal, chunki foydalanuvchi gapirmagan
          if (errorType === 'no-speech') {
            console.log('ℹ️ No speech detected (normal)');
            return;
          }
          
          // "network" va boshqa xatolarni warning sifatida ko'rsatamiz
          if (errorType === 'network') {
            console.warn('⚠️ Web Speech API network error, MediaRecorder + Muxlisa STT ishlatilmoqda');
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (err) {
                console.warn('Error stopping recognition:', err);
              }
              recognitionRef.current = null;
            }
            return;
          }
          
          // Boshqa xatolarni warning sifatida ko'rsatamiz
          console.warn('⚠️ Speech recognition error:', errorType);
          
          if (event.error === 'not-allowed') {
            alert('Mikrofon ruxsati berilmagan. Iltimos, browser sozlamalaridan ruxsat bering.');
            setIsConnecting(false);
            setIsRecording(false);
            return;
          }
          
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
          // Web Speech API to'xtasa, qayta ishga tushiramiz
          if (recognitionRef.current && isRecording) {
            try {
              console.log('🔄 Web Speech API qayta ishga tushirilmoqda...');
              recognitionRef.current.start();
            } catch (err) {
              console.warn('⚠️ Recognition restart error:', err);
              // Agar qayta ishga tushirishda xato bo'lsa, MediaRecorder ishlatamiz
              if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                console.log('💡 Web Speech API ishlamayapti, MediaRecorder ishlatilmoqda');
                startMediaRecorderWithMuxlisa(stream);
              }
            }
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
        console.log('✅ Web Speech API started - darhol ishlamoqda');
        
        // State allaqachon yangilangan, faqat callback chaqiramiz
        setIsConnecting(false);
        isStartingRef.current = false;
        onStart?.();
      } else {
        // Web Speech API bo'lmasa ham MediaRecorder ishlatamiz
        console.log('ℹ️ Web Speech API not supported, using MediaRecorder + Muxlisa STT');
        // Darhol MediaRecorder'ni ishga tushiramiz
        startMediaRecorderWithMuxlisa(stream);
        return; // Web Speech API bo'lmasa, MediaRecorder ishlatamiz va qaytaramiz
      }

      // Web Speech API ishlayotgan bo'lsa ham, MediaRecorder'ni ham ishga tushiramiz (fallback uchun)
      // Lekin Web Speech API asosiy bo'ladi
      startMediaRecorderWithMuxlisa(stream);

      const childId = localStorage.getItem('bolajon_child_id') || '00000000-0000-0000-0000-000000000000';
      const sessionId = crypto.randomUUID();
      
      // Backend URL ni environment variable dan olish yoki default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      // WebSocket URL ni yaratish
      let wsUrl: string;
      if (apiUrl.startsWith('http://')) {
        wsUrl = apiUrl.replace('http://', 'ws://') + `/realtime/conversation/${sessionId}?user_id=${childId}`;
      } else if (apiUrl.startsWith('https://')) {
        wsUrl = apiUrl.replace('https://', 'wss://') + `/realtime/conversation/${sessionId}?user_id=${childId}`;
      } else {
        // Agar protocol bo'lmasa, default qo'shish
        wsUrl = `ws://localhost:8000/api/realtime/conversation/${sessionId}?user_id=${childId}`;
      }
      console.log('🔌 WebSocket connecting to:', wsUrl);
      console.log('🔌 API URL from env:', apiUrl);
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      // WebSocket timeout (agar ulanmasa)
      const timeoutId = setTimeout(() => {
        if (websocketRef.current?.readyState !== WebSocket.OPEN) {
          console.log('ℹ️ WebSocket ulanmadi, MediaRecorder + Muxlisa STT ishlatilmoqda');
        }
      }, 1000);
      
      ws.onopen = () => {
        clearTimeout(timeoutId);
        console.log('✅ WebSocket connected successfully');
        setIsConnecting(false);
        setIsRecording(true);
        isStartingRef.current = false;
        onStart?.();

        let mimeType = 'audio/webm';
        const supportedTypes = [
          'audio/webm',
          'audio/ogg',
          'audio/wav',
        ];
        
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
        const CHUNK_INTERVAL = 3000;

        let lastMuxlisaSTTTime = 0;
        const MUXLISA_STT_INTERVAL = 5000;
        
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            
            if (ws.readyState === WebSocket.OPEN) {
              const now = Date.now();
              if (now - lastChunkTime > CHUNK_INTERVAL) {
                lastChunkTime = now;
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
              // WebSocket ulanmasa va Web Speech API ishlamasa, Muxlisa STT ishlatamiz
              // Lekin Web Speech API ishlayotgan bo'lsa, Muxlisa STT'ni ishlatmaymiz
              if (!recognitionRef.current) {
                const now = Date.now();
                if (now - lastMuxlisaSTTTime > MUXLISA_STT_INTERVAL) {
                  lastMuxlisaSTTTime = now;
                  try {
                    console.log('🎤 Muxlisa STT ga audio yuborilmoqda (WebSocket ulanmagan, Web Speech API ishlamayapti)...');
                    const result = await speechToText(event.data);
                    if (result.transcript && result.transcript.trim()) {
                      const cleanedTranscript = result.transcript.trim();
                      
                      // Sonlarni filtrlash (0-9, bir xonali yoki ko'p xonali sonlar)
                      const hasNumbers = /\d/.test(cleanedTranscript);
                      if (hasNumbers) {
                        console.log('⚠️ Muxlisa STT (WebSocket): Sonlar tashlab ketildi:', cleanedTranscript);
                        return;
                      }
                      
                      // Faqat sonlardan iborat bo'lsa, tashlab ketish
                      if (/^\d+$/.test(cleanedTranscript.replace(/\s/g, ''))) {
                        console.log('⚠️ Muxlisa STT (WebSocket): Faqat sonlar, tashlab ketildi:', cleanedTranscript);
                        return;
                      }
                      
                      // Qisqa transcriptlarni filtrlash (2 belgidan kam)
                      if (cleanedTranscript.length < 3) {
                        console.log('⚠️ Muxlisa STT (WebSocket): Qisqa transcript, tashlab ketildi:', cleanedTranscript);
                        return;
                      }
                      
                      // Keraksiz so'zlarni filtrlash
                      const unwantedPhrases = [
                        'salom', 'hello', 'hi', 'hey',
                        'uh', 'um', 'ah', 'eh', 'hmm',
                        'the', 'a', 'an', 'is', 'are', 'was', 'were',
                        'bu', 'shu', 'u', 'o', 'ha', 'yo\'q',
                      ];
                      
                      const words = cleanedTranscript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                      
                      // Agar barcha so'zlar keraksiz bo'lsa, tashlab ketish
                      const allUnwanted = words.every(word => 
                        unwantedPhrases.includes(word) || word.length <= 1
                      );
                      
                      if (allUnwanted) {
                        console.log('⚠️ Muxlisa STT (WebSocket): Barcha so\'zlar keraksiz, tashlab ketildi:', cleanedTranscript);
                        return;
                      }
                      
                      // Faqat haqiqiy so'zlar bo'lsa, qabul qilish
                      const validWords = words.filter(word => 
                        word.length > 2 && !unwantedPhrases.includes(word) && !/^\d+$/.test(word)
                      );
                      
                      if (validWords.length > 0 && cleanedTranscript.length >= 3) {
                        console.log('✅ Muxlisa STT real-time result:', cleanedTranscript);
                        onTranscript(cleanedTranscript);
                      } else {
                        console.log('⚠️ Muxlisa STT: Keraksiz transcript filtrlashdan o\'tdi:', cleanedTranscript);
                      }
                    } else if (result.error) {
                      console.warn('⚠️ Muxlisa STT error:', result.error);
                    }
                  } catch (err) {
                    console.warn('⚠️ Error sending audio to Muxlisa STT:', err);
                  }
                }
              }
            }
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };

        try {
          mediaRecorder.start(3000);
          console.log('✅ MediaRecorder started - mikrofon ishlamoqda');
        } catch (err) {
          console.error('❌ MediaRecorder start error:', err);
          setIsConnecting(false);
          setIsRecording(false);
          isStartingRef.current = false;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'ai_message') {
            const messageText = data.text || '';
            
            if (!messageText.trim()) {
              return;
            }
            
            if (messageText === lastMessageRef.current) {
              messageCountRef.current++;
              if (messageCountRef.current > 5) {
                return;
              }
            } else {
              lastMessageRef.current = messageText;
              messageCountRef.current = 1;
            }
            
            // Sonlarni filtrlash
            const hasNumbers = /\d/.test(messageText);
            if (hasNumbers) {
              console.log('⚠️ WebSocket: Sonlar tashlab ketildi:', messageText);
              return;
            }
            
            // Faqat sonlardan iborat bo'lsa, tashlab ketish
            if (/^\d+$/.test(messageText.replace(/\s/g, ''))) {
              console.log('⚠️ WebSocket: Faqat sonlar, tashlab ketildi:', messageText);
              return;
            }
            
            if (messageText.includes("Siz '' dedingiz") || 
                messageText.includes("Salom! Men sizga") ||
                messageText.trim().length < 2 ||
                messageText.length > 100) {
              return;
            }
            
            console.log('AI Response:', messageText);
            onTranscript(messageText);
            
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
        // WebSocket xatosi - bu normal, chunki backend ulanmasa ham MediaRecorder ishlaydi
        // Faqat debug rejimda ko'rsatamiz
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ WebSocket ulanmadi (bu normal, MediaRecorder ishlaydi):', error);
        }
        // WebSocket xatosi bo'lsa ham MediaRecorder ishlaydi, shuning uchun xatoni e'tiborsiz qoldiramiz
      };
      
      ws.onclose = (event) => {
        // WebSocket yopilgan - bu normal, chunki timeout bo'lsa yoki backend ulanmasa
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 WebSocket closed:', event.code, event.reason || 'Normal closure');
        }
        // WebSocket yopilsa ham MediaRecorder ishlaydi
        // Faqat agar recording bo'lmasa va xato kodi bo'lsa, state'ni yangilaymiz
        if (event.code !== 1000 && event.code !== 1001 && !isRecording && !mediaRecorderRef.current) {
          // Agar MediaRecorder ham ishlamasa, state'ni yangilaymiz
          setIsConnecting(false);
          setIsRecording(false);
          isStartingRef.current = false;
        }
      };
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setIsConnecting(false);
      setIsRecording(false);
      isStartingRef.current = false;
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('❌ Mikrofon ruxsati kerak. Iltimos, browser sozlamalaridan mikrofon ruxsatini bering.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          alert('❌ Mikrofon topilmadi. Iltimos, mikrofon ulanganligini tekshiring.');
        } else {
          console.warn('⚠️ Recording error:', error.message);
        }
      } else {
        console.warn('⚠️ Recording error:', error);
      }
    }
  };

  const stopRecording = async () => {
    console.log('🛑 Mikrofon to\'xtatilmoqda...');
    
    // Barcha state'larni to'g'ri to'xtatish
    setIsRecording(false);
    setIsConnecting(false);
    isStartingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort(); // To'liq to'xtatish
      } catch (err) {
        console.warn('⚠️ Error stopping recognition:', err);
      }
      recognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('✅ MediaRecorder to\'xtatildi');
      } catch (err) {
        console.warn('⚠️ Error stopping MediaRecorder:', err);
      }
      
      if (audioChunksRef.current.length > 0) {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('📤 Sending audio to Muxlisa STT, size:', audioBlob.size);
          
          const result = await speechToText(audioBlob);
          if (result.transcript && result.transcript.trim()) {
            const cleanedTranscript = result.transcript.trim();
            
            // Sonlarni filtrlash
            const hasNumbers = /\d/.test(cleanedTranscript);
            if (hasNumbers) {
              console.log('⚠️ Muxlisa STT (stop): Sonlar tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Faqat sonlardan iborat bo'lsa, tashlab ketish
            if (/^\d+$/.test(cleanedTranscript.replace(/\s/g, ''))) {
              console.log('⚠️ Muxlisa STT (stop): Faqat sonlar, tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            // Qisqa transcriptlarni filtrlash
            if (cleanedTranscript.length < 3) {
              console.log('⚠️ Muxlisa STT (stop): Qisqa transcript, tashlab ketildi:', cleanedTranscript);
              return;
            }
            
            console.log('✅ Muxlisa STT result:', cleanedTranscript);
            onTranscript(cleanedTranscript);
          }
        } catch (err) {
          console.error('❌ Error sending audio to Muxlisa STT:', err);
        }
      }
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = null; // Reference'ni tozalash
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('✅ Audio track stopped');
      });
      streamRef.current = null;
    }
    
    if (websocketRef.current) {
      try {
        if (websocketRef.current.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify({ type: 'end_session' }));
        }
        websocketRef.current.close();
        console.log('✅ WebSocket closed');
      } catch (err) {
        console.warn('⚠️ Error closing WebSocket:', err);
      }
      websocketRef.current = null;
    }
    
    console.log('✅ Mikrofon to\'xtatildi - qayta ishga tushirishga tayyor');
    onStop?.();
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Agar ishlamoqda bo'lsa, to'xtatish
    if (isRecording || isConnecting) {
      console.log('🛑 Mikrofon to\'xtatilmoqda...');
      await stopRecording();
    } else {
      // Darhol ishga tushirish (bir marta bosish kifoya)
      console.log('🎙️ Mikrofon ishga tushirilmoqda...');
      startRecording();
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        disabled={disabled || (isConnecting && !isRecording)}
        type="button"
        className={`w-16 h-16 rounded-full ${
          isRecording
            ? 'bg-red-500 animate-pulse scale-110'
            : isConnecting
            ? 'bg-yellow-500 scale-100'
            : 'bg-blue-500 hover:bg-blue-600 scale-100'
        } transition-all duration-300 shadow-2xl flex items-center justify-center text-white text-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
        style={{
          boxShadow: isRecording
            ? '0 0 20px rgba(239, 68, 68, 0.6)'
            : isConnecting
            ? '0 0 15px rgba(234, 179, 8, 0.5)'
            : '0 0 10px rgba(59, 130, 246, 0.4)',
        }}
        title={isRecording ? 'Mikrofon ishlamoqda (bosib to\'xtating)' : isConnecting ? 'Mikrofon ishga tushirilmoqda...' : 'Mikrofonni bosib ishga tushiring'}
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

