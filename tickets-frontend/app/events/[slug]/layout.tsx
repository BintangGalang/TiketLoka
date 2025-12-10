// src/app/events/[slug]/layout.tsx
import { ReactNode } from 'react';

// Helper URL Gambar (Dipastikan sama)
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1517400508535-b2a1a062776c?q=80&w=2070';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000/storage/${url}`;
};

// --- FUNGSI GENERATE METADATA (SERVER SIDE) ---
// Fetches SEO data for the current destination
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const fallbackTitle = 'TiketLoka - Pesan Tiket Wisata';

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/destinations/${slug}`, {
            cache: 'force-cache',
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
             console.warn(`API returned status ${res.status} for slug: ${slug}.`);
             return { title: fallbackTitle };
        }
        
        const json = await res.json();
        const seo = json.seo;
        
        const ogImage = seo.og_image ? getImageUrl(seo.og_image) : null;

        return {
            title: seo.title || json.data.name,
            description: seo.description,
            openGraph: {
                title: seo.title || json.data.name,
                description: seo.description,
                images: ogImage ? [ogImage] : [],
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${slug}`
            }
        };

    } catch (error) {
        console.error(`[METADATA ERROR]: Could not fetch SEO for ${slug}. Falling back.`);
        return {
            title: fallbackTitle,
            description: 'Platform pemesanan tiket wisata termudah.'
        };
    }
}

// Layout ini hanya membungkus child components (page.tsx)
export default function EventDetailLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}