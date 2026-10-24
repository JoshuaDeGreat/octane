import { FC, useEffect, useRef, useState } from 'react';
import { GetConfigurationValue } from '../../api';
import { RecoveryLayout } from './RecoveryLayout';

/** One-time mailbox ownership proof. The secret is never sent in the HTTP URL. */
export const EmailVerificationView: FC = () => {
    const [status, setStatus] = useState('Verifying your email address…');
    const requestRef = useRef<Promise<{ ok: boolean; message: string }> | null>(null);
    // React StrictMode replays effects. Capture the secret before either effect clears the fragment.
    const tokenRef = useRef(new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token') || '');
    useEffect(() => {
        const token = tokenRef.current;
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
        if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
            setStatus('This verification link is invalid. Request another from your account settings.');
            return;
        }
        const loginEndpoint = GetConfigurationValue<string>('login.endpoint', '/api/auth/login');
        const endpoint = GetConfigurationValue<string>('login.verify-email.endpoint', '')
            || loginEndpoint.replace(/\/api\/auth\/login(?:\?.*)?$/, '/api/auth/verify-email');
        let active = true;
        if (!requestRef.current) {
            requestRef.current = fetch(endpoint, {
                method: 'POST',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'OctaneLoginView' },
                body: JSON.stringify({ token })
            }).then(async response => {
                const data = await response.json().catch(() => ({})) as { message?: string; error?: string };
                return {
                    ok: response.ok,
                    message: response.ok
                        ? (data.message || 'Email verified. Please log in again.')
                        : (data.error || 'Verification failed. Please request another link.')
                };
            });
        }
        requestRef.current.then(result => {
            if (active) setStatus(result.message);
        }).catch(() => {
            if (active) setStatus('The hotel could not be reached. Please try again.');
        });
        return () => { active = false; };
    }, []);

    return (
        <RecoveryLayout title="Verify your email">
            <p>A little step to keep your Heaven account safe. A verified email helps you find your way back if you forget your password.</p>
            <p className="recovery-message" role="status">{status}</p>
            <a className="recovery-button" href="./">Return to hotel login</a>
        </RecoveryLayout>
    );
};
