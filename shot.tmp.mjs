import { chromium } from 'playwright';

const out = process.argv[2];
const browser = await chromium.launch();
const errors = [];

for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
	const page = await browser.newPage({ viewport: vp });
	page.on('console', (m) => m.type() === 'error' && errors.push(`${name} console: ${m.text()}`));
	page.on('pageerror', (e) => errors.push(`${name} pageerror: ${e.message}`));
	await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
	await page.waitForTimeout(2500);
	await page.screenshot({ path: `${out}/${name}-hero.png` });
	await page.evaluate(() => document.getElementById('what-we-do').scrollIntoView());
	await page.waitForTimeout(2500);
	await page.screenshot({ path: `${out}/${name}-wwd.png`, fullPage: false });
	await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.6));
	await page.waitForTimeout(1500);
	await page.screenshot({ path: `${out}/${name}-wwd2.png` });
	const info = await page.evaluate(() => {
		const s = document.getElementById('what-we-do');
		const v = s?.querySelector('.journey-visual');
		const r = v?.getBoundingClientRect();
		return { wwdClass: s?.className, visual: r && [r.width, r.height], htmlClass: document.documentElement.className };
	});
	errors.push(`${name} info: ${JSON.stringify(info)}`);
	await page.close();
}
console.log(errors.join('\n'));
await browser.close();
