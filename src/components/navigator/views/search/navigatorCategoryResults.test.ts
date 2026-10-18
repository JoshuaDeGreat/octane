import { describe, expect, it } from 'vitest';
import { buildNavigatorCategoryResults, resolveNavigatorCategoryTitle } from './navigatorCategoryResults';

const party = { code: '${navigator.flatcategory.global.PARTY}', data: '${navigator.flatcategory.global.PARTY}', action: 1, closed: true, mode: 1, rooms: [] };
const categories = [
    { id: 9, name: party.code, visible: true, automatic: false },
    { id: 10, name: '${navigator.flatcategory.global.TRADING}', visible: true, automatic: false },
    { id: 11, name: 'Hidden', visible: false, automatic: false }
];

describe('navigator category overview', () => {
    it('preserves server results and adds visible empty categories once', () => {
        const result = buildNavigatorCategoryResults([party], categories, 'hotel_view', '');
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(party);
        expect(result[1]).toMatchObject({ code: categories[1].name, action: 0, rooms: [] });
    });

    it('does not add categories to searches or other tabs', () => {
        const results = [party];
        expect(buildNavigatorCategoryResults(results, categories, 'hotel_view', 'name:shop')).toBe(results);
        expect(buildNavigatorCategoryResults(results, categories, 'official_view', '')).toBe(results);
    });
});

describe('navigator category titles', () => {
    const texts: Record<string, string> = {
        'navigator.flatcategory.global.PARTY': 'Party',
        'navigator.flatcategory.global.TRADING': 'Trading',
        'navigator.searchcode.title.popular': 'Most Popular Rooms'
    };
    const localize = (key: string) => texts[key] ?? key;

    it('resolves wrapped server captions rather than displaying the key', () => {
        expect(resolveNavigatorCategoryTitle(party.code, party.data, localize)).toBe('Party');
        expect(resolveNavigatorCategoryTitle('caption_save_trading', categories[1].name, localize)).toBe('Trading');
    });

    it('preserves ordinary search titles and literal category names', () => {
        expect(resolveNavigatorCategoryTitle('popular', '', localize)).toBe('Most Popular Rooms');
        expect(resolveNavigatorCategoryTitle('', 'Staff Picks', localize)).toBe('Staff Picks');
    });
});
