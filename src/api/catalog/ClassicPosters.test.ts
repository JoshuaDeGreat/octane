import { describe, expect, it } from 'vitest';
import { classicPosterDesign, classicPosterIcon } from './ClassicPosters';
import availablePosters from './classicPosterIds.json';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('classic poster artwork', () => {
    it('retains a poster design without inheriting a previous purchase value', () => {
        expect(classicPosterDesign({ productType: 'i', furnitureData: { className: 'poster' }, extraParam: '12' })).toBe('12');
        expect(classicPosterDesign({ productType: 's', furnitureData: { className: 'poster' }, extraParam: '12' })).toBeNull();
        expect(classicPosterDesign({ productType: 'i', furnitureData: { className: 'wallmirror' }, extraParam: '12' })).toBeNull();
        expect(classicPosterDesign({ productType: 'i', furnitureData: { className: 'poster' }, extraParam: '' })).toBeNull();
    });
    it('rejects invalid or unavailable artwork paths', () => {
        expect(classicPosterIcon('../12')).toBeNull();
        expect(classicPosterIcon('0')).toBeNull();
        expect(classicPosterIcon('999999')).toBeNull();
    });
    it('ships an embedded PNG and an icon crop for every available design', () => {
        expect(availablePosters).toContain(12);
        for (const id of availablePosters) {
            const url = classicPosterIcon(String(id));
            const path = resolve('public' + url);
            expect(existsSync(path)).toBe(true);
            const svg = readFileSync(path, 'utf8');
            expect(svg).toContain('data:image/png;base64,');
            expect(svg).toContain('viewBox=');
            expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
        }
    });
});
