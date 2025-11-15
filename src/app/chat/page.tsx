'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeMicButton } from '@/components/realtime/RealtimeMicButton';
import { Card, CardContent } from '@/components/ui/card';
import { textToSpeech, generateChatResponse } from '@/lib/muxlisa-client';
// import { generateGrokChatResponse } from '@/lib/grok-client'; // Groq AI - Muxlisa AI ishlatilmoqda

interface Message {
  text: string;
  type: 'ai' | 'user';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [childName, setChildName] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false); // Ovozli muloqot rejimi
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS funksiyasi - AI javoblarini o'qish (xuddi learn-realtime kabi)
  const speakText = useCallback(async (text: string) => {
    // Agar foydalanuvchi hozir yozayotgan yoki yozib turgan bo'lsa, TTS'ni to'xtatish
    if (inputText.trim().length > 0 || isRecording) {
      console.log('⚠️ User is typing or recording, skipping TTS');
      return;
    }
    
    if (isSpeaking) {
      console.log('⚠️ Already speaking, skipping...');
      return;
    }
    
    if (!text || !text.trim()) {
      console.log('⚠️ Empty text, skipping TTS');
      return;
    }
    
    try {
      setIsSpeaking(true);
      console.log('🔊 Starting TTS for AI response:', text.substring(0, 50) + '...');
      
      // Muxlisa TTS'ni ishlatish (maftuna ovoz bilan)
      const result = await textToSpeech(text, 'maftuna');
      
      console.log('🔊 TTS Result:', {
        hasError: !!result.error,
        hasAudioUrl: !!result.audio_url,
        hasAudioBase64: !!result.audio_base64,
        audioUrl: result.audio_url?.substring(0, 50),
        audioBase64Length: result.audio_base64?.length,
      });
      
      if (result.error) {
        console.warn('⚠️ Muxlisa TTS error:', result.error);
        // Muxlisa TTS ishlamasa, Web Speech API'ni fallback sifatida ishlatamiz
        console.log('💡 Muxlisa TTS ishlamadi, Web Speech API ishlatilmoqda');
        try {
          // Web Speech API'ni to'g'ridan-to'g'ri chaqiramiz
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uz-UZ';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            const voices = window.speechSynthesis.getVoices();
            const uzbekVoice = voices.find(voice => 
              voice.lang.includes('uz') || 
              voice.lang.includes('UZ') ||
              voice.name.toLowerCase().includes('uzbek') ||
              voice.name.toLowerCase().includes('turkish')
            );
            
            if (uzbekVoice) {
              utterance.voice = uzbekVoice;
            }
            
            utterance.onend = () => {
              console.log('✅ Web Speech API TTS completed');
              setIsSpeaking(false);
            };
            
            utterance.onerror = (event: any) => {
              console.error('❌ Web Speech API error:', event.error);
              setIsSpeaking(false);
            };
            
            window.speechSynthesis.speak(utterance);
          } else {
            console.warn('⚠️ Web Speech API not supported');
            setIsSpeaking(false);
          }
        } catch (webSpeechError) {
          console.error('❌ Web Speech API error:', webSpeechError);
          setIsSpeaking(false);
        }
      } else {
        // Muxlisa TTS audio'ni o'ynatish
        if (result.audio_url && result.audio_url !== 'web-speech-api') {
          console.log('🔊 Playing Muxlisa TTS audio from URL:', result.audio_url);
          try {
            const audio = new Audio(result.audio_url);
            audio.onended = () => {
              console.log('✅ Muxlisa TTS audio playback completed');
              setIsSpeaking(false);
            };
            audio.onerror = (err) => {
              console.error('❌ Muxlisa TTS audio playback error:', err);
              setIsSpeaking(false);
            };
            audio.onloadstart = () => {
              console.log('🔊 Muxlisa TTS audio loading started');
            };
            audio.oncanplay = () => {
              console.log('🔊 Muxlisa TTS audio ready to play');
            };
            await audio.play();
            console.log('✅ Muxlisa TTS audio playback started');
          } catch (playError) {
            console.error('❌ Error playing audio:', playError);
            setIsSpeaking(false);
          }
        } else if (result.audio_base64) {
          console.log('🔊 Playing Muxlisa TTS audio from base64, length:', result.audio_base64.length);
          try {
            // Audio format'ni aniqlash
            const audioDataUrl = `data:audio/mpeg;base64,${result.audio_base64}`;
            const audio = new Audio(audioDataUrl);
            audio.onended = () => {
              console.log('✅ Muxlisa TTS audio playback completed');
              setIsSpeaking(false);
            };
            audio.onerror = (err) => {
              console.error('❌ Muxlisa TTS audio playback error:', err);
              setIsSpeaking(false);
            };
            audio.onloadstart = () => {
              console.log('🔊 Muxlisa TTS audio loading started (base64)');
            };
            audio.oncanplay = () => {
              console.log('🔊 Muxlisa TTS audio ready to play (base64)');
            };
            await audio.play();
            console.log('✅ Muxlisa TTS audio playback started (base64)');
          } catch (playError) {
            console.error('❌ Error playing base64 audio:', playError);
            setIsSpeaking(false);
          }
        } else {
          // Web Speech API ishlatilgan (audio_url = 'web-speech-api')
          console.log('✅ Web Speech API TTS completed');
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsSpeaking(false);
    }
  }, [inputText, isRecording, isSpeaking]);

  useEffect(() => {
    const name = localStorage.getItem('bolajon_child_name') || 'Bola';
    setChildName(name);
    
    // Boshlang'ich AI xabari
    const initialMessage = `Salom ${name}! Men sizga harflarni o'rgatishga yordam beraman. Keling, real-time gaplashamiz! 🎉`;
    setMessages([
      {
        text: initialMessage,
        type: 'ai',
        timestamp: new Date(),
      },
    ]);
    
    // Boshlang'ich xabarni avtomatik o'qish o'chirilgan
    // Faqat foydalanuvchi "Qayta eshitish" tugmasini bosganda o'qiladi
  }, []);

  // WebSocket ulanishini yaratish
  const connectWebSocket = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return; // Allaqachon ulanadi
    }

    const childId = localStorage.getItem('bolajon_child_id') || '00000000-0000-0000-0000-000000000000';
    sessionIdRef.current = crypto.randomUUID();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    let wsUrl: string;
    if (apiUrl.startsWith('http://')) {
      wsUrl = apiUrl.replace('http://', 'ws://') + `/realtime/conversation/${sessionIdRef.current}?user_id=${childId}`;
    } else if (apiUrl.startsWith('https://')) {
      wsUrl = apiUrl.replace('https://', 'wss://') + `/realtime/conversation/${sessionIdRef.current}?user_id=${childId}`;
    } else {
      wsUrl = `ws://localhost:8000/api/realtime/conversation/${sessionIdRef.current}?user_id=${childId}`;
    }

    console.log('🔌 WebSocket connecting to:', wsUrl);
    setIsConnecting(true);
    
    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnecting(false);
      
      // Boshlang'ich xabar yuborish
      ws.send(JSON.stringify({
        type: 'text_message',
        text: 'Salom!',
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);
        
        if (data.type === 'ai_message' && data.text) {
          const aiMessage: Message = {
            text: data.text,
            type: 'ai',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Agar ovozli muloqot rejimi yoqilgan bo'lsa, AI javobini ovozli aytish
          if (data.text.trim() && isVoiceMode) {
            setTimeout(() => {
              if (!inputText.trim() && !isRecording) {
                speakText(data.text);
              }
            }, 500);
          }
        }
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ WebSocket error (bu normal, fallback ishlaydi):', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code);
      setIsConnecting(false);
    };
  };

  // Text orqali xabar yuborish
  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;

    // Text orqali yozilganda ovozli muloqot rejimini o'chiramiz
    setIsVoiceMode(false);

    const userMessage: Message = {
      text: text.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // WebSocket orqali yuborish
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'text_message',
        text: text.trim(),
      }));
    } else {
      // WebSocket ulanmasa, Muxlisa AI orqali javob olish (ovozli emas)
      generateAIResponse(text.trim(), false);
    }
  };

  // Mikrofon orqali xabar
  const handleTranscript = (text: string) => {
    if (!text || !text.trim()) return;
    
    // Ovozli muloqot rejimini yoqamiz
    setIsVoiceMode(true);
    
    const userMessage: Message = {
      text: text.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // WebSocket orqali yuborish
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'text_message',
        text: text.trim(),
      }));
    } else {
      // WebSocket ulanmasa, Muxlisa AI orqali javob olish
      generateAIResponse(text.trim(), true); // true = ovozli javob kerak
    }
  };

  // AI javob generatsiya qilish
  const generateAIResponse = async (userMessage: string, shouldSpeak: boolean = false) => {
    console.log('🤖 generateAIResponse chaqirildi:', userMessage);
    
    try {
      const childName = localStorage.getItem('bolajon_child_name') || 'Bola';
      const childAge = parseInt(localStorage.getItem('bolajon_child_age') || '5');
      const preferencesStr = localStorage.getItem('bolajon_child_preferences');
      const preferences = preferencesStr ? JSON.parse(preferencesStr) : [];
      
      console.log('👤 User info:', { childName, childAge, preferences });
      
      // Conversation history yaratish
      const conversationHistory = messages
        .slice(-10) // Oxirgi 10 ta xabar
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));
      
      console.log('💬 Conversation history:', conversationHistory);
      
      // Muxlisa AI'dan foydalanish
      const response = await generateChatResponse({
        message: userMessage,
        conversationHistory,
        childName,
        childAge,
        preferences,
      });
      
      console.log('✅ Muxlisa AI response received:', response);
      
      const aiMessage: Message = {
        text: response.response,
        type: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Agar ovozli muloqot rejimi yoqilgan bo'lsa yoki shouldSpeak = true bo'lsa, AI javobini ovozli aytish
      if (shouldSpeak || isVoiceMode) {
        setTimeout(() => {
          if (!inputText.trim() && !isRecording) {
            speakText(aiMessage.text);
          }
        }, 500);
      }
      
      // Agar harf taklif qilingan bo'lsa, learn-realtime sahifasiga o'tishni taklif qilish
      if (response.suggested_letter) {
        console.log('💡 Suggested letter:', response.suggested_letter);
      }
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      // Fallback javob
      const aiMessage: Message = {
        text: `Siz "${userMessage}" dedingiz. Tushundim! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz?`,
        type: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Fallback javobni ham ovozli aytish (agar ovozli muloqot rejimi yoqilgan bo'lsa)
      if (isVoiceMode) {
        setTimeout(() => {
          if (!inputText.trim() && !isRecording) {
            speakText(aiMessage.text);
          }
        }, 500);
      }
    }
  };

  // Enter bosilganda xabar yuborish
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage(inputText);
    }
  };

  // Mikrofon bosilganda WebSocket ulanishini yaratish
  const handleMicStart = () => {
    console.log('🎙️ Microphone started - ovozli muloqot rejimi yoqildi');
    setIsRecording(true);
    setIsVoiceMode(true); // Ovozli muloqot rejimini yoqamiz
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.log('🔌 Connecting WebSocket for microphone...');
      connectWebSocket();
    }
  };

  const handleMicStop = () => {
    console.log('🛑 Microphone stopped');
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎤 Real-time AI Suhbat
          </h1>
          <p className="text-gray-600">
            AI bilan real-time gaplashib harflarni o'rganish, ChatGPT kabi
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {message.type === 'ai' && (
                      <span className="text-2xl">🤖</span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {message.type === 'ai' && (
                          <button
                            onClick={() => speakText(message.text)}
                            disabled={isSpeaking}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            title="Qayta eshitish"
                          >
                            🔊 {isSpeaking ? 'O\'qilmoqda...' : 'Qayta eshitish'}
                          </button>
                        )}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Xabar yozing yoki mikrofonni bosing..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isConnecting}
            />
            <button
              onClick={() => sendTextMessage(inputText)}
              disabled={!inputText.trim() || isConnecting}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Yuborish
            </button>
          </div>

          {/* Microphone Button */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <RealtimeMicButton
                onTranscript={handleTranscript}
                onStart={handleMicStart}
                onStop={handleMicStop}
                disabled={isConnecting}
              />
              <p className="text-sm text-gray-600 mt-2">
                {isRecording ? '🎤 Yozib olinmoqda...' : '🎙️ Mikrofonni bosib gapiring'}
              </p>
            </div>
          </div>

          {/* Status */}
          {isConnecting && (
            <div className="text-center text-sm text-gray-500">
              <span className="animate-pulse">⏳ Ulanish...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

