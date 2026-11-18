import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'

const files = (await fs.readdir('slides')).filter(f => f.endsWith('.html')).sort()
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH })
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

for (const f of files) {
  await page.goto(`file://${process.cwd()}/slides/${f}`, { waitUntil: 'networkidle0' })
  const overflow = await page.evaluate(() => {
    const fr = document.querySelector('.frame')
    return fr.scrollHeight > fr.clientHeight + 1 || fr.scrollWidth > fr.clientWidth + 1
  })
  if (overflow) console.error(`OVERFLOW: ${f}`)
  await page.screenshot({ path: `out/${f.replace('.html', '.png')}` })
}
await browser.close()