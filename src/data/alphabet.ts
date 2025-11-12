export interface Word {
  word: string;
  translation: string;
  difficulty: number;
}

export interface Letter {
  letter: string;
  name: string;
  words: Word[];
}

// Lotin alifbosi - barcha harflar lotin yozuvida
export const UZBEK_ALPHABET: Letter[] = [
  {
    letter: 'A',
    name: 'a',
    words: [
      { word: 'Anor', translation: 'гранат', difficulty: 1 },
      { word: 'Archa', translation: 'ёлка', difficulty: 2 },
      { word: 'Avtobus', translation: 'автобус', difficulty: 2 }
    ]
  },
  {
    letter: 'B',
    name: 'be',
    words: [
      { word: 'Bola', translation: 'ребенок', difficulty: 1 },
      { word: 'Bosh', translation: 'голова', difficulty: 1 },
      { word: 'Bog', translation: 'сад', difficulty: 1 }
    ]
  },
  {
    letter: 'D',
    name: 'de',
    words: [
      { word: 'Daraxt', translation: 'дерево', difficulty: 2 },
      { word: 'Dost', translation: 'друг', difficulty: 1 },
      { word: 'Dars', translation: 'урок', difficulty: 1 }
    ]
  },
  {
    letter: 'E',
    name: 'e',
    words: [
      { word: 'El', translation: 'страна', difficulty: 1 },
      { word: 'Eshik', translation: 'дверь', difficulty: 2 },
      { word: 'Ertak', translation: 'сказка', difficulty: 2 }
    ]
  },
  {
    letter: 'F',
    name: 'fe',
    words: [
      { word: 'Fayl', translation: 'файл', difficulty: 1 },
      { word: 'Futbol', translation: 'футбол', difficulty: 2 },
      { word: 'Film', translation: 'фильм', difficulty: 1 }
    ]
  },
  {
    letter: 'G',
    name: 'ge',
    words: [
      { word: 'Gul', translation: 'цветок', difficulty: 1 },
      { word: 'Gapir', translation: 'говори', difficulty: 2 },
      { word: 'Gazeta', translation: 'газета', difficulty: 2 }
    ]
  },
  {
    letter: 'H',
    name: 'he',
    words: [
      { word: 'Hayvon', translation: 'животное', difficulty: 2 },
      { word: 'Hajm', translation: 'объём', difficulty: 1 },
      { word: 'Hokim', translation: 'правитель', difficulty: 2 }
    ]
  },
  {
    letter: 'I',
    name: 'i',
    words: [
      { word: 'Ish', translation: 'работа', difficulty: 1 },
      { word: 'Ilhom', translation: 'вдохновение', difficulty: 2 },
      { word: 'Imtihon', translation: 'экзамен', difficulty: 2 }
    ]
  },
  {
    letter: 'J',
    name: 'je',
    words: [
      { word: 'Juma', translation: 'пятница', difficulty: 2 },
      { word: 'Jon', translation: 'душа', difficulty: 1 },
      { word: 'Jild', translation: 'том', difficulty: 1 }
    ]
  },
  {
    letter: 'K',
    name: 'ke',
    words: [
      { word: 'Kitob', translation: 'книга', difficulty: 2 },
      { word: 'Ko\'z', translation: 'глаз', difficulty: 1 },
      { word: 'Kuch', translation: 'сила', difficulty: 1 }
    ]
  },
  {
    letter: 'L',
    name: 'le',
    words: [
      { word: 'Lola', translation: 'тюльпан', difficulty: 2 },
      { word: 'Limon', translation: 'лимон', difficulty: 1 },
      { word: 'Lampa', translation: 'лампа', difficulty: 2 }
    ]
  },
  {
    letter: 'M',
    name: 'me',
    words: [
      { word: 'Maktab', translation: 'школа', difficulty: 2 },
      { word: 'Mashina', translation: 'машина', difficulty: 2 },
      { word: 'Meva', translation: 'фрукт', difficulty: 2 }
    ]
  },
  {
    letter: 'N',
    name: 'ne',
    words: [
      { word: 'Nur', translation: 'свет', difficulty: 1 },
      { word: 'Non', translation: 'хлеб', difficulty: 1 },
      { word: 'Nima', translation: 'что', difficulty: 1 }
    ]
  },
  {
    letter: 'O',
    name: 'o',
    words: [
      { word: 'Ona', translation: 'мать', difficulty: 1 },
      { word: 'Olma', translation: 'яблоко', difficulty: 2 },
      { word: 'Oyi', translation: 'месяц', difficulty: 1 }
    ]
  },
  {
    letter: 'P',
    name: 'pe',
    words: [
      { word: 'Poytaxt', translation: 'столица', difficulty: 2 },
      { word: 'Pul', translation: 'деньги', difficulty: 1 },
      { word: 'Piyola', translation: 'чашка', difficulty: 2 }
    ]
  },
  {
    letter: 'Q',
    name: 'qe',
    words: [
      { word: 'Qalam', translation: 'ручка', difficulty: 2 },
      { word: 'Qiz', translation: 'девочка', difficulty: 1 },
      { word: 'Qush', translation: 'птица', difficulty: 1 }
    ]
  },
  {
    letter: 'R',
    name: 're',
    words: [
      { word: 'Rasm', translation: 'рисунок', difficulty: 1 },
      { word: 'Rang', translation: 'цвет', difficulty: 1 },
      { word: 'Ruchka', translation: 'ручка', difficulty: 2 }
    ]
  },
  {
    letter: 'S',
    name: 'se',
    words: [
      { word: 'Sabzi', translation: 'морковь', difficulty: 2 },
      { word: 'Soat', translation: 'час', difficulty: 1 },
      { word: 'Suv', translation: 'вода', difficulty: 1 }
    ]
  },
  {
    letter: 'T',
    name: 'te',
    words: [
      { word: 'Tosh', translation: 'камень', difficulty: 1 },
      { word: 'Til', translation: 'язык', difficulty: 1 },
      { word: 'Tom', translation: 'крыша', difficulty: 1 }
    ]
  },
  {
    letter: 'U',
    name: 'u',
    words: [
      { word: 'Uy', translation: 'дом', difficulty: 1 },
      { word: 'Ustoz', translation: 'учитель', difficulty: 2 },
      { word: 'Uzoq', translation: 'далеко', difficulty: 2 }
    ]
  },
  {
    letter: 'V',
    name: 've',
    words: [
      { word: 'Vatan', translation: 'родина', difficulty: 2 },
      { word: 'Voda', translation: 'вода', difficulty: 1 },
      { word: 'Vazifa', translation: 'задание', difficulty: 2 }
    ]
  },
  {
    letter: 'X',
    name: 'xe',
    words: [
      { word: 'Xona', translation: 'комната', difficulty: 2 },
      { word: 'Xat', translation: 'письмо', difficulty: 1 },
      { word: 'Xayr', translation: 'до свидания', difficulty: 1 }
    ]
  },
  {
    letter: 'Y',
    name: 'ye',
    words: [
      { word: 'Yoz', translation: 'лето', difficulty: 1 },
      { word: 'Yol', translation: 'дорога', difficulty: 1 },
      { word: 'Yosh', translation: 'молодой', difficulty: 1 }
    ]
  },
  {
    letter: 'Z',
    name: 'ze',
    words: [
      { word: 'Zamin', translation: 'земля', difficulty: 2 },
      { word: 'Zil', translation: 'колокол', difficulty: 1 },
      { word: 'Zavod', translation: 'завод', difficulty: 2 }
    ]
  },
  {
    letter: 'O\'',
    name: 'o\'',
    words: [
      { word: 'O\'q', translation: 'стрела', difficulty: 1 },
      { word: 'O\'t', translation: 'трава', difficulty: 1 },
      { word: 'O\'g\'il', translation: 'сын', difficulty: 2 }
    ]
  },
  {
    letter: 'G\'',
    name: 'g\'',
    words: [
      { word: 'G\'isht', translation: 'кирпич', difficulty: 2 },
      { word: 'G\'oza', translation: 'хлопок', difficulty: 2 },
      { word: 'G\'alaba', translation: 'победа', difficulty: 2 }
    ]
  },
  {
    letter: 'Sh',
    name: 'she',
    words: [
      { word: 'Shahar', translation: 'город', difficulty: 2 },
      { word: 'Shamol', translation: 'ветер', difficulty: 2 },
      { word: 'Shaxmat', translation: 'шахматы', difficulty: 2 }
    ]
  },
  {
    letter: 'Ch',
    name: 'che',
    words: [
      { word: 'Choy', translation: 'чай', difficulty: 1 },
      { word: 'Chiroq', translation: 'лампа', difficulty: 2 },
      { word: 'Chashka', translation: 'чашка', difficulty: 2 }
    ]
  },
  {
    letter: 'Ng',
    name: 'nge',
    words: [
      { word: 'Ming', translation: 'тысяча', difficulty: 2 },
      { word: 'Ting', translation: 'слушай', difficulty: 1 },
      { word: 'Qo\'ng\'iroq', translation: 'колокол', difficulty: 3 }
    ]
  }
];
