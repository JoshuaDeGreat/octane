import type { FC } from 'react';
import heavenHotelLogo from '../../assets/images/heaven-logo.svg';
import './HeavenHotelBrand.css';

interface HeavenHotelBrandProps {
    variant?: 'login' | 'loading';
}

/** Use one artwork file on both screens, avoiding platform-specific font rendering. */
export const HeavenHotelBrand: FC<HeavenHotelBrandProps> = ({ variant = 'login' }) => (
    <div
        className={`heaven-hotel-brand heaven-hotel-brand--${variant}`}
        role="img"
        aria-label="Heaven Hotel — Your world above the clouds"
    >
        <img className="heaven-hotel-brand__image" src={heavenHotelLogo} alt="" draggable={false} />
        <span className="heaven-hotel-brand__tagline" aria-hidden="true">
            YOUR WORLD ABOVE THE CLOUDS
        </span>
    </div>
);
