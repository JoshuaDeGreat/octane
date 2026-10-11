import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModToolsTemplateSelectView } from './ModToolsTemplateSelectView';

vi.mock('../../../api', () => ({
    localizeWithFallback: (_key: string, fallback: string) => fallback
}));

describe('ModToolsTemplateSelectView', () => {
    afterEach(() => cleanup());

    it('hands the chosen template to the message box', () => {
        const onSelect = vi.fn();

        render(<ModToolsTemplateSelectView templates={['First text', 'Second text']} onSelect={onSelect} />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

        expect(onSelect).toHaveBeenCalledWith('Second text');
    });

    it('renders nothing when the server sent no templates', () => {
        const { container } = render(<ModToolsTemplateSelectView templates={[]} onSelect={vi.fn()} />);

        expect(container).toBeEmptyDOMElement();
    });
});
