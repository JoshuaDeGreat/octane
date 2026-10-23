import { FC, ReactNode, useEffect } from 'react';
import './recovery.css';

export const RecoveryLayout: FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
    useEffect(() => {
        const previous = document.title;
        document.title = `${title} · Heaven Hotel`;
        return () => { document.title = previous; };
    }, [title]);
    return (
        <main className="heaven-recovery">
            <div className="recovery-cloud recovery-cloud-one" aria-hidden="true" />
            <div className="recovery-cloud recovery-cloud-two" aria-hidden="true" />
            <div className="recovery-shell">
                <header className="recovery-header">
                    <a href="https://heavenhotel.uk/" aria-label="Heaven Hotel home"><img src="branding/heaven-logo.png" width="260" height="112" alt="Heaven Hotel — Your world above the clouds" /></a>
                    <a className="recovery-home" href="https://heavenhotel.uk/">Back to home <span aria-hidden="true">↗</span></a>
                </header>
                <section className="recovery-window" aria-labelledby="recovery-title">
                    <div className="recovery-titlebar"><span>YOUR HEAVEN ACCOUNT</span><span aria-hidden="true">▣</span></div>
                    <div className="recovery-content">
                        <div className="recovery-copy">
                            <span className="recovery-eyebrow">YOUR WORLD ABOVE THE CLOUDS</span>
                            <h1 id="recovery-title">{title}</h1>
                            {children}
                        </div>
                        <aside className="recovery-art" aria-label="Welcome to Heaven Hotel">
                            <div className="recovery-sun" aria-hidden="true" />
                            <img src="https://heavenhotel.uk/assets/hotel.png" alt="Heaven Hotel with rooftop gardens and a swimming pool" width="1256" height="990" />
                            <div className="recovery-art-caption"><strong>A little place to call home.</strong><span>Your friends, your rooms, your Heaven.</span></div>
                        </aside>
                    </div>
                    <div className="recovery-window-footer"><span className="recovery-dot" aria-hidden="true" /> A little care for your account. A warm welcome back.</div>
                </section>
                <footer className="recovery-footer"><p>Heaven Hotel · Your world above the clouds.</p><small>Independent fan project. Not affiliated with Habbo or Sulake.</small></footer>
            </div>
        </main>
    );
};
