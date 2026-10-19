import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWindowViewport, syncWindowViewport } from './WindowViewport';

afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('style');
});

describe('menu viewport', () => {
    it('uses the keyboard-reduced viewport and Safari pan offset', () => {
        vi.stubGlobal('visualViewport', { width: 390.8, height: 320.6, offsetLeft: 0, offsetTop: 185 });
        syncWindowViewport();
        const style = document.documentElement.style;
        expect(style.getPropertyValue('--octane-app-width')).toBe('390px');
        expect(style.getPropertyValue('--octane-app-height')).toBe('320px');
        expect(style.getPropertyValue('--octane-viewport-top')).toBe('185px');
    });

    it('falls back to the layout viewport when visualViewport is unavailable', () => {
        vi.stubGlobal('visualViewport', undefined);
        vi.stubGlobal('innerWidth', 1280);
        vi.stubGlobal('innerHeight', 720);
        expect(getWindowViewport()).toEqual({ width: 1280, height: 720, left: 0, top: 0 });
    });

    it('updates dimensions and clears keyboard offsets after rotation or dismissal', () => {
        vi.stubGlobal('visualViewport', { width: 390, height: 300, offsetLeft: 0, offsetTop: 200 });
        syncWindowViewport();
        vi.stubGlobal('visualViewport', { width: 844, height: 390, offsetLeft: 0, offsetTop: 0 });
        syncWindowViewport();
        expect(document.documentElement.style.getPropertyValue('--octane-app-width')).toBe('844px');
        expect(document.documentElement.style.getPropertyValue('--octane-viewport-top')).toBe('0px');
    });
});
