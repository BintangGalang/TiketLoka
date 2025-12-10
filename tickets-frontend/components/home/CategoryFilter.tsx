'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  selectedSlug: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryFilter({ selectedSlug, onSelectCategory }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/categories');
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Gagal load kategori", err);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[70px] z-20 shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3">
          
          {/* Tombol "Semua" */}
          <button
            onClick={() => onSelectCategory('')}
            className={`
              px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200
              ${selectedSlug === '' 
                ? 'bg-[#0B2F5E] text-white shadow-lg shadow-blue-900/20' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Semua Wisata
          </button>

          {/* Mapping Kategori dari API */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`
                px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200
                ${selectedSlug === cat.slug 
                  ? 'bg-[#F57C00] text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}