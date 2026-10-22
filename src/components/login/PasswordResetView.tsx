import { FC, FormEvent, useEffect, useState } from 'react';
import { GetConfigurationValue } from '../../api';

/** Dedicated recovery screen. Never store recovery tokens in localStorage. */
export const PasswordResetView: FC = () => {
    const [token] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Keep reset credentials out of copied URLs, referrers, and browser history.
        window.history.replaceState({}, '', window.location.pathname);
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
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(#b6e2f0,#f7e9ca)', color: '#26364a', fontFamily: 'Arial, sans-serif' }}>
            <section style={{ width: '100%', maxWidth: 420, padding: 28, background: '#fffdf7', border: '3px solid #54718a', borderRadius: 12, boxShadow: '0 10px 30px #38556c40' }}>
                <h1 style={{ marginTop: 0 }}>Heaven Hotel</h1>
                <h2>Reset your password</h2>
                {success ? (
                    <a href="./">Return to hotel login</a>
                ) : token.length !== 43 ? (
                    <p>This recovery link is missing or invalid. Please request a new one from the hotel login page.</p>
                ) : (
                    <form onSubmit={submit}>
                        <label htmlFor="reset-new-password">New password</label>
                        <input id="reset-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', margin: '8px 0 16px', padding: 12 }} />
                        <label htmlFor="reset-confirm-password">Confirm new password</label>
                        <input id="reset-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', margin: '8px 0 16px', padding: 12 }} />
                        <button disabled={pending} type="submit" style={{ padding: '12px 18px', background: '#35799a', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>{pending ? 'Updating…' : 'Change password'}</button>
                    </form>
                )}
                {message && <p role="status">{message}</p>}
                <p><a href="./">Back to Heaven Hotel</a></p>
            </section>
        </main>
    );
};
