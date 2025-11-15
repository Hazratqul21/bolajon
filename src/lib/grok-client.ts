/**
 * Groq AI API Client
 * Brain sifatida ishlatiladi - chat va conversation uchun
 * Documentation: https://console.groq.com/docs
 */

const GROQ_API_URL = process.env.NEXT_PUBLIC_GROQ_API_URL || 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

export interface GroqChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  childName?: string;
  childAge?: number;
  preferences?: string[];
}

export interface GroqChatResponse {
  response: string;
  suggested_letter?: string;
  example_words?: string[];
}

/**
 * Groq AI orqali chat response generatsiya qilish
 */
export async function generateGrokChatResponse(
  request: GroqChatRequest
): Promise<GroqChatResponse> {
  console.log('🔍 Groq AI generateChatResponse chaqirildi', {
    hasApiKey: !!GROQ_API_KEY,
    apiUrl: GROQ_API_URL,
    message: request.message,
  });

  if (!GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY not found, using fallback');
    return getFallbackChatResponse(request);
  }

  try {
    const childName = request.childName || 'Bola';
    const childAge = request.childAge || 5;
    const preferences = request.preferences || [];
    const interestsText = preferences.length > 0 ? preferences.join(', ') : 'umumiy qiziqishlar';
    
    // Conversation history ni formatlash
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `Siz 4-7 yoshli bolalar uchun o'zbek tilida harflarni o'rgatuvchi do'stona va qiziqarli yordamchi AI'siz.

Bola ismi: ${childName}
Bola yoshi: ${childAge}
Qiziqishlar: ${interestsText}

Sizning vazifangiz:
1. Bolaga do'stona va qiziqarli javob berish
2. Agar bola harfni o'rganmoqchi bo'lsa (masalan: "A harfini", "a harifini"), o'sha harfni o'rgatish
3. Agar bola faqat harf nomini aytgan bo'lsa (masalan: "a", "b"), o'sha harfni o'rgatish
4. Agar bola aniq so'z aytgan bo'lsa (masalan: "anor", "bola"), o'sha so'zni tahlil qilish va harfni ko'rsatish
5. Agar bola noto'g'ri yozilgan yoki noma'lum so'z aytgan bo'lsa, umumiy javob berish va qayta so'rash
6. Qiziqishlarga mos misollar berish
7. Qisqa va tushunarli javoblar (2-3 jumla)
8. NOTO'G'RI YOZILGAN SO'ZLARNI HAM TUSHUNISH (masalan: "harifini" = "harfini", "organ" = "o'rgan")
9. "o'rgat", "orgat", "o'rgan", "organ" kabi so'zlar harf so'rovi emas, balki umumiy so'rov`,
      },
    ];

    // Conversation history qo'shish
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      for (const msg of request.conversationHistory.slice(-10)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // User message qo'shish
    messages.push({
      role: 'user',
      content: request.message,
    });

    console.log('🚀 Groq AI API chaqirilmoqda...', {
      url: `${GROQ_API_URL}/chat/completions`,
      hasKey: !!GROQ_API_KEY,
      keyLength: GROQ_API_KEY?.length || 0,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 50),
    });

    const requestBody = {
      model: 'llama-3.3-70b-versatile', // yoki 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const headers = {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    };
    
    console.log('📋 Request headers:', {
      'Authorization': `Bearer ${GROQ_API_KEY?.substring(0, 10)}...`,
      'Content-Type': headers['Content-Type'],
    });
    
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Groq AI API response status:', response.status, response.statusText);
    
    // Response headers'ni ko'rsatish
    try {
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('📡 Response headers:', responseHeaders);
    } catch (e) {
      console.log('📡 Response headers: (error reading headers)');
    }

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Groq AI API response data:', JSON.stringify(data, null, 2));
      
      const content = data.choices?.[0]?.message?.content || '';
      
      if (content.trim()) {
        console.log('✅ Groq AI response content:', content);
        
        // Harfni topish (agar mavjud bo'lsa)
        const letterMatch = content.match(/\b([A-ZO'G'ShChNg])\b/);
        const suggestedLetter = letterMatch ? letterMatch[1] : undefined;
        
        return {
          response: content.trim(),
          suggested_letter: suggestedLetter,
        };
      } else {
        console.warn('⚠️ Groq AI response content bo\'sh', data);
      }
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Error text o\'qib bo\'lmadi: ' + (e instanceof Error ? e.message : String(e));
      }
      
      let errorJson = null;
      try {
        if (errorText) {
          errorJson = JSON.parse(errorText);
        }
      } catch (e) {
        // JSON emas, oddiy text
      }
      
      // Xato tafsilotlarini bitta string sifatida ko'rsatish
      const errorDetails = `
❌ Groq AI API Error:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${response.status} ${response.statusText}
URL: ${GROQ_API_URL}/chat/completions
API Key: ${GROQ_API_KEY ? `Present (${GROQ_API_KEY.length} chars)` : 'MISSING!'}
Error Text: ${errorText || 'No error text'}
Error JSON: ${errorJson ? JSON.stringify(errorJson, null, 2) : 'Not JSON'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
      
      console.error(errorDetails);
      
      // Xato obyekti sifatida ham ko'rsatish
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        errorJson: errorJson,
        url: `${GROQ_API_URL}/chat/completions`,
        hasApiKey: !!GROQ_API_KEY,
        apiKeyLength: GROQ_API_KEY?.length || 0,
      };
      
      console.error('Error object:', errorInfo);
    }
  } catch (error) {
    console.error('❌ Groq AI chat error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  console.warn('⚠️ Groq AI ishlamadi, fallback javob qaytarilmoqda');
  return getFallbackChatResponse(request);
}

/**
 * Fallback chat response - kontekstni hisobga olgan
 */
function getFallbackChatResponse(request: GroqChatRequest): GroqChatResponse {
  const message = request.message.toLowerCase().trim();
  const childName = request.childName || 'Bola';
  
  // "A harfini o'rganmoqchiman" kabi so'rovlar (noto'g'ri yozilgan: "harifini", "harfini", "harfi")
  const learnLetterMatch = message.match(/([a-z]|o'|g'|sh|ch|ng)\s*har[if]*ini?\s*(o['']rgan|organ|o'rgan)?/i);
  if (learnLetterMatch) {
    const letter = learnLetterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ajoyib ${childName}! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.\n\nKeling, birinchi so'zni aytamiz: "${exampleWords[0]}".`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // "A harfi" yoki "A harfini" yoki "A harifini" kabi so'rovlar
  const letterMatch = message.match(/([a-z]|o'|g'|sh|ch|ng)\s*har[if]*/i);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // Faqat harf nomi (masalan: "A", "B", "O'")
  const singleLetterMatch = message.match(/^([a-z]|o'|g'|sh|ch|ng)$/i);
  if (singleLetterMatch) {
    const letter = singleLetterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // Salom xabari
  if (message.includes('salom') || message.includes('hello') || message.includes('hi')) {
    return {
      response: `Salom ${childName}! 🎉 Men sizga harflarni o'rgatishga yordam beraman. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki "B harfi".`,
    };
  }
  
  // Maxsus so'zlar - harf so'rovi emas
  const specialWords = ['o\'rgat', 'orgat', 'o\'rgan', 'organ', 'o\'rgatish', 'orgatish', 'o\'rganish', 'organish', 'o\'rgatmoq', 'orgatmoq', 'o\'rganmoq', 'organmoq'];
  const messageLower = message.toLowerCase();
  if (specialWords.some(word => messageLower.includes(word))) {
    return {
      response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
    };
  }
  
  // So'z aytilgan bo'lsa, harfni topish (faqat agar "harf" so'zi bo'lmasa)
  if (!message.includes('harf') && !message.includes('harif')) {
    const words = message.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0) {
      const firstWord = words[0];
      
      // Agar faqat bir harf bo'lsa (masalan: "a", "b")
      if (firstWord.length === 1) {
        const letter = firstWord.toUpperCase();
        const exampleWords = getExampleWordsForLetter(letter);
        return {
          response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
          suggested_letter: letter,
          example_words: exampleWords,
        };
      }
      
      // Qisqa so'zlar (2-3 harf) - ehtimol harf nomi yoki noto'g'ri yozilgan so'z
      if (firstWord.length <= 3) {
        const letterMatch = firstWord.match(/^([a-z]|o'|g'|sh|ch|ng)$/i);
        if (letterMatch) {
          const letter = letterMatch[1].toUpperCase();
          const exampleWords = getExampleWordsForLetter(letter);
          return {
            response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
            suggested_letter: letter,
            example_words: exampleWords,
          };
        }
      }
      
      const firstLetter = firstWord.charAt(0).toUpperCase();
      
      // Maxsus harflar
      let detectedLetter = firstLetter;
      if (firstWord.toLowerCase().startsWith("o'")) {
        detectedLetter = "O'";
      } else if (firstWord.toLowerCase().startsWith("g'")) {
        detectedLetter = "G'";
      } else if (firstWord.toLowerCase().startsWith("sh")) {
        detectedLetter = "Sh";
      } else if (firstWord.toLowerCase().startsWith("ch")) {
        detectedLetter = "Ch";
      }
      
      // Agar so'z aniq bo'lsa (masalan: "anor", "bola"), harfni ko'rsatish
      const isCommonWord = ['anor', 'bola', 'daraxt', 'eshik', 'gul', 'havo', 'ish', 'kitob', 'lola', 'mashina', 'non', 'olma', 'poy', 'qalam', 'rang', 'suv', 'tosh', 'uy', 'xona', 'yoz', 'zar'].includes(firstWord.toLowerCase());
      
      if (isCommonWord) {
        return {
          response: `Ajoyib! Siz "${firstWord}" dedingiz. Bu ${detectedLetter} harfi bilan boshlanadi! 🎉\n\nKeling, ${detectedLetter} harfini o'rganamiz!`,
          suggested_letter: detectedLetter,
        };
      } else {
        // Noto'g'ri yozilgan yoki noma'lum so'z
        return {
          response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
        };
      }
    }
  }
  
  // Umumiy javob
  return {
    response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
  };
}

/**
 * Harf uchun misol so'zlar olish
 */
function getExampleWordsForLetter(letter: string): string[] {
  const wordsByLetter: Record<string, string[]> = {
    'A': ['Anor', 'Archa', 'Avtobus'],
    'B': ['Bola', 'Bosh', 'Bog\''],
    'D': ['Daraxt', 'Dost', 'Dars'],
    'E': ['Eshik', 'Elak', 'Eshak'],
    'F': ['Futbol', 'Fayl', 'Fen'],
    'G': ['Gul', 'Gap', 'G\'isht'],
    'H': ['Havo', 'Hona', 'Hovli'],
    'I': ['Ish', 'It', 'Ikki'],
    'J': ['Javob', 'Juda', 'Juma'],
    'K': ['Kitob', 'Kuch', 'Kun'],
    'L': ['Lola', 'Limon', 'Lak'],
    'M': ['Mashina', 'Maktab', 'Mushuk'],
    'N': ['Non', 'Nar', 'Nima'],
    'O': ['Olma', 'O\'q', 'O\'t'],
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
  
  return wordsByLetter[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
}

