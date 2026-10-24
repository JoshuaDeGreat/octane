import { FC, FormEvent, useEffect, useState } from 'react';
import { GetConfigurationValue } from '../../api';
import { RecoveryLayout } from './RecoveryLayout';

/** Dedicated recovery screen. Never store recovery tokens in localStorage. */
export const PasswordResetView: FC = () => {
    const [token] = useState(() => new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token') || '');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Tokens arrive in the URL fragment, which is never sent to the web server.
        // Remove the fragment from browser history immediately after React loads.
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }, []);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending) return;
        if (password.length < 8 || password.length > 256 || password !== confirm) {
            setMessage('Enter matching passwords of at least 8 characters.');
            return;
        }
        setPending(true);
        setMessage('');
        try {
            const configured = GetConfigurationValue<string>('login.reset.endpoint', '');
            const loginEndpoint = GetConfigurationValue<string>('login.endpoint', '/api/auth/login');
            const endpoint = configured || loginEndpoint.replace(/\/api\/auth\/login(?:\?.*)?$/, '/api/auth/reset-password');
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'OctaneLoginView' },
                body: JSON.stringify({ token, newPassword: password, confirmPassword: confirm })
            });
            const result = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
            if (!response.ok) {
                setMessage(result.error || 'The recovery link could not be used. Please request another.');
                return;
            }
            setSuccess(true);
            setPassword('');
            setConfirm('');
            setMessage('Your password has been updated. You can now log in.');
        } catch {
            setMessage('Unable to contact Heaven Hotel. Please try again shortly.');
        } finally {
            setPending(false);
        }
    };

    return (
        <RecoveryLayout title="Reset your password">
                <p>Let’s get you back above the clouds. Choose a new password for your Heaven account.</p>
                {success ? (
                    <a className="recovery-button" href="./">Return to hotel login</a>
                ) : !/^[A-Za-z0-9_-]{43}$/.test(token) ? (
                    <p>This recovery link is missing or invalid. Please request a new one from the hotel login page.</p>
                ) : (
                    <form onSubmit={submit}>
                        <p className="recovery-hint">Use at least 8 characters and a password you don’t use anywhere else.</p>
                        <label htmlFor="reset-new-password">New password</label>
                        <input id="reset-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required value={password} onChange={e => setPassword(e.target.value)} />
                        <label htmlFor="reset-confirm-password">Confirm new password</label>
                        <input id="reset-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button disabled={pending} type="submit" className="recovery-button">{pending ? 'Updating…' : 'Change password'}</button>
                    </form>
                )}
                {message && <p className="recovery-message" role="status">{message}</p>}
                <p className="recovery-back"><a href="./">Back to Heaven Hotel</a></p>
        </RecoveryLayout>
    );
};
