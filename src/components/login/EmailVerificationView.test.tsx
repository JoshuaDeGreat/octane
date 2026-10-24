/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailVerificationView } from './EmailVerificationView';

vi.mock('../../api', () => ({
    GetConfigurationValue: (_key: string, fallback: string) => fallback
}));

const TOKEN = 'A'.repeat(43);

describe('EmailVerificationView', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState({}, '', '/client/?verify=1#token=' + TOKEN);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        window.history.replaceState({}, '', '/');
    });

    it('submits the verification token once even when React replays effects', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Your email address is verified.' })
        });
        vi.stubGlobal('fetch', fetchMock);

        render(<StrictMode><EmailVerificationView /></StrictMode>);

        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your email address is verified.'));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            '/api/auth/verify-email',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ token: TOKEN })
            })
        );
        expect(window.location.hash).toBe('');
    });

    it('rejects malformed links without contacting the API', () => {
        window.history.replaceState({}, '', '/client/?verify=1#token=bad');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        render(<EmailVerificationView />);

        expect(screen.getByRole('status')).toHaveTextContent('invalid');
        expect(fetchMock).not.toHaveBeenCalled();
        expect(window.location.hash).toBe('');
    });
});
