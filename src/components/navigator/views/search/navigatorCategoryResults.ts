import type { NavigatorCategoryDataParser, NavigatorSearchResultList } from '@octane/renderer';

export type NavigatorCategoryResult = Pick<NavigatorSearchResultList, 'code' | 'data' | 'action' | 'closed' | 'mode' | 'rooms'>;

/** Add empty categories only to the unfiltered All Rooms overview. */
export const buildNavigatorCategoryResults = (
    results: NavigatorCategoryResult[],
    categories: Pick<NavigatorCategoryDataParser, 'id' | 'name' | 'visible' | 'automatic'>[],
    viewCode: string,
    filter: string
): NavigatorCategoryResult[] => {
    if (viewCode !== 'hotel_view' || filter?.trim() || !categories?.length) return results;

    const populatedNames = new Set(results.flatMap((result) => [result.code, result.data]));
    const emptyCategories = categories
        .filter((category) => category.visible && !category.automatic &&
            !populatedNames.has(category.name) && !category.name.endsWith('.OFFICIAL}'))
        .map((category) => ({ code: category.name, data: category.name, action: 0, closed: false, mode: 0, rooms: [] }));

    return [...results, ...emptyCategories];
};

export const resolveNavigatorCategoryTitle = (code: string, data: string, localize: (key: string) => string): string => {
    const caption = (value: string) => {
        if (!value) return '';
        const wrapped = /^\$\{([^}]+)\}$/.exec(value);
        const key = wrapped ? wrapped[1] : value;
        const translated = localize(key);
        return translated && translated !== key ? translated : key;
    };
    if (!code) return caption(data);
    if (code.startsWith('${')) return caption(code);
    const key = 'navigator.searchcode.title.' + code;
    const translated = localize(key);
    return translated && translated !== key ? translated : caption(data || code);
};
