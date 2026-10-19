import { housekeepingFetch, resolveHousekeepingBaseUrl } from './HousekeepingHttpClient';

export interface PublicGalleryRoom {
    roomId: number;
    name: string;
    description: string;
    categoryId: number;
    visible: boolean;
    order: number;
    image: string;
    userCount: number;
    maxUsers: number;
}

export interface PublicGalleryData {
    categories: { id: number; name: string; visible: boolean }[];
    rooms: PublicGalleryRoom[];
}

const ADMIN = '/api/housekeeping/public-rooms';
export const getPublicGallery = (admin = false, signal?: AbortSignal) =>
    housekeepingFetch<PublicGalleryData>(admin ? ADMIN : '/api/navigator/public-rooms', { signal });
export const savePublicGalleryRoom = (room: Pick<PublicGalleryRoom, 'roomId' | 'categoryId' | 'visible' | 'order' | 'image'>) =>
    housekeepingFetch<PublicGalleryData>(ADMIN, { method: 'POST', body: room });
export const publicGalleryImageUrl = (image: string) => image && /^\/api\/navigator\/public-rooms\/images\/[0-9a-f-]{36}\.png$/.test(image)
    ? resolveHousekeepingBaseUrl() + image : '';

export const publicGalleryError = (error: unknown) => {
    const detail = (error as { detail?: string })?.detail;
    try { if (detail) return String(JSON.parse(detail).error || 'Unable to load public rooms.'); } catch { /* Use the generic message. */ }
    return error instanceof Error && !detail ? error.message : 'Unable to load or save public rooms. Please try again.';
};

/** Resize a phone photo before uploading; never send the original multi-megabyte image. */
export const uploadPublicGalleryImage = async (roomId: number, file: File) => {
    if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Choose a PNG or JPEG picture.');
    if (file.size > 15 * 1024 * 1024) throw new Error('Choose a picture smaller than 15 MB.');
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Unable to prepare this picture.');
        context.imageSmoothingEnabled = false;
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
        const encoded = canvas.toDataURL('image/png').split(',')[1];
        return await housekeepingFetch<{ image: string }>(ADMIN + '/image', { method: 'POST', body: { roomId, image: encoded } });
    } finally { URL.revokeObjectURL(url); }
};
