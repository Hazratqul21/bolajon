'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function GamificationPage() {
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string; description: string; icon: string; unlocked: boolean; unlockedAt?: Date }>>([]);
  const [streak, setStreak] = useState(0);
  const [childName, setChildName] = useState('Bola');

  // XP to Level calculation: Level = sqrt(XP / 100)
  const xpForNextLevel = (level: number) => Math.pow(level, 2) * 100;
  const xpForCurrentLevel = (level: number) => Math.pow(level - 1, 2) * 100;
  const currentLevelProgress = xp - xpForCurrentLevel(currentLevel);
  const nextLevelXpNeeded = xpForNextLevel(currentLevel) - xpForCurrentLevel(currentLevel);
  const levelProgressPercent = (currentLevelProgress / nextLevelXpNeeded) * 100;

  useEffect(() => {
    const name = localStorage.getItem('bolajon_child_name') || 'Bola';
    setChildName(name);
    
    // Load gamification data from localStorage
    const savedStars = parseInt(localStorage.getItem('bolajon_stars') || '0');
    const savedXp = parseInt(localStorage.getItem('bolajon_xp') || '0');
    const savedStreak = parseInt(localStorage.getItem('bolajon_streak') || '0');
    const savedAchievements = localStorage.getItem('bolajon_achievements');
    
    setTotalStars(savedStars);
    setXp(savedXp);
    setStreak(savedStreak);
    
    // Calculate level from XP
    const calculatedLevel = Math.floor(Math.sqrt(savedXp / 100)) + 1;
    setCurrentLevel(calculatedLevel);
    
    // Initialize achievements
    const allAchievements = [
      {
        id: 'first_letter',
        title: 'Birinchi Harf',
        description: 'Birinchi harfni o\'rganing',
        icon: '🎯',
        unlocked: false,
      },
      {
        id: 'five_letters',
        title: '5 ta Harf',
        description: '5 ta harfni o\'rganing',
        icon: '⭐',
        unlocked: false,
      },
      {
        id: 'ten_letters',
        title: '10 ta Harf',
        description: '10 ta harfni o\'rganing',
        icon: '🌟',
        unlocked: false,
      },
      {
        id: 'all_letters',
        title: 'Alifbo Ustasi',
        description: 'Barcha 29 harfni o\'rganing',
        icon: '👑',
        unlocked: false,
      },
      {
        id: 'streak_3',
        title: '3 kun ketma-ket',
        description: '3 kun ketma-ket o\'rganing',
        icon: '🔥',
        unlocked: false,
      },
      {
        id: 'streak_7',
        title: '7 kun ketma-ket',
        description: '7 kun ketma-ket o\'rganing',
        icon: '💪',
        unlocked: false,
      },
      {
        id: 'perfect_score',
        title: 'Mukammal',
        description: '5 ta harfni mukammal talaffuz qiling',
        icon: '💯',
        unlocked: false,
      },
      {
        id: 'speed_learner',
        title: 'Tez O\'rganuvchi',
        description: 'Bir kunda 10 ta harfni o\'rganing',
        icon: '⚡',
        unlocked: false,
      },
    ];
    
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        const updatedAchievements = allAchievements.map(ach => {
          const saved = parsed.find((a: any) => a.id === ach.id);
          return saved ? { ...ach, ...saved } : ach;
        });
        setAchievements(updatedAchievements);
      } catch (e) {
        setAchievements(allAchievements);
      }
    } else {
      setAchievements(allAchievements);
    }
  }, []);

  const celebrateAchievement = (achievement: typeof achievements[0]) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    });
  };

  const toggleAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(ach => ach.id === id);
      if (!achievement) return prev;
      
      const updated = prev.map(ach => {
        if (ach.id === id) {
          const newUnlockedState = !ach.unlocked;
          const updatedAch = { 
            ...ach, 
            unlocked: newUnlockedState,
            unlockedAt: newUnlockedState ? new Date() : undefined
          };
          
          // Faqat ochilganda confetti animatsiyasi
          if (newUnlockedState) {
            celebrateAchievement(updatedAch);
          }
          
          return updatedAch;
        }
        return ach;
      });
      
      localStorage.setItem('bolajon_achievements', JSON.stringify(updated));
      return updated;
    });
  };

  const addStars = (amount: number) => {
    setTotalStars(prev => {
      const newTotal = Math.max(0, prev + amount); // Manfiy bo'lishiga yo'l qo'ymaslik
      localStorage.setItem('bolajon_stars', newTotal.toString());
      return newTotal;
    });
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = Math.max(0, prev + amount); // Manfiy bo'lishiga yo'l qo'ymaslik
      localStorage.setItem('bolajon_xp', newXp.toString());
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      if (newLevel > currentLevel) {
        setCurrentLevel(newLevel);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
        });
      } else if (newLevel < currentLevel) {
        setCurrentLevel(newLevel);
      }
      return newXp;
    });
  };

  const addStreak = (amount: number = 1) => {
    setStreak(prev => {
      const newStreak = Math.max(0, prev + amount); // Manfiy bo'lishiga yo'l qo'ymaslik
      localStorage.setItem('bolajon_streak', newStreak.toString());
      return newStreak;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ⭐ Gamifikatsiya
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {childName}, sizning yutuqlaringiz va progressingiz
          </p>
          <Link href="/">
            <Button variant="outline" size="lg">
              ← Orqaga
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-2">⭐</div>
              <div className="text-3xl font-bold mb-1">{totalStars}</div>
              <div className="text-sm opacity-90">Yulduzlar</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-2">📊</div>
              <div className="text-3xl font-bold mb-1">Level {currentLevel}</div>
              <div className="text-sm opacity-90">Daraja</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-400 to-teal-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-2">💎</div>
              <div className="text-3xl font-bold mb-1">{xp}</div>
              <div className="text-sm opacity-90">XP</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-400 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-2">🔥</div>
              <div className="text-3xl font-bold mb-1">{streak}</div>
              <div className="text-sm opacity-90">Kun ketma-ket</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-12 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">📈 Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold">Level {currentLevel}</span>
                <span className="text-gray-600">
                  {Math.round(levelProgressPercent)}% - Level {currentLevel + 1} ga {nextLevelXpNeeded - currentLevelProgress} XP qoldi
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${Math.min(levelProgressPercent, 100)}%` }}
                >
                  {Math.round(levelProgressPercent)}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Joriy XP:</span>
                <span className="font-bold ml-2">{xp}</span>
              </div>
              <div>
                <span className="text-gray-600">Keyingi Level:</span>
                <span className="font-bold ml-2">{xpForNextLevel(currentLevel)} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🏆 Yutuqlar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`transform transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-lg scale-105'
                    : 'bg-gray-100 opacity-60'
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`text-6xl mb-4 ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  {achievement.unlocked ? (
                    <div className="text-green-600 font-bold text-sm">
                      ✓ Qo'lga kiritildi
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      🔒 Qulflangan
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <Card className="mb-12 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">🎁 Mukofotlar (Demo)</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Demo rejimda mukofotlarni sinab ko'ring. Haqiqiy o'rganishda yutuqlar avtomatik ochiladi.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-bold mb-2">Yulduzlar</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Har bir to'g'ri javob uchun yulduz oling
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => addStars(-5)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    -5
                  </Button>
                  <Button
                    onClick={() => addStars(5)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    size="sm"
                  >
                    +5
                  </Button>
                </div>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl mb-3">💎</div>
                <h3 className="font-bold mb-2">XP</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Harflarni o'rganib XP to'plang
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => addXp(-50)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    -50
                  </Button>
                  <Button
                    onClick={() => addXp(50)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    +50
                  </Button>
                </div>
              </div>
              
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-4xl mb-3">🔥</div>
                <h3 className="font-bold mb-2">Streak</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Har kuni o'rganib streak yarating
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => addStreak(-1)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    -1
                  </Button>
                  <Button
                    onClick={() => addStreak(1)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    +1
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Achievement Unlock Demo */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4 text-center">🏆 Yutuqlarni Ochish (Demo)</h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Tugmalarni bosing va yutuqlarni oching. Confetti animatsiyasini ko'ring! 🎉
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <Button
                    key={achievement.id}
                    onClick={() => {
                      console.log('Yutuq toggle tugmasi bosildi:', achievement.id);
                      toggleAchievement(achievement.id);
                    }}
                    variant="outline"
                    size="sm"
                    className={`text-xs transition-all ${
                      achievement.unlocked
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {achievement.icon} {achievement.title}
                    {achievement.unlocked && ' ✓'}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                ⚠️ Haqiqiy o'rganishda yutuqlar avtomatik ochiladi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Preview */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Liderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Barcha o'yinchilarni yaratish
                const allPlayers = [
                  { name: 'Malika', level: 5, stars: 150 },
                  { name: 'Jasur', level: 4, stars: 120 },
                  { name: 'Dilshoda', level: 4, stars: 100 },
                  { name: childName, level: currentLevel, stars: totalStars, isYou: true },
                  { name: 'Aziz', level: 3, stars: 80 },
                ];
                
                // Stars va Level bo'yicha tartiblash
                const sortedPlayers = [...allPlayers].sort((a, b) => {
                  if (b.stars !== a.stars) return b.stars - a.stars;
                  return b.level - a.level;
                });
                
                // Rank va badge qo'shish
                return sortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  let badge = '';
                  if (rank === 1) badge = '👑';
                  else if (rank === 2) badge = '🥈';
                  else if (rank === 3) badge = '🥉';
                  else if (player.isYou) badge = '⭐';
                  
                  return { ...player, rank, badge };
                });
              })().map((player) => (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    player.isYou
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-8">{player.rank}</div>
                    <div className="text-2xl">{player.badge}</div>
                    <div>
                      <div className="font-bold">{player.name} {player.isYou && '(Siz)'}</div>
                      <div className="text-sm text-gray-600">Level {player.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-bold">{player.stars}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/leaderboard">
                <Button variant="outline" size="lg">
                  To'liq Liderboardni Ko'rish →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

