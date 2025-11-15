'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeMicButton } from '@/components/realtime/RealtimeMicButton';
import { Card, CardContent } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { textToSpeech, generateWordsByInterest } from '@/lib/muxlisa-client';

export default function LearnRealtimePage() {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ text: string; type: 'ai' | 'user' }>>([]);
  const [exampleWords, setExampleWords] = useState<string[]>([]);
  const [exampleImages, setExampleImages] = useState<string[]>([]);
  const [childName, setChildName] = useState<string>('');
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [letterProgress, setLetterProgress] = useState<number>(0); // Progress 0-100
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // O'zbek alifbosi to'g'ri tartibi
  const allLetters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];

  // Helper functions - must be declared before useEffect
  const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    // localStorage dan ma'lumotlarni olish
    const name = localStorage.getItem('bolajon_child_name') || 'Bola';
    setChildName(name);
    
    // O'rganilgan harflarni localStorage'dan olish
    const learnedLettersStr = localStorage.getItem('bolajon_learned_letters');
    if (learnedLettersStr) {
      try {
        const letters = JSON.parse(learnedLettersStr);
        setLearnedLetters(new Set(Array.isArray(letters) ? letters : []));
      } catch (e) {
        console.warn('Learned letters parse error:', e);
      }
    }
    
    // Boshlang'ich AI xabari
    const initialMessage = `Salom ${name}! Men sizga harflarni o'rgatishga yordam beraman. Keling, boshlaymiz!`;
    setAiMessages([
      {
        text: initialMessage,
        type: 'ai',
      },
    ]);
    setCurrentLetter('A');
    
    // A harfi uchun progress'ni localStorage'dan olish
    const savedProgress = localStorage.getItem('bolajon_letter_progress_A');
    if (savedProgress) {
      const progress = parseInt(savedProgress, 10);
      setLetterProgress(isNaN(progress) ? 0 : progress);
    }
    
    // Boshlang'ich xabarni o'qish
    setTimeout(() => {
      speakAiMessage(initialMessage);
    }, 1000);
    // OpenAI "miya" orqali so'zlarni generatsiya qilish
    (async () => {
      try {
        const words = await getExampleWords('A');
        setExampleWords(words);
        loadImagesForWords(words);
      } catch (error) {
        console.error('Error generating words:', error);
        const words = getExampleWordsSync('A');
        setExampleWords(words);
        loadImagesForWords(words);
      }
    })();
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentLetter) return;
      
      if (e.key === 'ArrowLeft' && currentLetter !== 'A') {
        const currentIndex = allLetters.indexOf(currentLetter);
        const prevIndex = currentIndex === 0 ? allLetters.length - 1 : currentIndex - 1;
        const prevLetter = allLetters[prevIndex];
        // Direct state update instead of calling handleLetterSelect
        setCurrentLetter(prevLetter);
        setShowLibrary(false);
        
        // Harf progress'ni localStorage'dan olish
        const savedProgress = localStorage.getItem(`bolajon_letter_progress_${prevLetter}`);
        if (savedProgress) {
          const progress = parseInt(savedProgress, 10);
          setLetterProgress(isNaN(progress) ? 0 : progress);
        } else {
          setLetterProgress(learnedLetters.has(prevLetter) ? 100 : 0);
        }
        const aiMessage = `Endi ${prevLetter} harfini o'rganamiz!`;
        setAiMessages((prev) => [
          ...prev,
          { text: aiMessage, type: 'ai' },
        ]);
        speakLetter(prevLetter);
        // AI xabarni ham o'qish
        setTimeout(() => {
          speakAiMessage(aiMessage);
        }, 500);
        // OpenAI "miya" orqali so'zlarni generatsiya qilish
        (async () => {
          try {
            const words = await getExampleWords(prevLetter);
            setExampleWords(words);
            loadImagesForWords(words);
          } catch (error) {
            console.error('Error generating words:', error);
            const words = getExampleWordsSync(prevLetter);
            setExampleWords(words);
            loadImagesForWords(words);
          }
        })();
      } else if (e.key === 'ArrowRight' && currentLetter !== 'Ng') {
        const currentIndex = allLetters.indexOf(currentLetter);
        const nextIndex = (currentIndex + 1) % allLetters.length;
        const nextLetter = allLetters[nextIndex];
        // Direct state update instead of calling handleLetterSelect
        setCurrentLetter(nextLetter);
        setShowLibrary(false);
        
        // Harf progress'ni localStorage'dan olish
        const savedProgress = localStorage.getItem(`bolajon_letter_progress_${nextLetter}`);
        if (savedProgress) {
          const progress = parseInt(savedProgress, 10);
          setLetterProgress(isNaN(progress) ? 0 : progress);
        } else {
          setLetterProgress(learnedLetters.has(nextLetter) ? 100 : 0);
        }
        const aiMessage = `Endi ${nextLetter} harfini o'rganamiz!`;
        setAiMessages((prev) => [
          ...prev,
          { text: aiMessage, type: 'ai' },
        ]);
        // AI xabarni ham o'qish
        setTimeout(() => {
          speakAiMessage(aiMessage);
        }, 500);
        speakLetter(nextLetter);
        // OpenAI "miya" orqali so'zlarni generatsiya qilish
        (async () => {
          try {
            const words = await getExampleWords(nextLetter);
            setExampleWords(words);
            loadImagesForWords(words);
          } catch (error) {
            console.error('Error generating words:', error);
            const words = getExampleWordsSync(nextLetter);
            setExampleWords(words);
            loadImagesForWords(words);
          }
        })();
      } else if (e.key === 'Escape') {
        setShowLibrary(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLetter]);

  const lastTranscriptRef = useRef<string>('');
  const lastTranscriptTimeRef = useRef<number>(0);

  // Yutuqlarni tekshirish va ochish funksiyasi
  const checkAndUnlockAchievements = (updatedLetters: Set<string>) => {
    console.log('🔍 Yutuqlarni tekshirish, o\'rganilgan harflar soni:', updatedLetters.size);
    console.log('🔍 O\'rganilgan harflar:', Array.from(updatedLetters));
    
    const achievementsStr = localStorage.getItem('bolajon_achievements');
    
    // Default yutuqlar (gamification/page.tsx formatiga mos)
    const defaultAchievements = [
      { id: 'first_letter', title: 'Birinchi Harf', description: 'Birinchi harfni o\'rganing', icon: '🎯', unlocked: false },
      { id: 'five_letters', title: '5 ta Harf', description: '5 ta harfni o\'rganing', icon: '⭐', unlocked: false },
      { id: 'ten_letters', title: '10 ta Harf', description: '10 ta harfni o\'rganing', icon: '🌟', unlocked: false },
      { id: 'all_letters', title: 'Alifbo Ustasi', description: 'Barcha 29 harfni o\'rganing', icon: '👑', unlocked: false },
      { id: 'streak_3', title: '3 kun ketma-ket', description: '3 kun ketma-ket o\'rganing', icon: '🔥', unlocked: false },
      { id: 'streak_7', title: '7 kun ketma-ket', description: '7 kun ketma-ket o\'rganing', icon: '💪', unlocked: false },
      { id: 'perfect_score', title: 'Mukammal', description: '5 ta harfni mukammal talaffuz qiling', icon: '💯', unlocked: false },
      { id: 'speed_learner', title: 'Tez O\'rganuvchi', description: 'Bir kunda 10 ta harfni o\'rganing', icon: '⚡', unlocked: false },
    ];
    
    let achievements: Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean }> = [];
    
    if (achievementsStr) {
      try {
        const parsed = JSON.parse(achievementsStr);
        // Mavjud yutuqlarni default yutuqlar bilan birlashtirish
        achievements = defaultAchievements.map(ach => {
          const saved = parsed.find((a: any) => a.id === ach.id);
          return saved ? { ...ach, ...saved } : ach;
        });
        console.log('📋 Mavjud yutuqlar yuklandi:', achievements);
      } catch (e) {
        console.warn('Achievements parse error:', e);
        achievements = defaultAchievements;
      }
    } else {
      console.log('📝 Yutuqlar bo\'sh, default yutuqlarni yaratish...');
      achievements = defaultAchievements;
    }
    
    const letterCount = updatedLetters.size;
    console.log('📊 O\'rganilgan harflar soni:', letterCount);
    
    // Birinchi harf yutug'i
    if (letterCount >= 1) {
      const firstLetterAchievement = achievements.find(a => 
        a.id === 'first_letter' || a.id === 'first-letter'
      );
      
      if (firstLetterAchievement && !firstLetterAchievement.unlocked) {
        firstLetterAchievement.unlocked = true;
        console.log('🎉 Birinchi harf yutug\'i ochildi!', firstLetterAchievement);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500'],
        });
      } else if (firstLetterAchievement && firstLetterAchievement.unlocked) {
        console.log('ℹ️ Birinchi harf yutug\'i allaqachon ochilgan');
      } else {
        console.warn('⚠️ Birinchi harf yutug\'i topilmadi!', achievements.map(a => a.id));
      }
    }
    
    // 5 ta harf yutug'i
    if (letterCount >= 5) {
      const fiveLettersAchievement = achievements.find(a => 
        a.id === 'five_letters' || a.id === 'five-letters'
      );
      if (fiveLettersAchievement && !fiveLettersAchievement.unlocked) {
        fiveLettersAchievement.unlocked = true;
        console.log('🎉 5 ta harf yutug\'i ochildi!', fiveLettersAchievement);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
      }
    }
    
    // 10 ta harf yutug'i
    if (letterCount >= 10) {
      const tenLettersAchievement = achievements.find(a => 
        a.id === 'ten_letters' || a.id === 'ten-letters'
      );
      if (tenLettersAchievement && !tenLettersAchievement.unlocked) {
        tenLettersAchievement.unlocked = true;
        console.log('🎉 10 ta harf yutug\'i ochildi!', tenLettersAchievement);
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
      }
    }
    
    // Alifbo ustasi yutug'i (barcha 29 harf)
    if (letterCount >= 29) {
      const alphabetMasterAchievement = achievements.find(a => 
        a.id === 'all_letters' || a.id === 'alphabet-master'
      );
      if (alphabetMasterAchievement && !alphabetMasterAchievement.unlocked) {
        alphabetMasterAchievement.unlocked = true;
        console.log('🎉 Alifbo ustasi yutug\'i ochildi!', alphabetMasterAchievement);
        confetti({
          particleCount: 300,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493'],
        });
      }
    }
    
    // localStorage'ga saqlash (to'liq formatda - gamification/page.tsx formatiga mos)
    console.log('💾 Yutuqlarni saqlash:', achievements);
    const achievementsToSave = achievements.map(ach => ({
      id: ach.id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      unlocked: ach.unlocked,
      unlockedAt: ach.unlocked ? new Date().toISOString() : undefined
    }));
    localStorage.setItem('bolajon_achievements', JSON.stringify(achievementsToSave));
    console.log('✅ Yutuqlar saqlandi:', achievementsToSave);
  };

  const handleTranscript = (text: string) => {
    // Bo'sh xabarlarni filter qilish
    if (!text || !text.trim()) return;
    
    // Takrorlanishni oldini olish (bir xil xabar 3 sekund ichida)
    const now = Date.now();
    if (text === lastTranscriptRef.current && (now - lastTranscriptTimeRef.current) < 3000) {
      return;
    }
    
    lastTranscriptRef.current = text;
    lastTranscriptTimeRef.current = now;
    
    // AI xabarlarini filter qilish (backend dan kelgan bo'sh xabarlar)
    if (text.includes("Siz '' dedingiz") || 
        text.includes("Salom! Men sizga") ||
        text.trim().length < 2) {
      return;
    }
    
    // Faqat qisqa va aniq xabarlarni qabul qilish
    if (text.length > 100) {
      return; // Uzun xabarlarni e'tiborsiz qoldirish
    }
    
    setAiMessages((prev) => {
      // Oxirgi 30 ta xabarni saqlash (cheksiz o'sishni oldini olish)
      const newMessages = [...prev, { text, type: 'user' as const }];
      return newMessages.slice(-30);
    });
    
    // AI javob berish
    console.log('🤖 AI javob berish boshlandi, text:', text, 'letter:', currentLetter);
    
    setTimeout(async () => {
      const letter = currentLetter || 'A';
      const textLower = text.toLowerCase().trim();
      const letterLower = letter.toLowerCase();
      
      console.log('🤖 AI: Letter:', letter, 'Text:', textLower);
      
      // So'zlarni olish va state'ga saqlash
      let exampleWords: string[] = [];
      try {
        console.log('🤖 AI: getExampleWords chaqirilmoqda...');
        exampleWords = await getExampleWords(letter);
        console.log('🤖 AI: getExampleWords natijasi:', exampleWords);
        if (exampleWords && exampleWords.length > 0) {
          setExampleWords(exampleWords);
        } else {
          console.warn('🤖 AI: exampleWords bo\'sh, sync versiyani ishlatamiz');
          exampleWords = getExampleWordsSync(letter);
          setExampleWords(exampleWords);
        }
      } catch (error) {
        console.error('🤖 AI: getExampleWords error:', error);
        exampleWords = getExampleWordsSync(letter);
        console.log('🤖 AI: Sync versiya natijasi:', exampleWords);
        setExampleWords(exampleWords);
      }
      
      // Agar exampleWords hali ham bo'sh bo'lsa, default so'zlarni ishlatish
      if (!exampleWords || exampleWords.length === 0) {
        console.warn('🤖 AI: exampleWords hali ham bo\'sh, default so\'zlarni ishlatamiz');
        const defaultWords = getDefaultWords();
        exampleWords = defaultWords[letter] || ['Anor', 'Archa', 'Avtobus'];
        setExampleWords(exampleWords);
      }
      
      console.log('🤖 AI: Ishlatiladigan so\'zlar:', exampleWords);
      
      // So'zni tekshirish - harfdan boshlanadigan so'z aytilganmi?
      const words = textLower.split(/\s+/).filter(w => w.length > 0);
      console.log('🤖 AI: Ajratilgan so\'zlar:', words);
      
      const startsWithLetter = words.some(word => {
        // 1. Misol so'zlardan birini to'liq aytganmi? (eng aniq)
        const exactMatch = exampleWords.some(exWord => {
          const exWordLower = exWord.toLowerCase();
          const match = word === exWordLower || word.startsWith(exWordLower);
          if (match) {
            console.log('✅ AI: Exact match topildi:', word, '===', exWordLower);
          }
          return match;
        });
        if (exactMatch) return true;
        
        // 2. To'g'ridan-to'g'ri harf bilan boshlanish (faqat birinchi harf)
        if (word.charAt(0) === letterLower) {
          console.log('✅ AI: Harf bilan boshlanish:', word.charAt(0), '===', letterLower);
          return true;
        }
        
        // 3. Maxsus harflar uchun (O', G', Sh, Ch, Ng)
        if (letter === "O'" && word.startsWith("o'")) {
          console.log('✅ AI: O\' harfi bilan boshlanish');
          return true;
        }
        if (letter === "G'" && word.startsWith("g'")) {
          console.log('✅ AI: G\' harfi bilan boshlanish');
          return true;
        }
        if (letter === "Sh" && word.startsWith("sh")) {
          console.log('✅ AI: Sh harfi bilan boshlanish');
          return true;
        }
        if (letter === "Ch" && word.startsWith("ch")) {
          console.log('✅ AI: Ch harfi bilan boshlanish');
          return true;
        }
        // Ng harfi so'zning o'rtasida yoki oxirida bo'lishi mumkin, lekin boshlanishida emas
        if (letter === "Ng") {
          // Faqat misol so'zlardan birini to'liq aytgan bo'lsa
          const ngExamples = ['ming', 'qo\'ng\'iroq', 'qo\'ng\'iz'];
          if (ngExamples.some(ex => word === ex || word.startsWith(ex))) {
            console.log('✅ AI: Ng misol so\'z topildi');
            return true;
          }
          // So'zning o'rtasida yoki oxirida "ng" bo'lishi kerak, lekin boshlanishida emas
          const ngIndex = word.indexOf('ng');
          if (ngIndex > 0 && ngIndex < word.length - 2) {
            console.log('✅ AI: Ng o\'rtasida topildi');
            return true; // O'rtasida
          }
          if (ngIndex === word.length - 2) {
            console.log('✅ AI: Ng oxirida topildi');
            return true; // Oxirida
          }
        }
        
        return false;
      });
      
      console.log('🤖 AI: startsWithLetter natijasi:', startsWithLetter);
      
      let response = '';
      
      if (startsWithLetter) {
        console.log('✅ AI: To\'g\'ri javob!');
        // To'g'ri! - Confetti animatsiyasi
        triggerConfetti();
        
        // Progress yangilash
        setLetterProgress(prev => {
          const newProgress = Math.min(prev + 10, 100);
          
          // Progress'ni localStorage'ga saqlash
          localStorage.setItem(`bolajon_letter_progress_${letter}`, newProgress.toString());
          
          // Agar progress 100% bo'lsa, harfni o'rganilganlar ro'yxatiga qo'shish
          if (newProgress >= 100) {
            setLearnedLetters(prevLetters => {
              // Agar allaqachon qo'shilgan bo'lsa, qayta qo'shmaslik
              if (prevLetters.has(letter)) {
                console.log('ℹ️ Harf allaqachon o\'rganilgan:', letter);
                return prevLetters;
              }
              
              const updated = new Set([...prevLetters, letter]);
              console.log('✅ Yangi harf o\'rganildi:', letter, 'Jami:', updated.size);
              
              // localStorage'ga saqlash
              localStorage.setItem('bolajon_learned_letters', JSON.stringify(Array.from(updated)));
              
              // Yutuqlarni tekshirish va ochish (setLearnedLetters callback ichida)
              // setTimeout orqali state yangilanishini kutamiz
              setTimeout(() => {
                checkAndUnlockAchievements(updated);
              }, 100);
              
              return updated;
            });
          }
          
          return newProgress;
        });
        
        // To'g'ri!
        response = `Ajoyib! 🎉 Siz "${text}" dedingiz. Bu ${letter} harfi bilan boshlanadi!`;
      } else {
        console.log('❌ AI: Noto\'g\'ri javob');
        // Noto'g'ri - qanday qilishni tushuntirish
        const randomExample = exampleWords && exampleWords.length > 0 
          ? exampleWords[Math.floor(Math.random() * exampleWords.length)]
          : letter;
        response = `Hmm, "${text}" ${letter} harfi bilan boshlanmaydi. 😊\n\n` +
                  `Keling, ${letter} harfini takrorlaymiz!\n\n` +
                  `Misol: "${randomExample}" - bu ${letter} harfi bilan boshlanadi.\n\n` +
                  `Yana bir bor gapiring: "${randomExample}"`;
      }
      
      console.log('🤖 AI: Response tayyor:', response);
      
      setAiMessages((prev) => {
        const newMessages = [...prev, { text: response, type: 'ai' as const }];
        console.log('🤖 AI: Xabarlar yangilandi, jami:', newMessages.length);
        return newMessages.slice(-30);
      });
      
      // AI xabarni o'qish
      setTimeout(() => {
        console.log('🔊 AI: Xabarni o\'qish boshlandi');
        speakAiMessage(response);
      }, 1000);
    }, 500);
  };
  
  const handleLetterSelect = async (letter: string) => {
    setCurrentLetter(letter);
    setShowLibrary(false);
    
    // Harf progress'ni localStorage'dan olish
    const savedProgress = localStorage.getItem(`bolajon_letter_progress_${letter}`);
    if (savedProgress) {
      const progress = parseInt(savedProgress, 10);
      setLetterProgress(isNaN(progress) ? 0 : progress);
    } else {
      setLetterProgress(learnedLetters.has(letter) ? 100 : 0);
    }
    const aiMessage = `Endi ${letter} harfini o'rganamiz!`;
    setAiMessages((prev) => [
      ...prev,
      {
        text: aiMessage,
        type: 'ai',
      },
    ]);
    // AI xabarni ham o'qish
    setTimeout(() => {
      speakAiMessage(aiMessage);
    }, 500);
    // Harfni ovozli aytish
    speakLetter(letter);
    
    // Loading state
    setExampleWords([]);
    
    // OpenAI "miya" orqali qiziqishlarga mos random so'zlarni generatsiya qilish
    try {
      console.log('🔄 Starting word generation for letter:', letter);
      const words = await getExampleWords(letter);
      console.log('✅ Words generated:', words);
      setExampleWords(words);
      loadImagesForWords(words);
    } catch (error) {
      console.error('❌ Error generating words:', error);
      // Fallback: synchronous version
      const words = getExampleWordsSync(letter);
      console.log('🔄 Using fallback words:', words);
      setExampleWords(words);
      loadImagesForWords(words);
    }
  };
  
  // Rasmlarni yuklash - har bir so'z uchun mos rasm
  const loadImagesForWords = async (words: string[]) => {
    const images: string[] = [];
    
    // Har bir so'z uchun mos rasm URL lari
    const wordImageMap: Record<string, string> = {
      // A harfi
      'Anor': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=200&fit=crop',
      'Archa': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=200&fit=crop',
      'Avtobus': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop',
      // B harfi
      'Bola': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
      'Bosh': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      'Bog\'': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      // D harfi
      'Daraxt': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=200&fit=crop',
      'Dost': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop',
      'Dars': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
      // E harfi
      'Eshik': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      'Elak': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      'Eshak': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=300&h=200&fit=crop',
      // F harfi
      'Futbol': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=200&fit=crop',
      'Fayl': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
      'Fen': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      // G harfi
      'Gul': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=200&fit=crop',
      'Gap': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop',
      'G\'isht': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=300&h=200&fit=crop',
      // H harfi
      'Havo': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop',
      'Hona': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop',
      'Hovli': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop',
      // I harfi
      'Ish': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
      'It': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      'Ikki': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=200&fit=crop',
      // J harfi
      'Javob': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop',
      'Juda': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      'Juma': 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=300&h=200&fit=crop',
      // K harfi
      'Kitob': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop',
      'Kuch': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop',
      'Kun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      // L harfi
      'Lola': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=200&fit=crop',
      'Limon': 'https://images.unsplash.com/photo-1608610048043-9f98751d7afa?w=300&h=200&fit=crop',
      'Lak': 'https://images.unsplash.com/photo-1586075010923-2dd4570d3381?w=300&h=200&fit=crop',
      // M harfi
      'Mashina': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=200&fit=crop',
      'Maktab': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
      'Mushuk': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=200&fit=crop',
      // N harfi
      'Non': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
      'Nar': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=200&fit=crop',
      'Nima': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop',
      // O harfi
      'Olma': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=200&fit=crop',
      'O\'q': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
      'O\'t': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      // P harfi
      'Poy': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=200&fit=crop',
      'Pul': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop',
      'Pichoq': 'https://images.unsplash.com/photo-1594736797933-d0cbc0a0c3e1?w=300&h=200&fit=crop',
      // Q harfi
      'Qalam': 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945b?w=300&h=200&fit=crop',
      'Qiz': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=200&fit=crop',
      'Qush': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&h=200&fit=crop',
      // R harfi
      'Rang': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop',
      'Rasm': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
      'Ruchka': 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945b?w=300&h=200&fit=crop',
      // S harfi
      'Suv': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
      'Sichqon': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&h=200&fit=crop',
      'Sut': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      // T harfi
      'Tosh': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
      'Tovuq': 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300&h=200&fit=crop',
      'Tuz': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&h=200&fit=crop',
      // U harfi
      'Uy': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop',
      'Uch': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=200&fit=crop',
      'Uzum': 'https://images.unsplash.com/photo-1606312619070-d48b4bdc8d91?w=300&h=200&fit=crop',
      // V harfi
      'Voy': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      'Vazifa': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
      'Vilka': 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=300&h=200&fit=crop',
      // X harfi
      'Xona': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop',
      'Xat': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop',
      'Xalq': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=200&fit=crop',
      // Y harfi
      'Yoz': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      'Yil': 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=300&h=200&fit=crop',
      'Yuz': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      // Z harfi
      'Zar': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop',
      'Zamin': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop',
      'Zarb': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=200&fit=crop',
      // O' harfi
      'O\'g\'il': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop',
      // G' harfi
      'G\'oza': 'https://images.unsplash.com/photo-1606312619070-d48b4bdc8d91?w=300&h=200&fit=crop',
      'G\'oyib': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop',
      // Sh harfi
      'Shahar': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop',
      'Shamol': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop',
      'Shox': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=200&fit=crop',
      // Ch harfi
      'Choy': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop',
      'Chiroq': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      'Chiqish': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      // Ng harfi
      'Ming': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=200&fit=crop',
      'Qo\'ng\'iroq': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      'Qo\'ng\'iz': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&h=200&fit=crop',
    };
    
    for (const word of words) {
      // Avval wordImageMap dan qidirish
      if (wordImageMap[word]) {
        images.push(wordImageMap[word]);
      } else {
        // Agar topilmasa, Unsplash API dan qidirish
        try {
          const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
          if (unsplashKey) {
            const response = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${unsplashKey}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                images.push(data.results[0].urls.small);
              } else {
                images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
              }
            } else {
              images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
            }
          } else {
            images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
          }
        } catch (error) {
          images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
        }
      }
    }
    setExampleImages(images);
  };
  
  // Harfni ovozli aytish (TTS) - Muxlisa API dan to'g'ri ovoz olish
  // AI xabarlarini o'qish funksiyasi - faqat Muxlisa AI
  const speakAiMessage = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      console.log('🔊 AI xabarni o\'qish (Muxlisa AI):', text.substring(0, 50) + '...');
      const result = await textToSpeech(text, 'maftuna');
      
      if (result.error) {
        console.warn('⚠️ Muxlisa TTS error:', result.error);
        setIsSpeaking(false);
        return;
      }
      
      let audio: HTMLAudioElement | null = null;
      
      // Muxlisa API dan kelgan audio ni ishlatish
      if (result.audio_base64) {
        audio = new Audio(`data:audio/mpeg;base64,${result.audio_base64}`);
        console.log('🔊 Muxlisa base64 audio ishlatilmoqda, length:', result.audio_base64.length);
      } else if (result.audio_url && result.audio_url !== 'web-speech-api') {
        audio = new Audio(result.audio_url);
        console.log('🔊 Muxlisa audio URL ishlatilmoqda:', result.audio_url);
      }
      
      if (audio) {
        audio.onended = () => {
          console.log('✅ Muxlisa AI xabar o\'qildi');
          setIsSpeaking(false);
        };
        audio.onerror = (err) => {
          console.error('❌ Muxlisa audio xatosi:', err);
          setIsSpeaking(false);
        };
        await audio.play();
        console.log('✅ Muxlisa audio playback started');
      } else {
        console.warn('⚠️ Muxlisa API dan audio olinmadi');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const speakLetter = async (letter: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      // Harfning fonetik matnini olish
      const phoneticText = getUzbekPhoneticText(letter);
      console.log('🔊 Muxlisa API ga yuborilayotgan harf:', letter, 'fonetik:', phoneticText);
      
      // Muxlisa API dan urinib ko'rish - Maftuna ovozida
      const result = await textToSpeech(phoneticText, 'maftuna');
      console.log('🔊 Muxlisa API javobi:', result);
      
      if (result.error) {
        console.warn('⚠️ Muxlisa TTS error:', result.error);
        setIsSpeaking(false);
        return;
      }
      
      let audio: HTMLAudioElement | null = null;
      
      // Muxlisa API dan kelgan audio ni ishlatish
      if (result.audio_base64) {
        // Base64 audio
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
          console.log('✅ Muxlisa audio playback completed');
          setIsSpeaking(false);
        };
        audio.onerror = (err) => {
          console.error('❌ Muxlisa audio xatosi:', err);
          setIsSpeaking(false);
        };
        await audio.play();
        console.log('✅ Muxlisa audio playback started');
      } else {
        console.warn('⚠️ Muxlisa API dan audio olinmadi');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsSpeaking(false);
    }
  };
  
  // Harflar va so'zlar uchun o'zbek tilida to'g'ri talaffuz qilish uchun fonetik matnlar
  const getUzbekPhoneticText = (text: string): string => {
    // Harflar uchun maxsus matnlar - Web Speech API uchun to'g'ri talaffuz qilish
    // O'zbek harflarini Web Speech API to'g'ri o'qishi uchun fonetik matnlar
    const letterPhonetics: Record<string, string> = {
      'A': 'A',
      'B': 'Be',
      'D': 'De',
      'E': 'E',
      'F': 'Ef',
      'G': 'Ge',
      'H': 'Ha',
      'I': 'I',
      'J': 'Je',
      'K': 'Ka',
      'L': 'El',
      'M': 'Em',
      'N': 'En',
      'O': 'O',
      'P': 'Pe',
      'Q': 'Qe',
      'R': 'Er',
      'S': 'Es',
      'T': 'Te',
      'U': 'U',
      'V': 'Ve',
      'X': 'Xa',
      'Y': 'Ye',
      'Z': 'Ze',
      'O\'': 'O',  // O' harfi uchun oddiy O
      'G\'': 'Ge', // G' harfi uchun Ge
      'Sh': 'Sha',
      'Ch': 'Cha',
      'Ng': 'En Ge', // Ng harfi uchun En Ge
    };
    
    // Agar text harf bo'lsa, fonetik matnni qaytarish
    if (letterPhonetics[text]) {
      return letterPhonetics[text];
    }
    
    // So'zlar uchun - o'zbek so'zlarini to'g'ri talaffuz qilish
    // Web Speech API uchun transliteration
    const wordPhonetics: Record<string, string> = {
      'Anor': 'Anor',
      'Archa': 'Archa',
      'Avtobus': 'Avtobus',
      'Bola': 'Bola',
      'Bosh': 'Bosh',
      'Bog\'': 'Bog',
      'Daraxt': 'Daraxt',
      'Dost': 'Dost',
      'Dars': 'Dars',
      'Eshik': 'Eshik',
      'Elak': 'Elak',
      'Eshak': 'Eshak',
      'Futbol': 'Futbol',
      'Fayl': 'Fayl',
      'Fen': 'Fen',
      'Gul': 'Gul',
      'Gap': 'Gap',
      'G\'isht': 'Gisht',
      'Havo': 'Havo',
      'Hona': 'Hona',
      'Hovli': 'Hovli',
      'Ish': 'Ish',
      'It': 'It',
      'Ikki': 'Ikki',
      'Javob': 'Javob',
      'Juda': 'Juda',
      'Juma': 'Juma',
      'Kitob': 'Kitob',
      'Kuch': 'Kuch',
      'Kun': 'Kun',
      'Lola': 'Lola',
      'Limon': 'Limon',
      'Lak': 'Lak',
      'Mashina': 'Mashina',
      'Maktab': 'Maktab',
      'Mushuk': 'Mushuk',
      'Non': 'Non',
      'Nar': 'Nar',
      'Nima': 'Nima',
      'Olma': 'Olma',
      'O\'q': 'Oq',
      'O\'t': 'Ot',
      'Poy': 'Poy',
      'Pul': 'Pul',
      'Pichoq': 'Pichoq',
      'Qalam': 'Qalam',
      'Qiz': 'Qiz',
      'Qush': 'Qush',
      'Rang': 'Rang',
      'Rasm': 'Rasm',
      'Ruchka': 'Ruchka',
      'Suv': 'Suv',
      'Sichqon': 'Sichqon',
      'Sut': 'Sut',
      'Tosh': 'Tosh',
      'Tovuq': 'Tovuq',
      'Tuz': 'Tuz',
      'Uy': 'Uy',
      'Uch': 'Uch',
      'Uzum': 'Uzum',
      'Voy': 'Voy',
      'Vazifa': 'Vazifa',
      'Vilka': 'Vilka',
      'Xona': 'Xona',
      'Xat': 'Xat',
      'Xalq': 'Xalq',
      'Yoz': 'Yoz',
      'Yil': 'Yil',
      'Yuz': 'Yuz',
      'Zar': 'Zar',
      'Zamin': 'Zamin',
      'Zarb': 'Zarb',
      'O\'g\'il': 'Ogil',
      'G\'oza': 'Goza',
      'G\'oyib': 'Goyib',
      'Shahar': 'Shahar',
      'Shamol': 'Shamol',
      'Shox': 'Shox',
      'Choy': 'Choy',
      'Chiroq': 'Chiroq',
      'Chiqish': 'Chiqish',
      'Ming': 'Ming',
      'Qo\'ng\'iroq': 'Qongiroq',
      'Qo\'ng\'iz': 'Qongiz',
    };
    
    // Agar text so'z bo'lsa, fonetik matnni qaytarish
    if (wordPhonetics[text]) {
      return wordPhonetics[text];
    }
    
    // Agar topilmasa, asl matnni qaytarish
    return text;
  };
  
  // Misol so'zni ovozli aytish - Muxlisa API dan to'g'ri ovoz olish
  const speakWord = async (word: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      // So'zning fonetik matnini olish
      const phoneticText = getUzbekPhoneticText(word);
      console.log('🔊 Muxlisa API ga yuborilayotgan so\'z:', word, 'fonetik:', phoneticText);
      
      // Muxlisa API dan urinib ko'rish - Maftuna ovozida
      const result = await textToSpeech(phoneticText || word, 'maftuna');
      console.log('🔊 Muxlisa API javobi:', result);
      
      if (result.error) {
        console.warn('⚠️ Muxlisa TTS error:', result.error);
        setIsSpeaking(false);
        return;
      }
      
      let audio: HTMLAudioElement | null = null;
      
      // Muxlisa API dan kelgan audio ni ishlatish
      if (result.audio_base64) {
        // Base64 audio
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
          console.log('✅ Muxlisa audio playback completed');
          setIsSpeaking(false);
        };
        audio.onerror = (err) => {
          console.error('❌ Muxlisa audio xatosi:', err);
          setIsSpeaking(false);
        };
        await audio.play();
        console.log('✅ Muxlisa audio playback started');
      } else {
        console.warn('⚠️ Muxlisa API dan audio olinmadi');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsSpeaking(false);
    }
  };
  
  // Confetti animatsiyasi
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
    });
  };

  const handleNextLetter = () => {
    const currentIndex = allLetters.indexOf(currentLetter || 'A');
    const nextIndex = (currentIndex + 1) % allLetters.length;
    const nextLetter = allLetters[nextIndex];
    handleLetterSelect(nextLetter);
  };
  
  const handlePreviousLetter = () => {
    const currentIndex = allLetters.indexOf(currentLetter || 'A');
    const prevIndex = currentIndex === 0 ? allLetters.length - 1 : currentIndex - 1;
    const prevLetter = allLetters[prevIndex];
    handleLetterSelect(prevLetter);
  };
  
  // Qiziqishlarga mos so'zlar bazasi
    // Qiziqishlarga mos so'zlar bazasi - har bir harf uchun 100 ta so'z
  const getWordsByInterest = (): Record<string, Record<string, string[]>> => {
    // Har bir harf uchun 100 ta so'z yaratish funksiyasi
    const generate100Words = (baseWords: string[]): string[] => {
      if (baseWords.length === 0) return [];
      const result: string[] = [];
      while (result.length < 100) {
        result.push(...baseWords);
      }
      // Har safar random aylantirish
      const shuffled = result.slice(0, 100);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    return {
      'Mashinalar': {
        'A': generate100Words(['Avtobus', 'Avtomobil', 'Aeroplane', 'Avtomat', 'Avtomatik', 'Avtomatlashtirilgan', 'Avtomatik mashina', 'Avtomatik tizim', 'Avtomatik boshqaruv', 'Avtomatik ishlash']),
        'B': generate100Words(['Benzin', 'Benzin bak', 'Benzin quyish', 'Benzin stansiyasi', 'Benzin xarajati', 'Benzin sarfi', 'Benzin narxi', 'Benzin quyish', 'Benzin quyish', 'Benzin quyish']),
        'D': generate100Words(['Dvigatel', 'Dvigatel quvvati', 'Dvigatel ishlashi', 'Dvigatel remonti', 'Dvigatel xizmati', 'Dvigatel tuzatish', 'Dvigatel yig\'ish', 'Dvigatel o\'rnatish', 'Dvigatel xizmati', 'Dvigatel remonti']),
        'E': generate100Words(['Elektr', 'Elektr mashina', 'Elektr quvvati', 'Elektr tizimi', 'Elektr xizmati', 'Elektr remonti', 'Elektr yig\'ish', 'Elektr o\'rnatish', 'Elektr xizmati', 'Elektr remonti']),
        'F': generate100Words(['Fara', 'Fara yoritgichi', 'Fara remonti', 'Fara xizmati', 'Fara o\'rnatish', 'Fara tuzatish', 'Fara yig\'ish', 'Fara xizmati', 'Fara remonti', 'Fara o\'rnatish']),
        'G': generate100Words(['G\'ildirak', 'G\'ildirak tizimi', 'G\'ildirak remonti', 'G\'ildirak xizmati', 'G\'ildirak o\'rnatish', 'G\'ildirak tuzatish', 'G\'ildirak yig\'ish', 'G\'ildirak xizmati', 'G\'ildirak remonti', 'G\'ildirak o\'rnatish']),
        'H': generate100Words(['Haydovchi', 'Haydovchi o\'rni', 'Haydovchi xizmati', 'Haydovchi kursi', 'Haydovchi huquqi', 'Haydovchi tizimi', 'Haydovchi yig\'ish', 'Haydovchi o\'rnatish', 'Haydovchi xizmati', 'Haydovchi remonti']),
        'I': generate100Words(['Ishlash', 'Ishlash tizimi', 'Ishlash xizmati', 'Ishlash remonti', 'Ishlash o\'rnatish', 'Ishlash tuzatish', 'Ishlash yig\'ish', 'Ishlash xizmati', 'Ishlash remonti', 'Ishlash o\'rnatish']),
        'J': generate100Words(['Javob', 'Javob tizimi', 'Javob xizmati', 'Javob remonti', 'Javob o\'rnatish', 'Javob tuzatish', 'Javob yig\'ish', 'Javob xizmati', 'Javob remonti', 'Javob o\'rnatish']),
        'K': generate100Words(['Kuzov', 'Kuzov tizimi', 'Kuzov xizmati', 'Kuzov remonti', 'Kuzov o\'rnatish', 'Kuzov tuzatish', 'Kuzov yig\'ish', 'Kuzov xizmati', 'Kuzov remonti', 'Kuzov o\'rnatish']),
        'L': generate100Words(['Lampa', 'Lampa yoritgichi', 'Lampa remonti', 'Lampa xizmati', 'Lampa o\'rnatish', 'Lampa tuzatish', 'Lampa yig\'ish', 'Lampa xizmati', 'Lampa remonti', 'Lampa o\'rnatish']),
        'M': generate100Words(['Mashina', 'Mashina tizimi', 'Mashina xizmati', 'Mashina remonti', 'Mashina o\'rnatish', 'Mashina tuzatish', 'Mashina yig\'ish', 'Mashina xizmati', 'Mashina remonti', 'Mashina o\'rnatish']),
        'N': generate100Words(['Nazorat', 'Nazorat tizimi', 'Nazorat xizmati', 'Nazorat remonti', 'Nazorat o\'rnatish', 'Nazorat tuzatish', 'Nazorat yig\'ish', 'Nazorat xizmati', 'Nazorat remonti', 'Nazorat o\'rnatish']),
        'O': generate100Words(['O\'rnatish', 'O\'rnatish tizimi', 'O\'rnatish xizmati', 'O\'rnatish remonti', 'O\'rnatish xizmati', 'O\'rnatish tuzatish', 'O\'rnatish yig\'ish', 'O\'rnatish xizmati', 'O\'rnatish remonti', 'O\'rnatish xizmati']),
        'P': generate100Words(['Poy', 'Poy tizimi', 'Poy xizmati', 'Poy remonti', 'Poy o\'rnatish', 'Poy tuzatish', 'Poy yig\'ish', 'Poy xizmati', 'Poy remonti', 'Poy o\'rnatish']),
        'Q': generate100Words(['Qism', 'Qism tizimi', 'Qism xizmati', 'Qism remonti', 'Qism o\'rnatish', 'Qism tuzatish', 'Qism yig\'ish', 'Qism xizmati', 'Qism remonti', 'Qism o\'rnatish']),
        'R': generate100Words(['Rul', 'Rul tizimi', 'Rul xizmati', 'Rul remonti', 'Rul o\'rnatish', 'Rul tuzatish', 'Rul yig\'ish', 'Rul xizmati', 'Rul remonti', 'Rul o\'rnatish']),
        'S': generate100Words(['Salon', 'Salon tizimi', 'Salon xizmati', 'Salon remonti', 'Salon o\'rnatish', 'Salon tuzatish', 'Salon yig\'ish', 'Salon xizmati', 'Salon remonti', 'Salon o\'rnatish']),
        'T': generate100Words(['Tormoz', 'Tormoz tizimi', 'Tormoz xizmati', 'Tormoz remonti', 'Tormoz o\'rnatish', 'Tormoz tuzatish', 'Tormoz yig\'ish', 'Tormoz xizmati', 'Tormoz remonti', 'Tormoz o\'rnatish']),
        'U': generate100Words(['Uy', 'Uy tizimi', 'Uy xizmati', 'Uy remonti', 'Uy o\'rnatish', 'Uy tuzatish', 'Uy yig\'ish', 'Uy xizmati', 'Uy remonti', 'Uy o\'rnatish']),
        'V': generate100Words(['Vazifa', 'Vazifa tizimi', 'Vazifa xizmati', 'Vazifa remonti', 'Vazifa o\'rnatish', 'Vazifa tuzatish', 'Vazifa yig\'ish', 'Vazifa xizmati', 'Vazifa remonti', 'Vazifa o\'rnatish']),
        'X': generate100Words(['Xizmat', 'Xizmat tizimi', 'Xizmat xizmati', 'Xizmat remonti', 'Xizmat o\'rnatish', 'Xizmat tuzatish', 'Xizmat yig\'ish', 'Xizmat xizmati', 'Xizmat remonti', 'Xizmat o\'rnatish']),
        'Y': generate100Words(['Yordam', 'Yordam tizimi', 'Yordam xizmati', 'Yordam remonti', 'Yordam o\'rnatish', 'Yordam tuzatish', 'Yordam yig\'ish', 'Yordam xizmati', 'Yordam remonti', 'Yordam o\'rnatish']),
        'Z': generate100Words(['Zarur', 'Zarur tizimi', 'Zarur xizmati', 'Zarur remonti', 'Zarur o\'rnatish', 'Zarur tuzatish', 'Zarur yig\'ish', 'Zarur xizmati', 'Zarur remonti', 'Zarur o\'rnatish']),
        'O\'': generate100Words(['O\'rnatish', 'O\'rnatish tizimi', 'O\'rnatish xizmati', 'O\'rnatish remonti', 'O\'rnatish xizmati', 'O\'rnatish tuzatish', 'O\'rnatish yig\'ish', 'O\'rnatish xizmati', 'O\'rnatish remonti', 'O\'rnatish xizmati']),
        'G\'': generate100Words(['G\'ildirak', 'G\'ildirak tizimi', 'G\'ildirak xizmati', 'G\'ildirak remonti', 'G\'ildirak o\'rnatish', 'G\'ildirak tuzatish', 'G\'ildirak yig\'ish', 'G\'ildirak xizmati', 'G\'ildirak remonti', 'G\'ildirak o\'rnatish']),
        'Sh': generate100Words(['Shina', 'Shina tizimi', 'Shina xizmati', 'Shina remonti', 'Shina o\'rnatish', 'Shina tuzatish', 'Shina yig\'ish', 'Shina xizmati', 'Shina remonti', 'Shina o\'rnatish']),
        'Ch': generate100Words(['Chiqish', 'Chiqish tizimi', 'Chiqish xizmati', 'Chiqish remonti', 'Chiqish o\'rnatish', 'Chiqish tuzatish', 'Chiqish yig\'ish', 'Chiqish xizmati', 'Chiqish remonti', 'Chiqish o\'rnatish']),
        'Ng': generate100Words(['Nazorat', 'Nazorat tizimi', 'Nazorat xizmati', 'Nazorat remonti', 'Nazorat o\'rnatish', 'Nazorat tuzatish', 'Nazorat yig\'ish', 'Nazorat xizmati', 'Nazorat remonti', 'Nazorat o\'rnatish']),
      },
      'Hayvonlar': {
        'A': generate100Words(['Ari', 'Anor', 'Archa', 'Ari uyasi', 'Ari asal', 'Ari yig\'ish', 'Ari o\'rnatish', 'Ari xizmati', 'Ari remonti', 'Ari tuzatish']),
        'B': generate100Words(['Bola', 'Bosh', 'Bog\'', 'Bino', 'Birov', 'Biroq', 'Biroq', 'Biroq', 'Biroq', 'Biroq']),
        'D': generate100Words(['Daraxt', 'Dost', 'Dars', 'Daraxt o\'rnatish', 'Daraxt xizmati', 'Daraxt remonti', 'Daraxt tuzatish', 'Daraxt yig\'ish', 'Daraxt xizmati', 'Daraxt remonti']),
        'E': generate100Words(['Eshik', 'Elak', 'Eshak', 'Eshak o\'rnatish', 'Eshak xizmati', 'Eshak remonti', 'Eshak tuzatish', 'Eshak yig\'ish', 'Eshak xizmati', 'Eshak remonti']),
        'F': generate100Words(['Futbol', 'Fayl', 'Fen', 'Futbol o\'rnatish', 'Futbol xizmati', 'Futbol remonti', 'Futbol tuzatish', 'Futbol yig\'ish', 'Futbol xizmati', 'Futbol remonti']),
        'G': generate100Words(['Gul', 'Gap', 'G\'isht', 'Gul o\'rnatish', 'Gul xizmati', 'Gul remonti', 'Gul tuzatish', 'Gul yig\'ish', 'Gul xizmati', 'Gul remonti']),
        'H': generate100Words(['Havo', 'Hona', 'Hovli', 'Havo o\'rnatish', 'Havo xizmati', 'Havo remonti', 'Havo tuzatish', 'Havo yig\'ish', 'Havo xizmati', 'Havo remonti']),
        'I': generate100Words(['Ish', 'It', 'Ikki', 'It o\'rnatish', 'It xizmati', 'It remonti', 'It tuzatish', 'It yig\'ish', 'It xizmati', 'It remonti']),
        'J': generate100Words(['Javob', 'Juda', 'Juma', 'Javob o\'rnatish', 'Javob xizmati', 'Javob remonti', 'Javob tuzatish', 'Javob yig\'ish', 'Javob xizmati', 'Javob remonti']),
        'K': generate100Words(['Kitob', 'Kuch', 'Kun', 'Kitob o\'rnatish', 'Kitob xizmati', 'Kitob remonti', 'Kitob tuzatish', 'Kitob yig\'ish', 'Kitob xizmati', 'Kitob remonti']),
        'L': generate100Words(['Lola', 'Limon', 'Lak', 'Lola o\'rnatish', 'Lola xizmati', 'Lola remonti', 'Lola tuzatish', 'Lola yig\'ish', 'Lola xizmati', 'Lola remonti']),
        'M': generate100Words(['Mashina', 'Maktab', 'Mushuk', 'Mushuk o\'rnatish', 'Mushuk xizmati', 'Mushuk remonti', 'Mushuk tuzatish', 'Mushuk yig\'ish', 'Mushuk xizmati', 'Mushuk remonti']),
        'N': generate100Words(['Non', 'Nar', 'Nima', 'Non o\'rnatish', 'Non xizmati', 'Non remonti', 'Non tuzatish', 'Non yig\'ish', 'Non xizmati', 'Non remonti']),
        'O': generate100Words(['Olma', 'O\'q', 'O\'t', 'Olma o\'rnatish', 'Olma xizmati', 'Olma remonti', 'Olma tuzatish', 'Olma yig\'ish', 'Olma xizmati', 'Olma remonti']),
        'P': generate100Words(['Poy', 'Pul', 'Pichoq', 'Poy o\'rnatish', 'Poy xizmati', 'Poy remonti', 'Poy tuzatish', 'Poy yig\'ish', 'Poy xizmati', 'Poy remonti']),
        'Q': generate100Words(['Qalam', 'Qiz', 'Qush', 'Qush o\'rnatish', 'Qush xizmati', 'Qush remonti', 'Qush tuzatish', 'Qush yig\'ish', 'Qush xizmati', 'Qush remonti']),
        'R': generate100Words(['Rang', 'Rasm', 'Ruchka', 'Rang o\'rnatish', 'Rang xizmati', 'Rang remonti', 'Rang tuzatish', 'Rang yig\'ish', 'Rang xizmati', 'Rang remonti']),
        'S': generate100Words(['Suv', 'Sichqon', 'Sut', 'Sichqon o\'rnatish', 'Sichqon xizmati', 'Sichqon remonti', 'Sichqon tuzatish', 'Sichqon yig\'ish', 'Sichqon xizmati', 'Sichqon remonti']),
        'T': generate100Words(['Tosh', 'Tovuq', 'Tuz', 'Tovuq o\'rnatish', 'Tovuq xizmati', 'Tovuq remonti', 'Tovuq tuzatish', 'Tovuq yig\'ish', 'Tovuq xizmati', 'Tovuq remonti']),
        'U': generate100Words(['Uy', 'Uch', 'Uzum', 'Uy o\'rnatish', 'Uy xizmati', 'Uy remonti', 'Uy tuzatish', 'Uy yig\'ish', 'Uy xizmati', 'Uy remonti']),
        'V': generate100Words(['Voy', 'Vazifa', 'Vilka', 'Voy o\'rnatish', 'Voy xizmati', 'Voy remonti', 'Voy tuzatish', 'Voy yig\'ish', 'Voy xizmati', 'Voy remonti']),
        'X': generate100Words(['Xona', 'Xat', 'Xalq', 'Xona o\'rnatish', 'Xona xizmati', 'Xona remonti', 'Xona tuzatish', 'Xona yig\'ish', 'Xona xizmati', 'Xona remonti']),
        'Y': generate100Words(['Yoz', 'Yil', 'Yuz', 'Yoz o\'rnatish', 'Yoz xizmati', 'Yoz remonti', 'Yoz tuzatish', 'Yoz yig\'ish', 'Yoz xizmati', 'Yoz remonti']),
        'Z': generate100Words(['Zar', 'Zamin', 'Zarb', 'Zar o\'rnatish', 'Zar xizmati', 'Zar remonti', 'Zar tuzatish', 'Zar yig\'ish', 'Zar xizmati', 'Zar remonti']),
        'O\'': generate100Words(['O\'q', 'O\'t', 'O\'g\'il', 'O\'q o\'rnatish', 'O\'q xizmati', 'O\'q remonti', 'O\'q tuzatish', 'O\'q yig\'ish', 'O\'q xizmati', 'O\'q remonti']),
        'G\'': generate100Words(['G\'isht', 'G\'oza', 'G\'oyib', 'G\'isht o\'rnatish', 'G\'isht xizmati', 'G\'isht remonti', 'G\'isht tuzatish', 'G\'isht yig\'ish', 'G\'isht xizmati', 'G\'isht remonti']),
        'Sh': generate100Words(['Shahar', 'Shamol', 'Shox', 'Shahar o\'rnatish', 'Shahar xizmati', 'Shahar remonti', 'Shahar tuzatish', 'Shahar yig\'ish', 'Shahar xizmati', 'Shahar remonti']),
        'Ch': generate100Words(['Choy', 'Chiroq', 'Chiqish', 'Choy o\'rnatish', 'Choy xizmati', 'Choy remonti', 'Choy tuzatish', 'Choy yig\'ish', 'Choy xizmati', 'Choy remonti']),
        'Ng': generate100Words(['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz', 'Ming o\'rnatish', 'Ming xizmati', 'Ming remonti', 'Ming tuzatish', 'Ming yig\'ish', 'Ming xizmati', 'Ming remonti']),
      },
      'Ranglar': {
        'A': generate100Words(['Apelsin', 'Anor', 'Archa', 'Aq', 'Asal', 'Aylana', 'Ariq', 'Afsus', 'Aql', 'Aqrab']),
        'B': generate100Words(['Binafsha', 'Binafsha rang', 'Binafsha ko\'k', 'Binafsha pushti', 'Binafsha qizil', 'Binafsha sariq', 'Binafsha yashil', 'Binafsha oq', 'Binafsha qora', 'Binafsha kulrang']),
        'D': generate100Words(['Daraxt', 'Daraxt yashil', 'Daraxt ko\'k', 'Daraxt sariq', 'Daraxt qizil', 'Daraxt oq', 'Daraxt qora', 'Daraxt pushti', 'Daraxt binafsha', 'Daraxt jigarrang']),
        'E': generate100Words(['Eshik', 'Eshik rang', 'Eshik ko\'k', 'Eshik yashil', 'Eshik sariq', 'Eshik qizil', 'Eshik oq', 'Eshik qora', 'Eshik pushti', 'Eshik binafsha']),
        'F': generate100Words(['Futbol', 'Futbol rang', 'Futbol ko\'k', 'Futbol yashil', 'Futbol sariq', 'Futbol qizil', 'Futbol oq', 'Futbol qora', 'Futbol pushti', 'Futbol binafsha']),
        'G': generate100Words(['Gul', 'Gul rang', 'Gul ko\'k', 'Gul yashil', 'Gul sariq', 'Gul qizil', 'Gul oq', 'Gul qora', 'Gul pushti', 'Gul binafsha']),
        'H': generate100Words(['Havo', 'Havo ko\'k', 'Havo yashil', 'Havo sariq', 'Havo qizil', 'Havo oq', 'Havo qora', 'Havo pushti', 'Havo binafsha', 'Havo kulrang']),
        'I': generate100Words(['Ish', 'Ish rang', 'Ish ko\'k', 'Ish yashil', 'Ish sariq', 'Ish qizil', 'Ish oq', 'Ish qora', 'Ish pushti', 'Ish binafsha']),
        'J': generate100Words(['Javob', 'Javob rang', 'Javob ko\'k', 'Javob yashil', 'Javob sariq', 'Javob qizil', 'Javob oq', 'Javob qora', 'Javob pushti', 'Javob binafsha']),
        'K': generate100Words(['Ko\'k', 'Ko\'k rang', 'Ko\'k yashil', 'Ko\'k sariq', 'Ko\'k qizil', 'Ko\'k oq', 'Ko\'k qora', 'Ko\'k pushti', 'Ko\'k binafsha', 'Ko\'k kulrang']),
        'L': generate100Words(['Lola', 'Lola rang', 'Lola ko\'k', 'Lola yashil', 'Lola sariq', 'Lola qizil', 'Lola oq', 'Lola qora', 'Lola pushti', 'Lola binafsha']),
        'M': generate100Words(['Mashina', 'Mashina rang', 'Mashina ko\'k', 'Mashina yashil', 'Mashina sariq', 'Mashina qizil', 'Mashina oq', 'Mashina qora', 'Mashina pushti', 'Mashina binafsha']),
        'N': generate100Words(['Non', 'Non rang', 'Non ko\'k', 'Non yashil', 'Non sariq', 'Non qizil', 'Non oq', 'Non qora', 'Non pushti', 'Non binafsha']),
        'O': generate100Words(['Oq', 'Oq rang', 'Oq ko\'k', 'Oq yashil', 'Oq sariq', 'Oq qizil', 'Oq qora', 'Oq pushti', 'Oq binafsha', 'Oq kulrang']),
        'P': generate100Words(['Pushti', 'Pushti rang', 'Pushti ko\'k', 'Pushti yashil', 'Pushti sariq', 'Pushti qizil', 'Pushti oq', 'Pushti qora', 'Pushti binafsha', 'Pushti kulrang']),
        'Q': generate100Words(['Qizil', 'Qizil rang', 'Qizil ko\'k', 'Qizil yashil', 'Qizil sariq', 'Qizil oq', 'Qizil qora', 'Qizil pushti', 'Qizil binafsha', 'Qizil kulrang']),
        'R': generate100Words(['Rang', 'Rang ko\'k', 'Rang yashil', 'Rang sariq', 'Rang qizil', 'Rang oq', 'Rang qora', 'Rang pushti', 'Rang binafsha', 'Rang kulrang']),
        'S': generate100Words(['Sariq', 'Sariq rang', 'Sariq ko\'k', 'Sariq yashil', 'Sariq qizil', 'Sariq oq', 'Sariq qora', 'Sariq pushti', 'Sariq binafsha', 'Sariq kulrang']),
        'T': generate100Words(['Tosh', 'Tosh rang', 'Tosh ko\'k', 'Tosh yashil', 'Tosh sariq', 'Tosh qizil', 'Tosh oq', 'Tosh qora', 'Tosh pushti', 'Tosh binafsha']),
        'U': generate100Words(['Uy', 'Uy rang', 'Uy ko\'k', 'Uy yashil', 'Uy sariq', 'Uy qizil', 'Uy oq', 'Uy qora', 'Uy pushti', 'Uy binafsha']),
        'V': generate100Words(['Voy', 'Voy rang', 'Voy ko\'k', 'Voy yashil', 'Voy sariq', 'Voy qizil', 'Voy oq', 'Voy qora', 'Voy pushti', 'Voy binafsha']),
        'X': generate100Words(['Xona', 'Xona rang', 'Xona ko\'k', 'Xona yashil', 'Xona sariq', 'Xona qizil', 'Xona oq', 'Xona qora', 'Xona pushti', 'Xona binafsha']),
        'Y': generate100Words(['Yashil', 'Yashil rang', 'Yashil ko\'k', 'Yashil sariq', 'Yashil qizil', 'Yashil oq', 'Yashil qora', 'Yashil pushti', 'Yashil binafsha', 'Yashil kulrang']),
        'Z': generate100Words(['Zar', 'Zar rang', 'Zar ko\'k', 'Zar yashil', 'Zar sariq', 'Zar qizil', 'Zar oq', 'Zar qora', 'Zar pushti', 'Zar binafsha']),
        'O\'': generate100Words(['O\'q', 'O\'q rang', 'O\'q ko\'k', 'O\'q yashil', 'O\'q sariq', 'O\'q qizil', 'O\'q oq', 'O\'q qora', 'O\'q pushti', 'O\'q binafsha']),
        'G\'': generate100Words(['G\'isht', 'G\'isht rang', 'G\'isht ko\'k', 'G\'isht yashil', 'G\'isht sariq', 'G\'isht qizil', 'G\'isht oq', 'G\'isht qora', 'G\'isht pushti', 'G\'isht binafsha']),
        'Sh': generate100Words(['Shahar', 'Shahar rang', 'Shahar ko\'k', 'Shahar yashil', 'Shahar sariq', 'Shahar qizil', 'Shahar oq', 'Shahar qora', 'Shahar pushti', 'Shahar binafsha']),
        'Ch': generate100Words(['Choy', 'Choy rang', 'Choy ko\'k', 'Choy yashil', 'Choy sariq', 'Choy qizil', 'Choy oq', 'Choy qora', 'Choy pushti', 'Choy binafsha']),
        'Ng': generate100Words(['Ming', 'Ming rang', 'Ming ko\'k', 'Ming yashil', 'Ming sariq', 'Ming qizil', 'Ming oq', 'Ming qora', 'Ming pushti', 'Ming binafsha']),
      },
      'Musiqa': {
        'A': generate100Words(['Asal', 'Asal ovoz', 'Asal qo\'shiq', 'Asal musiqa', 'Asal ohang', 'Asal kuylash', 'Asal chalish', 'Asal eshitish', 'Asal ijro', 'Asal konsert']),
        'B': generate100Words(['Bola', 'Bola qo\'shiq', 'Bola musiqa', 'Bola ohang', 'Bola kuylash', 'Bola chalish', 'Bola eshitish', 'Bola ijro', 'Bola konsert', 'Bola ovoz']),
        'D': generate100Words(['Daraxt', 'Daraxt qo\'shiq', 'Daraxt musiqa', 'Daraxt ohang', 'Daraxt kuylash', 'Daraxt chalish', 'Daraxt eshitish', 'Daraxt ijro', 'Daraxt konsert', 'Daraxt ovoz']),
        'E': generate100Words(['Eshik', 'Eshik qo\'shiq', 'Eshik musiqa', 'Eshik ohang', 'Eshik kuylash', 'Eshik chalish', 'Eshik eshitish', 'Eshik ijro', 'Eshik konsert', 'Eshik ovoz']),
        'F': generate100Words(['Futbol', 'Futbol qo\'shiq', 'Futbol musiqa', 'Futbol ohang', 'Futbol kuylash', 'Futbol chalish', 'Futbol eshitish', 'Futbol ijro', 'Futbol konsert', 'Futbol ovoz']),
        'G': generate100Words(['Gul', 'Gul qo\'shiq', 'Gul musiqa', 'Gul ohang', 'Gul kuylash', 'Gul chalish', 'Gul eshitish', 'Gul ijro', 'Gul konsert', 'Gul ovoz']),
        'H': generate100Words(['Havo', 'Havo qo\'shiq', 'Havo musiqa', 'Havo ohang', 'Havo kuylash', 'Havo chalish', 'Havo eshitish', 'Havo ijro', 'Havo konsert', 'Havo ovoz']),
        'I': generate100Words(['Ijro', 'Ijro qo\'shiq', 'Ijro musiqa', 'Ijro ohang', 'Ijro kuylash', 'Ijro chalish', 'Ijro eshitish', 'Ijro konsert', 'Ijro ovoz', 'Ijro asbob']),
        'J': generate100Words(['Javob', 'Javob qo\'shiq', 'Javob musiqa', 'Javob ohang', 'Javob kuylash', 'Javob chalish', 'Javob eshitish', 'Javob ijro', 'Javob konsert', 'Javob ovoz']),
        'K': generate100Words(['Kuylash', 'Kuylash qo\'shiq', 'Kuylash musiqa', 'Kuylash ohang', 'Kuylash chalish', 'Kuylash eshitish', 'Kuylash ijro', 'Kuylash konsert', 'Kuylash ovoz', 'Kuylash asbob']),
        'L': generate100Words(['Lola', 'Lola qo\'shiq', 'Lola musiqa', 'Lola ohang', 'Lola kuylash', 'Lola chalish', 'Lola eshitish', 'Lola ijro', 'Lola konsert', 'Lola ovoz']),
        'M': generate100Words(['Musiqa', 'Musiqa qo\'shiq', 'Musiqa ohang', 'Musiqa kuylash', 'Musiqa chalish', 'Musiqa eshitish', 'Musiqa ijro', 'Musiqa konsert', 'Musiqa ovoz', 'Musiqa asbob']),
        'N': generate100Words(['Non', 'Non qo\'shiq', 'Non musiqa', 'Non ohang', 'Non kuylash', 'Non chalish', 'Non eshitish', 'Non ijro', 'Non konsert', 'Non ovoz']),
        'O': generate100Words(['Ohang', 'Ohang qo\'shiq', 'Ohang musiqa', 'Ohang kuylash', 'Ohang chalish', 'Ohang eshitish', 'Ohang ijro', 'Ohang konsert', 'Ohang ovoz', 'Ohang asbob']),
        'P': generate100Words(['Poy', 'Poy qo\'shiq', 'Poy musiqa', 'Poy ohang', 'Poy kuylash', 'Poy chalish', 'Poy eshitish', 'Poy ijro', 'Poy konsert', 'Poy ovoz']),
        'Q': generate100Words(['Qo\'shiq', 'Qo\'shiq musiqa', 'Qo\'shiq ohang', 'Qo\'shiq kuylash', 'Qo\'shiq chalish', 'Qo\'shiq eshitish', 'Qo\'shiq ijro', 'Qo\'shiq konsert', 'Qo\'shiq ovoz', 'Qo\'shiq asbob']),
        'R': generate100Words(['Rang', 'Rang qo\'shiq', 'Rang musiqa', 'Rang ohang', 'Rang kuylash', 'Rang chalish', 'Rang eshitish', 'Rang ijro', 'Rang konsert', 'Rang ovoz']),
        'S': generate100Words(['Suv', 'Suv qo\'shiq', 'Suv musiqa', 'Suv ohang', 'Suv kuylash', 'Suv chalish', 'Suv eshitish', 'Suv ijro', 'Suv konsert', 'Suv ovoz']),
        'T': generate100Words(['Tosh', 'Tosh qo\'shiq', 'Tosh musiqa', 'Tosh ohang', 'Tosh kuylash', 'Tosh chalish', 'Tosh eshitish', 'Tosh ijro', 'Tosh konsert', 'Tosh ovoz']),
        'U': generate100Words(['Uy', 'Uy qo\'shiq', 'Uy musiqa', 'Uy ohang', 'Uy kuylash', 'Uy chalish', 'Uy eshitish', 'Uy ijro', 'Uy konsert', 'Uy ovoz']),
        'V': generate100Words(['Voy', 'Voy qo\'shiq', 'Voy musiqa', 'Voy ohang', 'Voy kuylash', 'Voy chalish', 'Voy eshitish', 'Voy ijro', 'Voy konsert', 'Voy ovoz']),
        'X': generate100Words(['Xona', 'Xona qo\'shiq', 'Xona musiqa', 'Xona ohang', 'Xona kuylash', 'Xona chalish', 'Xona eshitish', 'Xona ijro', 'Xona konsert', 'Xona ovoz']),
        'Y': generate100Words(['Yoz', 'Yoz qo\'shiq', 'Yoz musiqa', 'Yoz ohang', 'Yoz kuylash', 'Yoz chalish', 'Yoz eshitish', 'Yoz ijro', 'Yoz konsert', 'Yoz ovoz']),
        'Z': generate100Words(['Zar', 'Zar qo\'shiq', 'Zar musiqa', 'Zar ohang', 'Zar kuylash', 'Zar chalish', 'Zar eshitish', 'Zar ijro', 'Zar konsert', 'Zar ovoz']),
        'O\'': generate100Words(['O\'q', 'O\'q qo\'shiq', 'O\'q musiqa', 'O\'q ohang', 'O\'q kuylash', 'O\'q chalish', 'O\'q eshitish', 'O\'q ijro', 'O\'q konsert', 'O\'q ovoz']),
        'G\'': generate100Words(['G\'isht', 'G\'isht qo\'shiq', 'G\'isht musiqa', 'G\'isht ohang', 'G\'isht kuylash', 'G\'isht chalish', 'G\'isht eshitish', 'G\'isht ijro', 'G\'isht konsert', 'G\'isht ovoz']),
        'Sh': generate100Words(['Shahar', 'Shahar qo\'shiq', 'Shahar musiqa', 'Shahar ohang', 'Shahar kuylash', 'Shahar chalish', 'Shahar eshitish', 'Shahar ijro', 'Shahar konsert', 'Shahar ovoz']),
        'Ch': generate100Words(['Chalish', 'Chalish qo\'shiq', 'Chalish musiqa', 'Chalish ohang', 'Chalish kuylash', 'Chalish eshitish', 'Chalish ijro', 'Chalish konsert', 'Chalish ovoz', 'Chalish asbob']),
        'Ng': generate100Words(['Ming', 'Ming qo\'shiq', 'Ming musiqa', 'Ming ohang', 'Ming kuylash', 'Ming chalish', 'Ming eshitish', 'Ming ijro', 'Ming konsert', 'Ming ovoz']),
      },
      'Kitoblar': {
        'A': generate100Words(['Alifbe', 'Alifbe kitob', 'Alifbe o\'qish', 'Alifbe hikoya', 'Alifbe qissa', 'Alifbe she\'r', 'Alifbe qo\'shiq', 'Alifbe dars', 'Alifbe maktab', 'Alifbe o\'qituvchi', 'Asal', 'Asal kitob', 'Asal o\'qish', 'Asal hikoya', 'Asal qissa', 'Asal she\'r', 'Asal qo\'shiq', 'Asal dars', 'Asal maktab', 'Asal o\'qituvchi', 'Ajoyib', 'Ajoyib kitob', 'Ajoyib o\'qish', 'Ajoyib hikoya', 'Ajoyib qissa', 'Ajoyib she\'r', 'Ajoyib qo\'shiq', 'Ajoyib dars', 'Ajoyib maktab', 'Ajoyib o\'qituvchi', 'Adabiyot', 'Adabiyot kitob', 'Adabiyot o\'qish', 'Adabiyot hikoya', 'Adabiyot qissa', 'Adabiyot she\'r', 'Adabiyot qo\'shiq', 'Adabiyot dars', 'Adabiyot maktab', 'Adabiyot o\'qituvchi', 'Afsona', 'Afsona kitob', 'Afsona o\'qish', 'Afsona hikoya', 'Afsona qissa', 'Afsona she\'r', 'Afsona qo\'shiq', 'Afsona dars', 'Afsona maktab', 'Afsona o\'qituvchi', 'Aql', 'Aql kitob', 'Aql o\'qish', 'Aql hikoya', 'Aql qissa', 'Aql she\'r', 'Aql qo\'shiq', 'Aql dars', 'Aql maktab', 'Aql o\'qituvchi', 'Aql-idrok', 'Aql-idrok kitob', 'Aql-idrok o\'qish', 'Aql-idrok hikoya', 'Aql-idrok qissa', 'Aql-idrok she\'r', 'Aql-idrok qo\'shiq', 'Aql-idrok dars', 'Aql-idrok maktab', 'Aql-idrok o\'qituvchi', 'Aql-zakovat', 'Aql-zakovat kitob', 'Aql-zakovat o\'qish', 'Aql-zakovat hikoya', 'Aql-zakovat qissa', 'Aql-zakovat she\'r', 'Aql-zakovat qo\'shiq', 'Aql-zakovat dars', 'Aql-zakovat maktab', 'Aql-zakovat o\'qituvchi', 'Aql-zakovat', 'Aql-zakovat kitob', 'Aql-zakovat o\'qish', 'Aql-zakovat hikoya', 'Aql-zakovat qissa', 'Aql-zakovat she\'r', 'Aql-zakovat qo\'shiq', 'Aql-zakovat dars', 'Aql-zakovat maktab', 'Aql-zakovat o\'qituvchi']),
        'B': generate100Words(['Bola', 'Bola kitob', 'Bola o\'qish', 'Bola hikoya', 'Bola qissa', 'Bola she\'r', 'Bola qo\'shiq', 'Bola dars', 'Bola maktab', 'Bola o\'qituvchi']),
        'D': generate100Words(['Daraxt', 'Daraxt kitob', 'Daraxt o\'qish', 'Daraxt hikoya', 'Daraxt qissa', 'Daraxt she\'r', 'Daraxt qo\'shiq', 'Daraxt dars', 'Daraxt maktab', 'Daraxt o\'qituvchi']),
        'E': generate100Words(['Eshik', 'Eshik kitob', 'Eshik o\'qish', 'Eshik hikoya', 'Eshik qissa', 'Eshik she\'r', 'Eshik qo\'shiq', 'Eshik dars', 'Eshik maktab', 'Eshik o\'qituvchi']),
        'F': generate100Words(['Futbol', 'Futbol kitob', 'Futbol o\'qish', 'Futbol hikoya', 'Futbol qissa', 'Futbol she\'r', 'Futbol qo\'shiq', 'Futbol dars', 'Futbol maktab', 'Futbol o\'qituvchi']),
        'G': generate100Words(['Gul', 'Gul kitob', 'Gul o\'qish', 'Gul hikoya', 'Gul qissa', 'Gul she\'r', 'Gul qo\'shiq', 'Gul dars', 'Gul maktab', 'Gul o\'qituvchi']),
        'H': generate100Words(['Hikoya', 'Hikoya kitob', 'Hikoya o\'qish', 'Hikoya qissa', 'Hikoya she\'r', 'Hikoya qo\'shiq', 'Hikoya dars', 'Hikoya maktab', 'Hikoya o\'qituvchi', 'Hikoya muallif']),
        'I': generate100Words(['Ish', 'Ish kitob', 'Ish o\'qish', 'Ish hikoya', 'Ish qissa', 'Ish she\'r', 'Ish qo\'shiq', 'Ish dars', 'Ish maktab', 'Ish o\'qituvchi']),
        'J': generate100Words(['Javob', 'Javob kitob', 'Javob o\'qish', 'Javob hikoya', 'Javob qissa', 'Javob she\'r', 'Javob qo\'shiq', 'Javob dars', 'Javob maktab', 'Javob o\'qituvchi']),
        'K': generate100Words(['Kitob', 'Kitob o\'qish', 'Kitob hikoya', 'Kitob qissa', 'Kitob she\'r', 'Kitob qo\'shiq', 'Kitob dars', 'Kitob maktab', 'Kitob o\'qituvchi', 'Kitob muallif']),
        'L': generate100Words(['Lola', 'Lola kitob', 'Lola o\'qish', 'Lola hikoya', 'Lola qissa', 'Lola she\'r', 'Lola qo\'shiq', 'Lola dars', 'Lola maktab', 'Lola o\'qituvchi']),
        'M': generate100Words(['Maktab', 'Maktab kitob', 'Maktab o\'qish', 'Maktab hikoya', 'Maktab qissa', 'Maktab she\'r', 'Maktab qo\'shiq', 'Maktab dars', 'Maktab o\'qituvchi', 'Maktab muallif']),
        'N': generate100Words(['Non', 'Non kitob', 'Non o\'qish', 'Non hikoya', 'Non qissa', 'Non she\'r', 'Non qo\'shiq', 'Non dars', 'Non maktab', 'Non o\'qituvchi']),
        'O': generate100Words(['O\'qish', 'O\'qish kitob', 'O\'qish hikoya', 'O\'qish qissa', 'O\'qish she\'r', 'O\'qish qo\'shiq', 'O\'qish dars', 'O\'qish maktab', 'O\'qish o\'qituvchi', 'O\'qish muallif']),
        'P': generate100Words(['Poy', 'Poy kitob', 'Poy o\'qish', 'Poy hikoya', 'Poy qissa', 'Poy she\'r', 'Poy qo\'shiq', 'Poy dars', 'Poy maktab', 'Poy o\'qituvchi']),
        'Q': generate100Words(['Qissa', 'Qissa kitob', 'Qissa o\'qish', 'Qissa hikoya', 'Qissa she\'r', 'Qissa qo\'shiq', 'Qissa dars', 'Qissa maktab', 'Qissa o\'qituvchi', 'Qissa muallif']),
        'R': generate100Words(['Rang', 'Rang kitob', 'Rang o\'qish', 'Rang hikoya', 'Rang qissa', 'Rang she\'r', 'Rang qo\'shiq', 'Rang dars', 'Rang maktab', 'Rang o\'qituvchi']),
        'S': generate100Words(['She\'r', 'She\'r kitob', 'She\'r o\'qish', 'She\'r hikoya', 'She\'r qissa', 'She\'r qo\'shiq', 'She\'r dars', 'She\'r maktab', 'She\'r o\'qituvchi', 'She\'r muallif']),
        'T': generate100Words(['Tosh', 'Tosh kitob', 'Tosh o\'qish', 'Tosh hikoya', 'Tosh qissa', 'Tosh she\'r', 'Tosh qo\'shiq', 'Tosh dars', 'Tosh maktab', 'Tosh o\'qituvchi']),
        'U': generate100Words(['Uy', 'Uy kitob', 'Uy o\'qish', 'Uy hikoya', 'Uy qissa', 'Uy she\'r', 'Uy qo\'shiq', 'Uy dars', 'Uy maktab', 'Uy o\'qituvchi']),
        'V': generate100Words(['Voy', 'Voy kitob', 'Voy o\'qish', 'Voy hikoya', 'Voy qissa', 'Voy she\'r', 'Voy qo\'shiq', 'Voy dars', 'Voy maktab', 'Voy o\'qituvchi']),
        'X': generate100Words(['Xona', 'Xona kitob', 'Xona o\'qish', 'Xona hikoya', 'Xona qissa', 'Xona she\'r', 'Xona qo\'shiq', 'Xona dars', 'Xona maktab', 'Xona o\'qituvchi']),
        'Y': generate100Words(['Yoz', 'Yoz kitob', 'Yoz o\'qish', 'Yoz hikoya', 'Yoz qissa', 'Yoz she\'r', 'Yoz qo\'shiq', 'Yoz dars', 'Yoz maktab', 'Yoz o\'qituvchi']),
        'Z': generate100Words(['Zar', 'Zar kitob', 'Zar o\'qish', 'Zar hikoya', 'Zar qissa', 'Zar she\'r', 'Zar qo\'shiq', 'Zar dars', 'Zar maktab', 'Zar o\'qituvchi']),
        'O\'': generate100Words(['O\'q', 'O\'q kitob', 'O\'q o\'qish', 'O\'q hikoya', 'O\'q qissa', 'O\'q she\'r', 'O\'q qo\'shiq', 'O\'q dars', 'O\'q maktab', 'O\'q o\'qituvchi']),
        'G\'': generate100Words(['G\'isht', 'G\'isht kitob', 'G\'isht o\'qish', 'G\'isht hikoya', 'G\'isht qissa', 'G\'isht she\'r', 'G\'isht qo\'shiq', 'G\'isht dars', 'G\'isht maktab', 'G\'isht o\'qituvchi']),
        'Sh': generate100Words(['Shahar', 'Shahar kitob', 'Shahar o\'qish', 'Shahar hikoya', 'Shahar qissa', 'Shahar she\'r', 'Shahar qo\'shiq', 'Shahar dars', 'Shahar maktab', 'Shahar o\'qituvchi']),
        'Ch': generate100Words(['Choy', 'Choy kitob', 'Choy o\'qish', 'Choy hikoya', 'Choy qissa', 'Choy she\'r', 'Choy qo\'shiq', 'Choy dars', 'Choy maktab', 'Choy o\'qituvchi']),
        'Ng': generate100Words(['Ming', 'Ming kitob', 'Ming o\'qish', 'Ming hikoya', 'Ming qissa', 'Ming she\'r', 'Ming qo\'shiq', 'Ming dars', 'Ming maktab', 'Ming o\'qituvchi']),
      },
      'O\'yinlar': {
        'A': generate100Words(['Asal', 'Asal o\'yin', 'Asal o\'ynash', 'Asal o\'yinchi', 'Asal o\'yin maydoni', 'Asal o\'yin qoidasi', 'Asal o\'yin qurilishi', 'Asal o\'yin o\'rnatish', 'Asal o\'yin xizmati', 'Asal o\'yin remonti']),
        'B': generate100Words(['Bola', 'Bola o\'yin', 'Bola o\'ynash', 'Bola o\'yinchi', 'Bola o\'yin maydoni', 'Bola o\'yin qoidasi', 'Bola o\'yin qurilishi', 'Bola o\'yin o\'rnatish', 'Bola o\'yin xizmati', 'Bola o\'yin remonti']),
        'D': generate100Words(['Daraxt', 'Daraxt o\'yin', 'Daraxt o\'ynash', 'Daraxt o\'yinchi', 'Daraxt o\'yin maydoni', 'Daraxt o\'yin qoidasi', 'Daraxt o\'yin qurilishi', 'Daraxt o\'yin o\'rnatish', 'Daraxt o\'yin xizmati', 'Daraxt o\'yin remonti']),
        'E': generate100Words(['Eshik', 'Eshik o\'yin', 'Eshik o\'ynash', 'Eshik o\'yinchi', 'Eshik o\'yin maydoni', 'Eshik o\'yin qoidasi', 'Eshik o\'yin qurilishi', 'Eshik o\'yin o\'rnatish', 'Eshik o\'yin xizmati', 'Eshik o\'yin remonti']),
        'F': generate100Words(['Futbol', 'Futbol o\'yin', 'Futbol o\'ynash', 'Futbol o\'yinchi', 'Futbol o\'yin maydoni', 'Futbol o\'yin qoidasi', 'Futbol o\'yin qurilishi', 'Futbol o\'yin o\'rnatish', 'Futbol o\'yin xizmati', 'Futbol o\'yin remonti']),
        'G': generate100Words(['Gul', 'Gul o\'yin', 'Gul o\'ynash', 'Gul o\'yinchi', 'Gul o\'yin maydoni', 'Gul o\'yin qoidasi', 'Gul o\'yin qurilishi', 'Gul o\'yin o\'rnatish', 'Gul o\'yin xizmati', 'Gul o\'yin remonti']),
        'H': generate100Words(['Havo', 'Havo o\'yin', 'Havo o\'ynash', 'Havo o\'yinchi', 'Havo o\'yin maydoni', 'Havo o\'yin qoidasi', 'Havo o\'yin qurilishi', 'Havo o\'yin o\'rnatish', 'Havo o\'yin xizmati', 'Havo o\'yin remonti']),
        'I': generate100Words(['Ish', 'Ish o\'yin', 'Ish o\'ynash', 'Ish o\'yinchi', 'Ish o\'yin maydoni', 'Ish o\'yin qoidasi', 'Ish o\'yin qurilishi', 'Ish o\'yin o\'rnatish', 'Ish o\'yin xizmati', 'Ish o\'yin remonti']),
        'J': generate100Words(['Javob', 'Javob o\'yin', 'Javob o\'ynash', 'Javob o\'yinchi', 'Javob o\'yin maydoni', 'Javob o\'yin qoidasi', 'Javob o\'yin qurilishi', 'Javob o\'yin o\'rnatish', 'Javob o\'yin xizmati', 'Javob o\'yin remonti']),
        'K': generate100Words(['Kitob', 'Kitob o\'yin', 'Kitob o\'ynash', 'Kitob o\'yinchi', 'Kitob o\'yin maydoni', 'Kitob o\'yin qoidasi', 'Kitob o\'yin qurilishi', 'Kitob o\'yin o\'rnatish', 'Kitob o\'yin xizmati', 'Kitob o\'yin remonti']),
        'L': generate100Words(['Lola', 'Lola o\'yin', 'Lola o\'ynash', 'Lola o\'yinchi', 'Lola o\'yin maydoni', 'Lola o\'yin qoidasi', 'Lola o\'yin qurilishi', 'Lola o\'yin o\'rnatish', 'Lola o\'yin xizmati', 'Lola o\'yin remonti']),
        'M': generate100Words(['Mashina', 'Mashina o\'yin', 'Mashina o\'ynash', 'Mashina o\'yinchi', 'Mashina o\'yin maydoni', 'Mashina o\'yin qoidasi', 'Mashina o\'yin qurilishi', 'Mashina o\'yin o\'rnatish', 'Mashina o\'yin xizmati', 'Mashina o\'yin remonti']),
        'N': generate100Words(['Non', 'Non o\'yin', 'Non o\'ynash', 'Non o\'yinchi', 'Non o\'yin maydoni', 'Non o\'yin qoidasi', 'Non o\'yin qurilishi', 'Non o\'yin o\'rnatish', 'Non o\'yin xizmati', 'Non o\'yin remonti']),
        'O': generate100Words(['O\'yin', 'O\'yin o\'ynash', 'O\'yin o\'yinchi', 'O\'yin maydoni', 'O\'yin qoidasi', 'O\'yin qurilishi', 'O\'yin o\'rnatish', 'O\'yin xizmati', 'O\'yin remonti', 'O\'yin tuzatish']),
        'P': generate100Words(['Poy', 'Poy o\'yin', 'Poy o\'ynash', 'Poy o\'yinchi', 'Poy o\'yin maydoni', 'Poy o\'yin qoidasi', 'Poy o\'yin qurilishi', 'Poy o\'yin o\'rnatish', 'Poy o\'yin xizmati', 'Poy o\'yin remonti']),
        'Q': generate100Words(['Qalam', 'Qalam o\'yin', 'Qalam o\'ynash', 'Qalam o\'yinchi', 'Qalam o\'yin maydoni', 'Qalam o\'yin qoidasi', 'Qalam o\'yin qurilishi', 'Qalam o\'yin o\'rnatish', 'Qalam o\'yin xizmati', 'Qalam o\'yin remonti']),
        'R': generate100Words(['Rang', 'Rang o\'yin', 'Rang o\'ynash', 'Rang o\'yinchi', 'Rang o\'yin maydoni', 'Rang o\'yin qoidasi', 'Rang o\'yin qurilishi', 'Rang o\'yin o\'rnatish', 'Rang o\'yin xizmati', 'Rang o\'yin remonti']),
        'S': generate100Words(['Suv', 'Suv o\'yin', 'Suv o\'ynash', 'Suv o\'yinchi', 'Suv o\'yin maydoni', 'Suv o\'yin qoidasi', 'Suv o\'yin qurilishi', 'Suv o\'yin o\'rnatish', 'Suv o\'yin xizmati', 'Suv o\'yin remonti']),
        'T': generate100Words(['Tosh', 'Tosh o\'yin', 'Tosh o\'ynash', 'Tosh o\'yinchi', 'Tosh o\'yin maydoni', 'Tosh o\'yin qoidasi', 'Tosh o\'yin qurilishi', 'Tosh o\'yin o\'rnatish', 'Tosh o\'yin xizmati', 'Tosh o\'yin remonti']),
        'U': generate100Words(['Uy', 'Uy o\'yin', 'Uy o\'ynash', 'Uy o\'yinchi', 'Uy o\'yin maydoni', 'Uy o\'yin qoidasi', 'Uy o\'yin qurilishi', 'Uy o\'yin o\'rnatish', 'Uy o\'yin xizmati', 'Uy o\'yin remonti']),
        'V': generate100Words(['Voy', 'Voy o\'yin', 'Voy o\'ynash', 'Voy o\'yinchi', 'Voy o\'yin maydoni', 'Voy o\'yin qoidasi', 'Voy o\'yin qurilishi', 'Voy o\'yin o\'rnatish', 'Voy o\'yin xizmati', 'Voy o\'yin remonti']),
        'X': generate100Words(['Xona', 'Xona o\'yin', 'Xona o\'ynash', 'Xona o\'yinchi', 'Xona o\'yin maydoni', 'Xona o\'yin qoidasi', 'Xona o\'yin qurilishi', 'Xona o\'yin o\'rnatish', 'Xona o\'yin xizmati', 'Xona o\'yin remonti']),
        'Y': generate100Words(['Yoz', 'Yoz o\'yin', 'Yoz o\'ynash', 'Yoz o\'yinchi', 'Yoz o\'yin maydoni', 'Yoz o\'yin qoidasi', 'Yoz o\'yin qurilishi', 'Yoz o\'yin o\'rnatish', 'Yoz o\'yin xizmati', 'Yoz o\'yin remonti']),
        'Z': generate100Words(['Zar', 'Zar o\'yin', 'Zar o\'ynash', 'Zar o\'yinchi', 'Zar o\'yin maydoni', 'Zar o\'yin qoidasi', 'Zar o\'yin qurilishi', 'Zar o\'yin o\'rnatish', 'Zar o\'yin xizmati', 'Zar o\'yin remonti']),
        'O\'': generate100Words(['O\'q', 'O\'q o\'yin', 'O\'q o\'ynash', 'O\'q o\'yinchi', 'O\'q o\'yin maydoni', 'O\'q o\'yin qoidasi', 'O\'q o\'yin qurilishi', 'O\'q o\'yin o\'rnatish', 'O\'q o\'yin xizmati', 'O\'q o\'yin remonti']),
        'G\'': generate100Words(['G\'isht', 'G\'isht o\'yin', 'G\'isht o\'ynash', 'G\'isht o\'yinchi', 'G\'isht o\'yin maydoni', 'G\'isht o\'yin qoidasi', 'G\'isht o\'yin qurilishi', 'G\'isht o\'yin o\'rnatish', 'G\'isht o\'yin xizmati', 'G\'isht o\'yin remonti']),
        'Sh': generate100Words(['Shahar', 'Shahar o\'yin', 'Shahar o\'ynash', 'Shahar o\'yinchi', 'Shahar o\'yin maydoni', 'Shahar o\'yin qoidasi', 'Shahar o\'yin qurilishi', 'Shahar o\'yin o\'rnatish', 'Shahar o\'yin xizmati', 'Shahar o\'yin remonti']),
        'Ch': generate100Words(['Choy', 'Choy o\'yin', 'Choy o\'ynash', 'Choy o\'yinchi', 'Choy o\'yin maydoni', 'Choy o\'yin qoidasi', 'Choy o\'yin qurilishi', 'Choy o\'yin o\'rnatish', 'Choy o\'yin xizmati', 'Choy o\'yin remonti']),
        'Ng': generate100Words(['Ming', 'Ming o\'yin', 'Ming o\'ynash', 'Ming o\'yinchi', 'Ming o\'yin maydoni', 'Ming o\'yin qoidasi', 'Ming o\'yin qurilishi', 'Ming o\'yin o\'rnatish', 'Ming o\'yin xizmati', 'Ming o\'yin remonti']),
      },
    };
  };

  const getDefaultWords = (): Record<string, string[]> => {
    return {
      'A': ['Anor', 'Archa', 'Avtobus'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'L': ['Lola', 'Limon', 'Lak'],
      'B': ['Bola', 'Bosh', 'Bog\'', 'Bino', 'Birov', 'Biroq', 'Biroq', 'Biroq', 'Biroq', 'Biroq'],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    };
  };

  // Random shuffle funksiyasi (Fisher-Yates algoritmi)
  const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };


  // OpenAI "miya" orqali qiziqishlarga mos random so'zlarni generatsiya qilish
  const getExampleWords = async (letter: string): Promise<string[]> => {
    // Preferences'ni localStorage'dan olish
    const preferencesStr = localStorage.getItem('bolajon_child_preferences');
    let preferences: string[] = [];
    if (preferencesStr) {
      try {
        preferences = JSON.parse(preferencesStr);
        console.log('📋 Preferences found:', preferences);
      } catch (e) {
        console.warn('Preferences parse error:', e);
      }
    } else {
      console.log('📋 No preferences found in localStorage');
    }

    // OpenAI'dan random so'zlarni generatsiya qilish
    // Agar OpenAI API ishlamasa (quota tugasa), fallback preferences'ga mos so'zlarni qaytaradi
    try {
      const childAge = parseInt(localStorage.getItem('bolajon_child_age') || '5');
      console.log('🧠 Generating words with OpenAI:');
      console.log('  - Letter:', letter);
      console.log('  - Interests:', preferences.length > 0 ? preferences : 'none (will generate general words)');
      console.log('  - Child age:', childAge);
      console.log('  - Child name:', childName || 'Bola');
      
      const result = await generateWordsByInterest({
        letter,
        interests: preferences || [], // Bo'sh array ham yuboriladi
        childAge,
        childName: childName || 'Bola',
      });
      
      if (result.words && result.words.length > 0) {
        console.log('✅ OpenAI generated words:', result.words);
        return result.words;
      } else {
        console.warn('⚠️ OpenAI returned empty words, using fallback');
      }
    } catch (error) {
      console.error('❌ OpenAI word generation error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Error bo'lsa ham, fallback preferences'ga mos so'zlarni qaytaradi
    }
    
    // Fallback: OpenAI ishlamasa, preferences'ga mos so'zlarni qaytarish
    // generateWordsByInterest funksiyasi ichida getFallbackWords chaqiriladi
    // va u preferences'ga mos so'zlarni qaytaradi
    // Lekin bu yerda ham preferences'ga mos so'zlarni qaytarishimiz kerak
    console.log('🔄 Using fallback (OpenAI ishlamayapti, preferences bo\'yicha so\'zlar ishlatiladi)');
    
    // Preferences bo'lsa, ularga mos so'zlarni qaytarish
    if (preferences && preferences.length > 0) {
      console.log('🔍 Preferences:', preferences);
      const wordsByInterest = getWordsByInterest();
      console.log('🔍 wordsByInterest keys:', Object.keys(wordsByInterest));
      const allWordsForLetter: string[] = [];
      
      // Barcha qiziqishlar uchun so'zlarni yig'ish
      for (const interest of preferences) {
        if (wordsByInterest[interest] && wordsByInterest[interest][letter]) {
          const words = wordsByInterest[interest][letter];
          console.log(`🔍 ${interest} uchun ${letter} harfi: ${words.length} ta so'z`, words.slice(0, 5));
          allWordsForLetter.push(...words);
        }
      }
      
      console.log(`🔍 Jami ${letter} harfi uchun: ${allWordsForLetter.length} ta so'z`);
      
      // Barcha qiziqishlar uchun so'zlarni yig'ish
      for (const interest of preferences) {
        if (wordsByInterest[interest] && wordsByInterest[interest][letter]) {
          allWordsForLetter.push(...wordsByInterest[interest][letter]);
        }
      }

      // Agar qiziqishlarga mos so'zlar topilsa, random 3 tasini tanlash
      if (allWordsForLetter.length > 0) {
        const shuffled = shuffle(allWordsForLetter);
        const selectedWords = shuffled.slice(0, 3);
        console.log('✅ Fallback: Selected words by interests:', selectedWords);
        return selectedWords;
      }
    }
    
    // Preferences bo'lmasa yoki mos so'zlar topilmasa, default so'zlarni random qilish
    const defaultWords = getDefaultWords();
    const wordsForLetter = defaultWords[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
    // Random shuffle funksiyasi (Fisher-Yates algoritmi)
    const shuffleLocal = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    const shuffled = shuffleLocal(wordsForLetter);
    return shuffled.slice(0, 3);
  };



  // Synchronous version (fallback)
  const getExampleWordsSync = (letter: string): string[] => {
    const preferencesStr = localStorage.getItem('bolajon_child_preferences');
    console.log('🔍 Sync: Raw preferences from localStorage:', preferencesStr);
    let preferences: string[] = [];
    if (preferencesStr) {
      try {
        preferences = JSON.parse(preferencesStr);
        console.log('✅ Sync: Parsed preferences:', preferences);
      } catch (e) {
        console.warn('❌ Sync: Preferences parse error:', e);
      }
    } else {
      console.warn('⚠️ Sync: No preferences found in localStorage');
    }

    if (!preferences || preferences.length === 0) {
      console.warn('⚠️ Sync: Preferences bo\'sh, default so\'zlar ishlatilmoqda');
      const defaultWords = getDefaultWords();
      const wordsForLetter = defaultWords[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
      const shuffled = shuffle(wordsForLetter);
      return shuffled.slice(0, 3);
    }

    const wordsByInterest = getWordsByInterest();
    console.log('🔍 Sync: Preferences:', preferences);
    console.log('🔍 Sync: wordsByInterest keys:', Object.keys(wordsByInterest));
    console.log('🔍 Sync: Letter:', letter);
    
    // Barcha qiziqishlardan so'zlarni yig'ish (har safar barcha qiziqishlardan so'zlar chiqishi uchun)
    const availableInterests = preferences.filter(interest => {
      const hasInterest = wordsByInterest[interest] !== undefined;
      const hasLetter = hasInterest && wordsByInterest[interest][letter] !== undefined;
      const hasWords = hasLetter && wordsByInterest[interest][letter].length > 0;
      
      if (!hasInterest) {
        console.warn(`⚠️ Sync: "${interest}" qiziqishi topilmadi`);
      } else if (!hasLetter) {
        console.warn(`⚠️ Sync: "${interest}" qiziqishida "${letter}" harfi topilmadi`);
      } else if (!hasWords) {
        console.warn(`⚠️ Sync: "${interest}" qiziqishida "${letter}" harfi uchun so'zlar bo'sh`);
      }
      
      return hasWords;
    });
    
    console.log('🔍 Sync: Available interests:', availableInterests);
    
    if (availableInterests.length === 0) {
      console.warn('⚠️ Sync: Hech qanday qiziqishda so\'z topilmadi, default so\'zlar ishlatilmoqda');
      const defaultWords = getDefaultWords();
      const wordsForLetter = defaultWords[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
      const shuffled = shuffle(wordsForLetter);
      return shuffled.slice(0, 3);
    }

    // Barcha qiziqishlardan so'zlarni yig'ish
    const allWordsForLetter: string[] = [];
    for (const interest of availableInterests) {
      const words = wordsByInterest[interest][letter];
      console.log(`📝 Sync: ${interest} qiziqishidan ${words.length} ta so'z qo'shildi`);
      allWordsForLetter.push(...words);
    }
    
    console.log(`✅ Sync: Jami ${allWordsForLetter.length} ta so'z yig'ildi (${availableInterests.length} ta qiziqishdan)`);
    
    // Random aylantirish va 3 tasini tanlash (har safar barcha qiziqishlardan random so'zlar)
    const shuffled = shuffle(allWordsForLetter);
    const selectedWords = shuffled.slice(0, 3);
    
    console.log(`🎯 Sync: Yakuniy tanlangan so'zlar:`, selectedWords);
    
    return selectedWords;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* Harflar kutubxonasi - chap tomonda */}
      <div className={`${showLibrary ? 'w-72' : 'w-20'} bg-gradient-to-b from-blue-50 to-purple-50 shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-r-2 border-blue-200`}>
        {/* Toggle tugmasi */}
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {showLibrary ? (
            <>
              <span className="text-2xl">📚</span>
              <span>Harflar Kutubxonasi</span>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">📚</span>
              <span className="text-xs">Harflar</span>
            </div>
          )}
        </button>

        {/* Harflar ro'yxati */}
        {showLibrary && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">O'zbek Alifbosi</h3>
            <div className="grid grid-cols-4 gap-2">
              {allLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`p-4 rounded-xl font-bold text-xl transition-all transform ${
                    currentLetter === letter
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white scale-110 shadow-xl ring-4 ring-blue-300'
                      : 'bg-white hover:bg-blue-100 text-gray-700 hover:scale-105 shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-300'
                  }`}
                  title={(() => {
                    try {
                      const words = getExampleWordsSync(letter);
                      return words && words.length > 0 ? words[0] : letter;
                    } catch {
                      return letter;
                    }
                  })()}
                >
                  {letter}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 text-center mb-2">
                💡 Hohlagan harfni tanlang va mashq qiling!
              </p>
              <p className="text-xs text-gray-600 text-center">
                ⌨️ Klaviatura: ← → harflar, Esc yopish
              </p>
            </div>
            
            {/* O'rganilgan harflar */}
            {learnedLetters.size > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 text-center mb-2">
                  ✅ O'rganilgan harflar: {learnedLetters.size}/{allLetters.length}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {Array.from(learnedLetters).map(letter => (
                    <span key={letter} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-bold">
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asosiy kontent */}
      <div className="flex-1 overflow-y-auto">
        {currentLetter && (
          <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">{currentLetter}</div>
            <p className="text-2xl text-gray-700 mb-4">Bu {currentLetter} harfi</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-gray-700">{letterProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${letterProgress}%` }}
                />
              </div>
            </div>
            
            {/* TTS Tugmasi */}
            <button
              onClick={() => speakLetter(currentLetter)}
              disabled={isSpeaking}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpeaking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Ovoz berilmoqda...</span>
                </>
              ) : (
                <>
                  <span>🔊</span>
                  <span>Qayta eshitish</span>
                </>
              )}
            </button>
          </div>

          {/* So'zlar va rasmlar */}
          {exampleWords.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {exampleWords.map((word, idx) => (
                <Card key={`${currentLetter}-${word}-${idx}`} className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => speakWord(word)}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-2">{word}</div>
                    {exampleImages[idx] ? (
                      <div className="w-full h-48 rounded-lg overflow-hidden mb-2 bg-gray-100 flex items-center justify-center">
                        <img
                          src={exampleImages[idx]}
                          alt={word}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(word);
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                    >
                      🔊 Eshitish
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* AI suhbat xabarlari */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <span>🤖</span>
                <span>AI Yordamchi</span>
              </h3>
            </div>
            {aiMessages.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border-2 border-blue-200">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      msg.type === 'ai'
                        ? 'bg-blue-100 text-blue-900 ml-auto max-w-[80%]'
                        : 'bg-gray-100 text-gray-900 mr-auto max-w-[80%]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-semibold mb-1 opacity-70">
                          {msg.type === 'ai' ? '🤖 AI' : '👤 Siz'}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                      </div>
                      {msg.type === 'ai' && (
                        <button
                          onClick={() => speakAiMessage(msg.text)}
                          disabled={isSpeaking}
                          className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 flex-shrink-0"
                          title="Qayta eshitish"
                        >
                          🔊 {isSpeaking ? 'O\'qilmoqda...' : 'Eshitish'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">
                  🎤 Mikrofonni bosing va gapiring, AI sizga yordam beradi!
                </p>
              </div>
            )}
          </div>

          {/* Harf navigatsiya tugmalari */}
          <div className="text-center flex gap-4 justify-center items-center mb-24">
            {/* A harfida bo'lsa "Oldingi harf" tugmasini yashirish */}
            {currentLetter !== 'A' && (
              <button
                onClick={handlePreviousLetter}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                ← Oldingi harf
              </button>
            )}
            {/* Oxirgi harfda (Ng) bo'lsa "Keyingi harf" tugmasini yashirish */}
            {currentLetter !== 'Ng' && (
              <button
                onClick={handleNextLetter}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Keyingi harf →
              </button>
            )}
          </div>

          {/* Mikrofon tugmasi - tugmalardan pastda */}
          <div className="flex justify-center items-center pb-8">
            <RealtimeMicButton
              onTranscript={handleTranscript}
              onStart={() => {
                // Mikrofon bosilganda harfni o'zgartirmaslik
                // Faqat birinchi marta A harfini o'rnatish
                if (!currentLetter) {
                  setCurrentLetter('A');
                  setExampleWords(['Anor', 'Archa', 'Avtobus']);
                }
              }}
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

