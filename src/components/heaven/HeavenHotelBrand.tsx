import type { FC } from 'react';
import './HeavenHotelBrand.css';

interface HeavenHotelBrandProps {
    variant?: 'login' | 'loading';
}

/**
 * CSS-only, classic pixel-inspired hotel wordmark. No external assets or requests
 * are needed, so the branding can appear even while game assets are loading.
 */
export const HeavenHotelBrand: FC<HeavenHotelBrandProps> = ({ variant = 'login' }) => (
    <div
        className={`heaven-hotel-brand heaven-hotel-brand--${variant}`}
        role="img"
        aria-label="Heaven Hotel — Your world above the clouds"
    >
        <span className="heaven-hotel-brand__halo" aria-hidden="true" />
        <span className="heaven-hotel-brand__cloud heaven-hotel-brand__cloud--left" aria-hidden="true" />
        <span className="heaven-hotel-brand__cloud heaven-hotel-brand__cloud--right" aria-hidden="true" />
        <span className="heaven-hotel-brand__word heaven-hotel-brand__word--heaven" aria-hidden="true">HEAVEN</span>
        <span className="heaven-hotel-brand__word heaven-hotel-brand__word--hotel" aria-hidden="true">HOTEL</span>
        <span className="heaven-hotel-brand__tagline" aria-hidden="true">YOUR WORLD ABOVE THE CLOUDS</span>
    </div>
);
