import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@octane/renderer', () => ({ FurniturePickupAllComposer: class {}, RoomObjectCategory: { FLOOR: 1, WALL: 2, UNIT: 100 } }));
vi.mock('../../../../api', () => ({
    chooserSelectionVisualizer: { clearAll: vi.fn(), show: vi.fn(), hide: vi.fn() },
    localizeWithFallback: (_key: string, fallback: string) => fallback,
    LocalizeText: (key: string) => key,
    SendMessageComposer: vi.fn()
}));
vi.mock('../../../../hooks', () => ({ useFurniPickupGuard: () => ({ confirmIfWebApiBox: vi.fn() }), useHasPermission: () => false }));
vi.mock('../../../../common', () => ({
    Button: (props: { children: ReactNode }) => <button>{props.children}</button>,
    Flex: (props: { children: ReactNode }) => <div>{props.children}</div>,
    InfiniteScroll: (props: { rows: { id: number }[]; rowRender: (row: never) => ReactNode }) => <div>{props.rows.map((row) => <div key={row.id}>{props.rowRender(row as never)}</div>)}</div>,
    OctaneCardContentView: (props: { children: ReactNode }) => <div>{props.children}</div>,
    OctaneCardHeaderView: (props: { headerText: string }) => <h1>{props.headerText}</h1>,
    OctaneCardView: (props: { children: ReactNode; className: string }) => <div data-testid="card" className={props.className}>{props.children}</div>,
    Text: (props: { children: ReactNode }) => <span>{props.children}</span>
}));
vi.mock('../../../../layout', () => ({
    classNames: (...values: unknown[]) => values.filter(Boolean).join(' '),
    OctaneInput: (props: { value: string; onChange: (event: { target: { value: string } }) => void; placeholder: string }) => (
        <input placeholder={props.placeholder} value={props.value} onChange={(event) => props.onChange(event)} />
    )
}));

const { ChooserWidgetView } = await import('./ChooserWidgetView');

const item = (id: number, name: string) => ({ id, category: 100, name, ownerName: '-', ownerId: 0, type: 'Habbo' }) as never;
const items = [item(1, 'Alice'), item(2, 'Bob')];

afterEach(cleanup);

describe('ChooserWidgetView', () => {
    it('takes the size of the official window for its kind', () => {
        render(<ChooserWidgetView items={items} onClose={() => undefined} selectItem={() => undefined} title="Users" type="users" />);
        expect(screen.getByTestId('card').className).toContain('w-[290px]');

        cleanup();
        render(<ChooserWidgetView items={items} onClose={() => undefined} selectItem={() => undefined} title="Furni" type="furni" />);
        expect(screen.getByTestId('card').className).toContain('w-[413px]');
    });

    it('counts what is shown, and a search can be cleared with its cross', () => {
        render(<ChooserWidgetView items={items} onClose={() => undefined} selectItem={() => undefined} title="Users" type="users" />);

        expect(screen.getByText(/Shown: 2\/2/)).toBeTruthy();

        fireEvent.change(screen.getByPlaceholderText('generic.search'), { target: { value: 'ali' } });
        expect(screen.getByText(/Shown: 1\/2/)).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(screen.getByText(/Shown: 2\/2/)).toBeTruthy();
    });
});
