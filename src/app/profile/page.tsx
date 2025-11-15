'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [childName, setChildName] = useState<string>('');
  const [childAge, setChildAge] = useState<number>(0);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [learnedLetters, setLearnedLetters] = useState<string[]>([]);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState<string>('');
  const [editAge, setEditAge] = useState<number>(0);
  const [editPreferences, setEditPreferences] = useState<string[]>([]);

  // Qiziqishlar ro'yxati
  const availablePreferences = ['Hayvonlar', 'Mashinalar', 'Ranglar', 'Musiqa', 'Kitoblar', 'O\'yinlar'];

  // O'zbek alifbosi to'g'ri tartibi
  const allLetters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];

  useEffect(() => {
    setMounted(true);
    
    // Agar profil ma'lumotlari bo'lmasa, login sahifasiga yuborish
    const name = localStorage.getItem('bolajon_child_name');
    const email = localStorage.getItem('bolajon_child_email');
    
    if (!name && !email) {
      router.push('/login');
      return;
    }
    
    // localStorage'dan ma'lumotlarni olish
    const savedName = name || 'Bola';
    const age = parseInt(localStorage.getItem('bolajon_child_age') || '0');
    const preferencesStr = localStorage.getItem('bolajon_child_preferences');
    const learnedLettersStr = localStorage.getItem('bolajon_learned_letters');
    
    setChildName(savedName);
    setChildAge(age);
    setEditName(savedName);
    setEditAge(age);
    
    if (preferencesStr) {
      try {
        const prefs = JSON.parse(preferencesStr);
        const prefsArray = Array.isArray(prefs) ? prefs : [];
        setPreferences(prefsArray);
        setEditPreferences(prefsArray);
      } catch (e) {
        console.warn('Preferences parse error:', e);
        setPreferences([]);
        setEditPreferences([]);
      }
    }
    
    if (learnedLettersStr) {
      try {
        const letters = JSON.parse(learnedLettersStr);
        setLearnedLetters(Array.isArray(letters) ? letters : []);
      } catch (e) {
        console.warn('Learned letters parse error:', e);
        setLearnedLetters([]);
      }
    }
  }, []);

  // Progress hisoblash (learnedLetters o'zgarganda)
  useEffect(() => {
    const progress = learnedLetters.length > 0 ? (learnedLetters.length / allLetters.length) * 100 : 0;
    setTotalProgress(Math.round(progress));
  }, [learnedLetters]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    // Ma'lumotlarni saqlash
    localStorage.setItem('bolajon_child_name', editName);
    localStorage.setItem('bolajon_child_age', editAge.toString());
    localStorage.setItem('bolajon_child_preferences', JSON.stringify(editPreferences));
    
    // State'ni yangilash
    setChildName(editName);
    setChildAge(editAge);
    setPreferences(editPreferences);
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // O'zgarishlarni bekor qilish
    setEditName(childName);
    setEditAge(childAge);
    setEditPreferences(preferences);
    setIsEditing(false);
  };

  const togglePreference = (pref: string) => {
    if (editPreferences.includes(pref)) {
      setEditPreferences(editPreferences.filter(p => p !== pref));
    } else {
      setEditPreferences([...editPreferences, pref]);
    }
  };

  const handleStartLearning = () => {
    router.push('/learn-realtime');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profil header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-6xl text-white shadow-xl relative overflow-hidden">
                {childName.charAt(0).toUpperCase()}
                {/* Chiroyli icon overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
              </div>
              {/* Profil icon badge */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                👤
              </div>
            </div>
            {!isEditing ? (
              <>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{childName}</h1>
                <p className="text-xl text-gray-600">{childAge} yosh</p>
              </>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ism</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold"
                    placeholder="Ismingizni kiriting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yosh</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    min="3"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl"
                    placeholder="Yoshingizni kiriting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qiziqishlar</label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {availablePreferences.map((pref) => (
                      <button
                        key={pref}
                        onClick={() => togglePreference(pref)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${
                          editPreferences.includes(pref)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    💾 Saqlash
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    ❌ Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>📊</span>
                <span>Umumiy Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-700">
                    O'rganilgan harflar
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {learnedLetters.length} / {allLetters.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${totalProgress}%` }}
                  >
                    {totalProgress > 10 ? `${totalProgress}%` : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qiziqishlar Card */}
          {preferences.length > 0 && (
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span>🎨</span>
                  <span>Qiziqishlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {preferences.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* O'rganilgan harflar Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>✅</span>
                <span>O'rganilgan Harflar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learnedLetters.length > 0 ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                  {learnedLetters.map((letter) => (
                    <div
                      key={letter}
                      className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center text-xl font-bold shadow-md hover:shadow-xl transition-all transform hover:scale-110"
                      title={letter}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">Hali hech qanday harf o'rganilmagan</p>
                  <p className="text-sm">Keling, birinchi harfni o'rganamiz! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Barcha harflar Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>📚</span>
                <span>Barcha Harflar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {allLetters.map((letter) => {
                  const isLearned = learnedLetters.includes(letter);
                  return (
                    <div
                      key={letter}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-md transition-all transform hover:scale-110 cursor-pointer ${
                        isLearned
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                      title={letter}
                      onClick={() => router.push(`/learn-realtime?letter=${letter}`)}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleStartLearning}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🎓 O'rganishni Davom Ettirish
            </button>
            <button
              onClick={handleEditProfile}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              ✏️ Profilni Tahrirlash
            </button>
          </div>

          {/* Logout Button */}
          <div className="mb-8 space-y-4">
            <button
              onClick={() => {
                if (confirm('Haqiqatan ham progressni qayta boshlashni xohlaysizmi? Barcha o\'rganilgan harflar, yutuqlar va progress 0 ga tushadi.')) {
                  // Progress ma'lumotlarini tozalash
                  localStorage.removeItem('bolajon_learned_letters');
                  localStorage.removeItem('bolajon_stars');
                  localStorage.removeItem('bolajon_xp');
                  localStorage.removeItem('bolajon_streak');
                  localStorage.removeItem('bolajon_achievements');
                  
                  // Har bir harf uchun progress'ni tozalash
                  const allLetters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];
                  allLetters.forEach(letter => {
                    localStorage.removeItem(`bolajon_letter_progress_${letter}`);
                  });
                  
                  // State'ni yangilash
                  setLearnedLetters([]);
                  setTotalProgress(0);
                  
                  // Sahifani yangilash
                  window.location.reload();
                }
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🔄 Progressni Qayta Boshlash
            </button>
            
            <button
              onClick={() => {
                if (confirm('Haqiqatan ham chiqmoqchimisiz? Barcha ma\'lumotlar saqlanadi.')) {
                  // localStorage'ni tozalash
                  localStorage.removeItem('bolajon_child_id');
                  localStorage.removeItem('bolajon_child_name');
                  localStorage.removeItem('bolajon_child_age');
                  localStorage.removeItem('bolajon_child_email');
                  localStorage.removeItem('bolajon_child_preferences');
                  localStorage.removeItem('bolajon_learned_letters');
                  localStorage.removeItem('bolajon_stars');
                  localStorage.removeItem('bolajon_xp');
                  localStorage.removeItem('bolajon_streak');
                  localStorage.removeItem('bolajon_achievements');
                  
                  // Har bir harf uchun progress'ni tozalash
                  const allLetters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];
                  allLetters.forEach(letter => {
                    localStorage.removeItem(`bolajon_letter_progress_${letter}`);
                  });
                  
                  // Asosiy sahifaga qaytish
                  router.push('/');
                }
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🚪 Profildan Chiqish
            </button>
          </div>

          {/* Statistika Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>📈</span>
                <span>Statistika</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{learnedLetters.length}</div>
                  <div className="text-sm text-gray-600 mt-1">O'rganilgan</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {allLetters.length - learnedLetters.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Qolgan</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{totalProgress}%</div>
                  <div className="text-sm text-gray-600 mt-1">Progress</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{preferences.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Qiziqishlar</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
