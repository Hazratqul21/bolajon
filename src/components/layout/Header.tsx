'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Header() {
  const [childName, setChildName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem('bolajon_child_name');
    setChildName(name);
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🇺🇿 O'zbek Alifbosi
          </Link>
          <div className="flex items-center gap-4">
            {mounted && childName && (
              <Link
                href="/profile"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                {childName}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

