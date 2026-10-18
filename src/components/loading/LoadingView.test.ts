import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('LoadingView branding', () => {
    it('renders Heaven Hotel as the default loading logo and keeps the custom logo override', () => {
        const source = readFileSync(join(process.cwd(), 'src/components/loading/LoadingView.tsx'), 'utf8');

        expect(source).toContain('<HeavenHotelBrand variant="loading" />');
        expect(source).toContain('alt="Heaven Hotel"');
        expect(source).toContain('customLogoUrl ? (');
        expect(source).not.toContain('octane-logo.png');
        expect(source).not.toContain('octane_v3.png');
        expect(source).not.toContain('loading.gif');
    });
});
