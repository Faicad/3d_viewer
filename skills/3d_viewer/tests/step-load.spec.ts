import { test, expect } from '@playwright/test'

test('loads box_boss.step via URL parameter', async ({ page }) => {
  await page.goto('/#/workspace?url=./models/box_boss.step')

  const loaded = await page.waitForFunction(() => {
    const store = (window as any).__modelStore
    if (!store) return false
    const s = store.getState()
    return s.loadedFiles.length >= 1 && !s.loadingState.isVisible
  }, { timeout: 60_000 })
  expect(loaded).toBeTruthy()

  const count = await page.evaluate(() => (window as any).__modelStore.getState().loadedFiles.length)
  expect(count).toBe(1)

  await expect(page.locator('canvas').first()).toBeAttached({ timeout: 5_000 })

  // Verify modelUrl is set for Bambu Studio (same-origin URL)
  const modelUrl = await page.evaluate(() => {
    const s = (window as any).__modelStore.getState()
    const f = s.loadedFiles.find((ff: any) => ff.id === s.activeFileId)
    return f?.modelUrl ?? null
  })
  expect(modelUrl).toContain('box_boss.step')

  // Bambu Studio button should be enabled
  const button = page.locator('button[aria-label="Bambu Studio"]')
  await expect(button).toBeEnabled()
})
