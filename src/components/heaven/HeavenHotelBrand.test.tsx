import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HeavenHotelBrand } from './HeavenHotelBrand';

describe('Heaven Hotel branding', () => {
    it('shows the hotel name and accessible label in the login view', () => {
        const html = renderToStaticMarkup(<HeavenHotelBrand />);
        expect(html).toContain('HEAVEN');
        expect(html).toContain('HOTEL');
        expect(html).toContain('Your world above the clouds');
        expect(html).toContain('heaven-hotel-brand--login');
    });

    it('supports a larger loading-screen treatment', () => {
        const html = renderToStaticMarkup(<HeavenHotelBrand variant="loading" />);
        expect(html).toContain('heaven-hotel-brand--loading');
    });
});
