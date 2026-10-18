#!/usr/bin/env node
// Usage: node scripts/audit-ui-localization.mjs --base /path/to/ExternalTexts.json
// Checks literal LocalizeText calls, option label keys, and finite badge rarity keys.
// Dynamic keys from arbitrary server content are outside this static audit.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseIndex = process.argv.indexOf('--base');
if (baseIndex < 0 || !process.argv[baseIndex + 1]) {
    console.error('Provide the ExternalTexts.json used by the client: --base PATH');
    process.exit(2);
}

// Remove JSONC comments while preserving quoted strings, URLs and escaped quotes.
function stripComments(input) {
    let result = '', quoted = false, escaped = false;
    for (let i = 0; i < input.length; i++) {
        const c = input[i], next = input[i + 1];
        if (quoted) {
            result += c;
            if (escaped) escaped = false;
            else if (c === '\\') escaped = true;
            else if (c === '"') quoted = false;
        } else if (c === '"') { quoted = true; result += c; }
        else if (c === '/' && next === '/') {
            while (i < input.length && input[i] !== '\n') i++;
            result += '\n';
        } else if (c === '/' && next === '*') {
            i += 2;
            while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++;
            i++;
            result += ' ';
        } else result += c;
    }
    return result;
}

const base = JSON.parse(stripComments(await readFile(process.argv[baseIndex + 1], 'utf8')));
const active = JSON.parse(stripComments(await readFile(path.join(root, 'public/configuration/UITexts.jsonc'), 'utf8')));
const example = JSON.parse(stripComments(await readFile(path.join(root, 'public/configuration/UITexts_en.jsonc.example'), 'utf8')));
const known = { ...base, ...active };
const references = new Map();
function reference(key, source) {
    if (!references.has(key)) references.set(key, new Set());
    references.get(key).add(source);
}
async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) await walk(filename);
        else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
            const text = await readFile(filename, 'utf8');
            for (const match of text.matchAll(/\bLocalizeText\(\s*(['"])([^'"]+)\1/g)) {
                const after = text.slice(match.index + match[0].length).trimStart();
                if (!after.startsWith('+') && !match[2].endsWith('.')) reference(match[2], path.relative(root, filename));
            }
            for (const match of text.matchAll(/\b(?:label|labelKey|titleKey|captionKey|textKey)\s*:\s*(['"])([a-z][a-z0-9_.]+)\1/g)) {
                if (match[2].includes('.')) reference(match[2], path.relative(root, filename));
            }
        }
    }
}
await walk(path.join(root, 'src'));
for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'mythical', 'legendary', 'unique']) {
    reference('badge.rarity.' + rarity, 'badge rarity variants');
    reference('badge_leaderboard.info.rarity.' + rarity, 'badge leaderboard variants');
}
const missing = [...references.keys()].filter((key) => typeof known[key] !== 'string' || !known[key] || known[key] === key).sort();
const templateMissing = Object.keys(active).filter((key) => !(key in example));
for (const key of missing) console.error(`${key}: ${[...references.get(key)].join(', ')}`);
for (const key of templateMissing) console.error(`English example missing active key: ${key}`);
console.log(`Checked ${references.size} literal/option/badge keys: ${missing.length} missing; ${templateMissing.length} active keys absent from English example.`);
process.exitCode = missing.length || templateMissing.length ? 1 : 0;
