import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NavigatorPublicGalleryView } from './NavigatorPublicGalleryView';
import { getPublicGallery } from '../../../api/housekeeping/PublicRoomGallery';
import { TryVisitRoom } from '../../../api';

vi.mock('../../../api', () => ({ localizeWithFallback: (_key: string, fallback: string) => fallback, TryVisitRoom: vi.fn() }));
vi.mock('../../../api/housekeeping/PublicRoomGallery', () => ({ getPublicGallery: vi.fn(), publicGalleryImageUrl: (image: string) => image }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const data = { categories: [{ id: 7, name: 'Public rooms', visible: true }], rooms: [
    { roomId: 3, name: 'Welcome Lounge', description: 'Meet other players here.', categoryId: 7, visible: true, order: 10, image: '', userCount: 0, maxUsers: 50 },
    { roomId: 4, name: 'Trading Lounge', description: 'Trade safely.', categoryId: 7, visible: true, order: 20, image: '/image.png', userCount: 5, maxUsers: 50 }
] };

describe('public room gallery', () => {
    it('shows empty rooms and occupancy and enters the room selected', async () => {
        vi.mocked(getPublicGallery).mockResolvedValue(data);
        render(<NavigatorPublicGalleryView onUnavailable={vi.fn()} />);
        fireEvent.click(await screen.findByRole('button', { name: 'Welcome Lounge' }));
        expect(TryVisitRoom).toHaveBeenCalledWith(3);
        expect(screen.getByLabelText('0 / 50')).toBeInTheDocument();
        expect(screen.getByLabelText('5 / 50')).toBeInTheDocument();
    });
    it('opens room information without entering it', async () => {
        vi.mocked(getPublicGallery).mockResolvedValue(data);
        render(<NavigatorPublicGalleryView onUnavailable={vi.fn()} />);
        fireEvent.click(await screen.findByRole('button', { name: 'Room information: Welcome Lounge' }));
        expect(screen.getByText('Meet other players here.', { exact: false })).toBeInTheDocument();
        expect(TryVisitRoom).not.toHaveBeenCalled();
    });
    it('falls back to the normal navigator when the server has no gallery endpoint', async () => {
        vi.mocked(getPublicGallery).mockRejectedValue(new Error('Not found'));
        const fallback = vi.fn();
        render(<NavigatorPublicGalleryView onUnavailable={fallback} />);
        await vi.waitFor(() => expect(fallback).toHaveBeenCalledTimes(1));
    });
});
