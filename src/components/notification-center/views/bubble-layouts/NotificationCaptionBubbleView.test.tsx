import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../api', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    SanitizeHtml: (html: string) => html,
    localizeWithFallback: (_key: string, fallback: string) => fallback
}));

vi.mock('../../../../common', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    LayoutNotificationBubbleView: ({ children, classNames }: { children?: React.ReactNode; classNames?: string[] }) => (
        <div data-testid="bubble" className={classNames?.join(' ')}>
            {children}
        </div>
    )
}));

import { NotificationBubbleItem, NotificationBubbleType } from '../../../../api';
import { GetBubbleLayout } from './GetBubbleLayout';

afterEach(cleanup);

describe('the captioned bubbles', () => {
    it.each([
        [NotificationBubbleType.WIRED, 'Wired'],
        [NotificationBubbleType.TREASURE_HUNT, 'Treasure hunt'],
        [NotificationBubbleType.NFT_OPENING, 'Collectible reward']
    ])('draws %s with its caption and the text', (type, caption) => {
        render(<>{GetBubbleLayout(new NotificationBubbleItem('Something happened', type), () => null)}</>);

        expect(screen.getByText(caption)).toBeTruthy();
        expect(screen.getByText('Something happened')).toBeTruthy();
        expect(screen.getByTestId('bubble').className).toContain(`octane-caption-notification--${type}`);
    });
});

describe('NotificationBubbleType.resolve', () => {
    it('takes the first captioned style asked for, and falls back to info', () => {
        expect(NotificationBubbleType.resolve(undefined, 'wired')).toBe('wired');
        expect(NotificationBubbleType.resolve('treasure_hunt', 'wired')).toBe('treasure_hunt');
        expect(NotificationBubbleType.resolve(undefined, 'floorplan_editor.error')).toBe('info');
    });
});
