import availablePosters from './classicPosterIds.json';

type PosterProduct = { productType: string; furnitureData?: { className: string }; extraParam?: string };

export const classicPosterDesign = (product?: PosterProduct): string | null => {
    if (product?.productType !== 'i' || product.furnitureData?.className !== 'poster') return null;
    return /^[1-9][0-9]{0,5}$/.test(product.extraParam || '') ? product.extraParam : null;
};

export const classicPosterIcon = (design: string): string | null =>
    /^[1-9][0-9]{0,5}$/.test(design || '') && availablePosters.includes(Number(design))
        ? `/images/classic-posters/${design}.svg` : null;
