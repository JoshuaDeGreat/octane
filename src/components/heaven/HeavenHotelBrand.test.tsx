import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HeavenHotelBrand } from './HeavenHotelBrand';

describe('Heaven Hotel branding', () => {
    it('uses the same vector logo and accessible hotel name on the login screen', () => {
        const html = renderToStaticMarkup(<HeavenHotelBrand />);
        expect(html).toContain('heaven-hotel-brand--login');
        expect(html).toContain('Heaven Hotel');
        expect(html).toContain('heaven-logo.svg');
        expect(html).toContain('YOUR WORLD ABOVE THE CLOUDS');
        expect(html).not.toContain('heaven-hotel-brand__word');
    });

    it('supports the larger loading-screen variant', () => {
        const html = renderToStaticMarkup(<HeavenHotelBrand variant="loading" />);
        expect(html).toContain('heaven-hotel-brand--loading');
        expect(html).toContain('heaven-logo.svg');
    });
});
