import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HousekeepingPublicRoomsView } from './HousekeepingPublicRoomsView';
import { getPublicGallery, savePublicGalleryRoom, uploadPublicGalleryImage } from '../../../../api/housekeeping/PublicRoomGallery';

vi.mock('../../../../api', () => ({ localizeWithFallback: (_key: string, fallback: string) => fallback }));
vi.mock('../../../../api/housekeeping/PublicRoomGallery', () => ({ getPublicGallery: vi.fn(), savePublicGalleryRoom: vi.fn(), uploadPublicGalleryImage: vi.fn(), publicGalleryImageUrl: (image: string) => image, publicGalleryError: () => 'Unable to save public rooms.' }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const data = { categories: [{ id: 7, name: 'Public rooms', visible: true }], rooms: [
    { roomId: 3, name: 'Welcome Lounge', description: '', categoryId: 7, visible: true, order: 10, image: '', userCount: 0, maxUsers: 50 }
] };
describe('Housekeeping public rooms', () => {
    it('saves ordering and visibility without changing the room identity', async () => {
        vi.mocked(getPublicGallery).mockResolvedValue(data);
        vi.mocked(savePublicGalleryRoom).mockResolvedValue(data);
        render(<HousekeepingPublicRoomsView />);
        fireEvent.click(await screen.findByRole('button', { name: /Welcome Lounge/ }));
        fireEvent.change(screen.getByLabelText('Display order (lower numbers first)'), { target: { value: '25' } });
        fireEvent.click(screen.getByLabelText('Show in Public'));
        fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
        await vi.waitFor(() => expect(savePublicGalleryRoom).toHaveBeenCalledWith({ roomId: 3, categoryId: 7, order: 25, visible: false, image: '' }));
    });
    it('uploads a chosen picture before saving its reference', async () => {
        vi.mocked(getPublicGallery).mockResolvedValue(data);
        vi.mocked(uploadPublicGalleryImage).mockResolvedValue({ image: '/saved-picture.png' });
        vi.mocked(savePublicGalleryRoom).mockResolvedValue(data);
        render(<HousekeepingPublicRoomsView />);
        fireEvent.click(await screen.findByRole('button', { name: /Welcome Lounge/ }));
        const file = new File(['png'], 'lounge.png', { type: 'image/png' });
        fireEvent.change(screen.getByLabelText('Room picture (PNG or JPEG)'), { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: 'Save room' }));
        await vi.waitFor(() => expect(savePublicGalleryRoom).toHaveBeenCalledWith(expect.objectContaining({ image: '/saved-picture.png' })));
        expect(uploadPublicGalleryImage).toHaveBeenCalledWith(3, file);
    });
});
