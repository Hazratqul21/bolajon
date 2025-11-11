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

export const UZBEK_ALPHABET: Letter[] = [
  {
    letter: 'А',
    name: 'а',
    words: [
      { word: 'ota', translation: 'отец', difficulty: 1 },
      { word: 'ana', translation: 'мать', difficulty: 1 },
      { word: 'archa', translation: 'ёлка', difficulty: 2 }
    ]
  },
  {
    letter: 'Б',
    name: 'бэ',
    words: [
      { word: 'bola', translation: 'ребенок', difficulty: 1 },
      { word: 'bosh', translation: 'голова', difficulty: 1 },
      { word: 'bog', translation: 'сад', difficulty: 1 }
    ]
  },
  {
    letter: 'В',
    name: 'вэ',
    words: [
      { word: 'vatan', translation: 'родина', difficulty: 2 },
      { word: 'voda', translation: 'вода', difficulty: 1 },
      { word: 'vazifa', translation: 'задание', difficulty: 2 }
    ]
  },
  {
    letter: 'Г',
    name: 'гэ',
    words: [
      { word: 'gul', translation: 'цветок', difficulty: 1 },
      { word: 'gapir', translation: 'говори', difficulty: 2 },
      { word: 'gazeta', translation: 'газета', difficulty: 2 }
    ]
  },
  {
    letter: 'Д',
    name: 'дэ',
    words: [
      { word: 'daraxt', translation: 'дерево', difficulty: 2 },
      { word: 'dost', translation: 'друг', difficulty: 1 },
      { word: 'dars', translation: 'урок', difficulty: 1 }
    ]
  },
  {
    letter: 'Е',
    name: 'е',
    words: [
      { word: 'el', translation: 'страна', difficulty: 1 },
      { word: 'eshik', translation: 'дверь', difficulty: 2 },
      { word: 'ertak', translation: 'сказка', difficulty: 2 }
    ]
  },
  {
    letter: 'Ё',
    name: 'ё',
    words: [
      { word: 'yoz', translation: 'лето', difficulty: 1 },
      { word: 'yol', translation: 'дорога', difficulty: 1 },
      { word: 'yosh', translation: 'молодой', difficulty: 1 }
    ]
  },
  {
    letter: 'Ж',
    name: 'жэ',
    words: [
      { word: 'juma', translation: 'пятница', difficulty: 2 },
      { word: 'jon', translation: 'душа', difficulty: 1 },
      { word: 'jild', translation: 'том', difficulty: 1 }
    ]
  },
  {
    letter: 'З',
    name: 'зэ',
    words: [
      { word: 'zamin', translation: 'земля', difficulty: 2 },
      { word: 'zil', translation: 'колокол', difficulty: 1 },
      { word: 'zavod', translation: 'завод', difficulty: 2 }
    ]
  },
  {
    letter: 'И',
    name: 'и',
    words: [
      { word: 'ish', translation: 'работа', difficulty: 1 },
      { word: 'ilhom', translation: 'вдохновение', difficulty: 2 },
      { word: 'imtihon', translation: 'экзамен', difficulty: 2 }
    ]
  },
  {
    letter: 'Й',
    name: 'й',
    words: [
      { word: 'yoz', translation: 'лето', difficulty: 1 },
      { word: 'yol', translation: 'дорога', difficulty: 1 },
      { word: 'yosh', translation: 'молодой', difficulty: 1 }
    ]
  },
  {
    letter: 'К',
    name: 'кэ',
    words: [
      { word: 'kitob', translation: 'книга', difficulty: 2 },
      { word: 'ko\'z', translation: 'глаз', difficulty: 1 },
      { word: 'kuch', translation: 'сила', difficulty: 1 }
    ]
  },
  {
    letter: 'Л',
    name: 'лэ',
    words: [
      { word: 'loviya', translation: 'фасоль', difficulty: 2 },
      { word: 'lab', translation: 'губа', difficulty: 1 },
      { word: 'loy', translation: 'глина', difficulty: 1 }
    ]
  },
  {
    letter: 'М',
    name: 'мэ',
    words: [
      { word: 'maktab', translation: 'школа', difficulty: 2 },
      { word: 'mashina', translation: 'машина', difficulty: 2 },
      { word: 'meva', translation: 'фрукт', difficulty: 2 }
    ]
  },
  {
    letter: 'Н',
    name: 'нэ',
    words: [
      { word: 'nur', translation: 'свет', difficulty: 1 },
      { word: 'non', translation: 'хлеб', difficulty: 1 },
      { word: 'nima', translation: 'что', difficulty: 1 }
    ]
  },
  {
    letter: 'О',
    name: 'о',
    words: [
      { word: 'ota', translation: 'отец', difficulty: 1 },
      { word: 'ona', translation: 'мать', difficulty: 1 },
      { word: 'olma', translation: 'яблоко', difficulty: 2 }
    ]
  },
  {
    letter: 'П',
    name: 'пэ',
    words: [
      { word: 'poytaxt', translation: 'столица', difficulty: 2 },
      { word: 'pul', translation: 'деньги', difficulty: 1 },
      { word: 'piyola', translation: 'чашка', difficulty: 2 }
    ]
  },
  {
    letter: 'Р',
    name: 'рэ',
    words: [
      { word: 'rasm', translation: 'рисунок', difficulty: 1 },
      { word: 'ro\'za', translation: 'пост', difficulty: 2 },
      { word: 'rang', translation: 'цвет', difficulty: 1 }
    ]
  },
  {
    letter: 'С',
    name: 'сэ',
    words: [
      { word: 'sabzi', translation: 'морковь', difficulty: 2 },
      { word: 'soat', translation: 'час', difficulty: 1 },
      { word: 'suv', translation: 'вода', difficulty: 1 }
    ]
  },
  {
    letter: 'Т',
    name: 'тэ',
    words: [
      { word: 'tosh', translation: 'камень', difficulty: 1 },
      { word: 'til', translation: 'язык', difficulty: 1 },
      { word: 'tom', translation: 'крыша', difficulty: 1 }
    ]
  },
  {
    letter: 'У',
    name: 'у',
    words: [
      { word: 'uy', translation: 'дом', difficulty: 1 },
      { word: 'ustoz', translation: 'учитель', difficulty: 2 },
      { word: 'uzoq', translation: 'далеко', difficulty: 2 }
    ]
  },
  {
    letter: 'Ф',
    name: 'фэ',
    words: [
      { word: 'fayl', translation: 'файл', difficulty: 1 },
      { word: 'futbol', translation: 'футбол', difficulty: 2 },
      { word: 'film', translation: 'фильм', difficulty: 1 }
    ]
  },
  {
    letter: 'Х',
    name: 'хэ',
    words: [
      { word: 'xona', translation: 'комната', difficulty: 2 },
      { word: 'xat', translation: 'письмо', difficulty: 1 },
      { word: 'xayr', translation: 'до свидания', difficulty: 1 }
    ]
  },
  {
    letter: 'Ц',
    name: 'цэ',
    words: [
      { word: 'tsirk', translation: 'цирк', difficulty: 1 },
      { word: 'tsifr', translation: 'цифра', difficulty: 2 },
      { word: 'tsement', translation: 'цемент', difficulty: 2 }
    ]
  },
  {
    letter: 'Ч',
    name: 'чэ',
    words: [
      { word: 'choy', translation: 'чай', difficulty: 1 },
      { word: 'chiroq', translation: 'лампа', difficulty: 2 },
      { word: 'chashka', translation: 'чашка', difficulty: 2 }
    ]
  },
  {
    letter: 'Ш',
    name: 'шэ',
    words: [
      { word: 'shahar', translation: 'город', difficulty: 2 },
      { word: 'shamol', translation: 'ветер', difficulty: 2 },
      { word: 'shaxmat', translation: 'шахматы', difficulty: 2 }
    ]
  },
  {
    letter: 'Ъ',
    name: 'твёрдый знак',
    words: [
      { word: 'o\'t', translation: 'трава', difficulty: 1 },
      { word: 'o\'qituvchi', translation: 'учитель', difficulty: 3 },
      { word: 'o\'zbek', translation: 'узбек', difficulty: 2 }
    ]
  },
  {
    letter: 'Э',
    name: 'э',
    words: [
      { word: 'eshik', translation: 'дверь', difficulty: 2 },
      { word: 'ertak', translation: 'сказка', difficulty: 2 },
      { word: 'ekran', translation: 'экран', difficulty: 2 }
    ]
  },
  {
    letter: 'Ю',
    name: 'ю',
    words: [
      { word: 'yulduz', translation: 'звезда', difficulty: 2 },
      { word: 'yurak', translation: 'сердце', difficulty: 2 },
      { word: 'yumshoq', translation: 'мягкий', difficulty: 2 }
    ]
  },
  {
    letter: 'Я',
    name: 'я',
    words: [
      { word: 'yashil', translation: 'зелёный', difficulty: 2 },
      { word: 'yangi', translation: 'новый', difficulty: 2 },
      { word: 'yaxshi', translation: 'хороший', difficulty: 2 }
    ]
  },
  {
    letter: 'Ў',
    name: 'ў',
    words: [
      { word: 'o\'q', translation: 'стрела', difficulty: 1 },
      { word: 'o\'t', translation: 'трава', difficulty: 1 },
      { word: 'o\'g\'il', translation: 'сын', difficulty: 2 }
    ]
  },
  {
    letter: 'Қ',
    name: 'қэ',
    words: [
      { word: 'qalam', translation: 'ручка', difficulty: 2 },
      { word: 'qiz', translation: 'девочка', difficulty: 1 },
      { word: 'qush', translation: 'птица', difficulty: 1 }
    ]
  },
  {
    letter: 'Ғ',
    name: 'ғэ',
    words: [
      { word: 'g\'isht', translation: 'кирпич', difficulty: 2 },
      { word: 'g\'oza', translation: 'хлопок', difficulty: 2 },
      { word: 'g\'alaba', translation: 'победа', difficulty: 2 }
    ]
  },
  {
    letter: 'Ҳ',
    name: 'ҳэ',
    words: [
      { word: 'hayvon', translation: 'животное', difficulty: 2 },
      { word: 'hajm', translation: 'объём', difficulty: 1 },
      { word: 'hokim', translation: 'правитель', difficulty: 2 }
    ]
  }
];

