'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/learn', label: '📚 O\'rganish', icon: '📚' },
  { href: '/leaderboard', label: '🏆 Reyting', icon: '🏆' },
  { href: '/profile', label: '👤 Profil', icon: '👤' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-100 w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            <span className="text-xl mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

