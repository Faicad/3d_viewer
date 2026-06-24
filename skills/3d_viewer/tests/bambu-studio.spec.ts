import { test, expect } from '@playwright/test'

test.describe('Bambu Studio — skill deployment', () => {
  test('button enabled after loading 3mf from same origin via postMessage', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!(window as any).__modelStore, { timeout: 10_000 })

    // Load 3mf via postMessage (this sets modelUrl via isSameOriginUrl check)
    await page.evaluate(() => {
      window.postMessage({
        type: '3d-viewer',
        id: 'test-bambu',
        command: 'loadModel',
        params: { url: '/models/vise.3mf' },
      }, '*')
    })

    // Wait for model to load
    const loaded = await page.waitForFunction(() => {
      const store = (window as any).__modelStore
      if (!store) return false
      const s = store.getState()
      return s.loadedFiles.length >= 1 && !s.loadingState.isVisible
    }, { timeout: 30_000 })
    expect(loaded).toBeTruthy()

    // Bambu Studio button should be enabled (same origin 3mf with modelUrl set)
    const button = page.locator('button[aria-label="Bambu Studio"]')
    await expect(button).toBeEnabled({ timeout: 5_000 })
  })

  test('button disabled for externally loaded model (fetch fails)', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!(window as any).__modelStore, { timeout: 10_000 })

    await page.evaluate(() => {
      window.postMessage({
        type: '3d-viewer',
        id: 'test-ext',
        command: 'loadModel',
        params: { url: 'https://example.com/nonexistent.3mf' },
      }, '*')
    })

    // Wait for the fetch to fail (no model loaded)
    await page.waitForTimeout(3_000)

    const button = page.locator('button[aria-label="Bambu Studio"]')
    await expect(button).toHaveCount(0)
  })
})
