// End-to-end smoke test for Skyline Stack (headless Chromium via Playwright).
// Usage: node qa/smoke.mjs <url>   e.g. node qa/smoke.mjs https://song11071696.github.io/cloud9-minigame/
// Needs: npm i --no-save playwright && npx playwright install chromium
// Written by the entrant for QA (not by Junie); it drives the real build through ?test=1.
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const sep = base.includes('?') ? '&' : '?';
const response = await page.goto(`${base}${sep}test=1&seed=9&event=smoke`);
const state = () => page.evaluate(() => window.__skyline);
const waitFor = async (pred, ms) => {
  const t = Date.now();
  while (Date.now() - t < ms) { const s = await state(); if (pred(s)) return s; await page.waitForTimeout(150); }
  return state();
};
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) process.exitCode = 1; };

check(response?.status() === 200, `page loads (HTTP ${response?.status()})`);
await page.waitForTimeout(1200);
check((await state())?.screen === 'attract', 'starts in attract mode');
await page.keyboard.press('Space');
check((await waitFor((s) => s.screen === 'play', 6000)).screen === 'play', 'press -> countdown -> play');
for (let i = 0; i < 3; i += 1) { await page.keyboard.press('Space'); await page.waitForTimeout(700); }
check((await state()).floors > 0, 'blocks land and floors count up');
let s = await state(); let n = 0;
while (s.screen === 'play' && n < 250) { await page.keyboard.press('Space'); await page.waitForTimeout(350); s = await state(); n += 1; }
check(s.screen === 'game-over', `round ends -> game over (score ${s.score})`);
s = await waitFor((x) => x.screen !== 'game-over', 2500);
if (s.screen === 'game-over') { await page.keyboard.press('Space'); s = await waitFor((x) => x.screen !== 'game-over', 3000); }
check(s.screen === 'initials', 'high score -> one-button initials');
await page.keyboard.press('Space'); await page.waitForTimeout(150);
await page.keyboard.press('Space'); await page.waitForTimeout(150);
await page.keyboard.down('Space'); await page.waitForTimeout(800); await page.keyboard.up('Space');
await page.waitForTimeout(300);
await page.keyboard.press('Q'); await page.waitForTimeout(150); await page.keyboard.press('A');
s = await waitFor((x) => x.screen === 'leaderboard', 4000);
check(s.screen === 'leaderboard', 'initials saved -> leaderboard');
const saved = await page.evaluate(() => localStorage.getItem('skyline-stack-leaderboard'));
check(Boolean(saved && saved.includes('"CQA"')), `entry persisted: ${saved}`);
check(errors.length === 0, `no page errors ${JSON.stringify(errors)}`);
await browser.close();
