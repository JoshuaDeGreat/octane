// Temporary runtime repair while retaining the current compiled client assets.
// The source configuration template contains the same permanent corrections.
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname !== '/configuration/renderer-config.json' ||
            !['GET', 'HEAD'].includes(request.method)) {
            return env.ASSETS.fetch(request);
        }
        const assetRequest = new Request(request, { method: 'GET' });
        assetRequest.headers.delete('if-none-match');
        assetRequest.headers.delete('if-modified-since');
        const original = await env.ASSETS.fetch(assetRequest);
        if (!original.ok || !original.headers.get('content-type')?.includes('application/json')) return original;
        // This is a known, small configuration asset, not an arbitrary response.
        const config = await original.json();
        config['badges.custom.texts.endpoint'] = '${api.url}/api/badges/custom/texts';
        config['login.news.url'] = '${api.url}/api/auth/news';
        const headers = new Headers(original.headers);
        for (const name of ['content-length', 'content-encoding', 'etag', 'last-modified']) headers.delete(name);
        headers.set('cache-control', 'no-store');
        headers.set('content-type', 'application/json; charset=utf-8');
        return new Response(request.method === 'HEAD' ? null : JSON.stringify(config), { status: 200, headers });
    }
};
