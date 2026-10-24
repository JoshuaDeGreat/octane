/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordResetView } from './PasswordResetView';

const { configuration } = vi.hoisted(() => ({ configuration: {} as Record<string, string> }));

vi.mock('../../api', () => ({
    GetConfigurationValue: (key: string, fallback: string) => configuration[key] ?? fallback
}));

const TOKEN = 'A'.repeat(43);
const PASSWORD = 'new-test-password';

const fillAndSubmit = (confirmation = PASSWORD) => {
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: PASSWORD } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: confirmation } });
    fireEvent.submit(screen.getByRole('button', { name: 'Change password' }).closest('form')!);
};

describe('PasswordResetView', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        Object.keys(configuration).forEach(key => delete configuration[key]);
        window.history.replaceState({}, '', '/client/?recovery=1#token=' + TOKEN);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        window.history.replaceState({}, '', '/');
    });

    it.each(['', 'bad', '!'.repeat(43)])('rejects an invalid token without contacting the API: %s', token => {
        window.history.replaceState({}, '', '/client/?recovery=1#token=' + encodeURIComponent(token));
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        render(<PasswordResetView />);
        expect(screen.getByText(/recovery link is missing or invalid/)).toBeInTheDocument();
        expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(window.location.hash).toBe('');
    });

    it('clears the fragment and submits the token only in the POST body under StrictMode', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
        vi.stubGlobal('fetch', fetchMock);
        render(<StrictMode><PasswordResetView /></StrictMode>);
        expect(window.location.hash).toBe('');
        expect(fetchMock).not.toHaveBeenCalled();
        fillAndSubmit();
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your password has been updated'));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password', expect.objectContaining({
            method: 'POST',
            credentials: 'omit',
            body: JSON.stringify({ token: TOKEN, newPassword: PASSWORD, confirmPassword: PASSWORD })
        }));
        expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Return to hotel login' })).toHaveAttribute('href', './');
    });

    it('rejects mismatched passwords without making a reset request', () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        render(<PasswordResetView />);
        fillAndSubmit('different-password');
        expect(screen.getByRole('status')).toHaveTextContent('Enter matching passwords');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows an expired or reused token rejection without claiming success', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'This recovery link is invalid or has expired. Please request another.' })
        }));
        render(<PasswordResetView />);
        fillAndSubmit();
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('invalid or has expired'));
        expect(screen.queryByRole('link', { name: 'Return to hotel login' })).not.toBeInTheDocument();
    });

    it('disables repeat submission while a request is pending', async () => {
        let complete!: (response: { ok: boolean; json: () => Promise<object> }) => void;
        const fetchMock = vi.fn().mockReturnValue(new Promise(resolve => { complete = resolve; }));
        vi.stubGlobal('fetch', fetchMock);
        render(<PasswordResetView />);
        fillAndSubmit();
        const button = screen.getByRole('button', { name: 'Updating…' });
        expect(button).toBeDisabled();
        fireEvent.submit(button.closest('form')!);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        complete({ ok: true, json: async () => ({}) });
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your password has been updated'));
    });

    it('allows retry after a network failure', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('Offline'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
        vi.stubGlobal('fetch', fetchMock);
        render(<PasswordResetView />);
        fillAndSubmit();
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Unable to contact Heaven Hotel'));
        expect(screen.getByRole('button', { name: 'Change password' })).toBeEnabled();
        fillAndSubmit();
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your password has been updated'));
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it.each([
        [{ 'login.endpoint': 'https://api.example.invalid/api/auth/login' }, 'https://api.example.invalid/api/auth/reset-password'],
        [{ 'login.reset.endpoint': 'https://api.example.invalid/custom-reset' }, 'https://api.example.invalid/custom-reset']
    ])('uses the configured API location', async (settings, endpoint) => {
        Object.assign(configuration, settings);
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
        vi.stubGlobal('fetch', fetchMock);
        render(<PasswordResetView />);
        fillAndSubmit();
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your password has been updated'));
        expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.any(Object));
    });
});
