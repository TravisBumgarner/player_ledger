import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, dialog, app as electronApp, Menu, shell } from 'electron'

const here = dirname(fileURLToPath(import.meta.url))
const databasePath = join(electronApp.getPath('userData'), 'app.sqlite')

// No top-level await: Electron holds `ready` until an ESM entry finishes evaluating, so awaiting
// whenReady at the top level deadlocks with the dock icon bouncing forever.
async function start() {
  // `npm run dev:desktop` runs the API and Vite separately, for watch and hot reload, and points here.
  const devUrl = process.env.ELECTRON_DEV_URL
  const { origin, close } = devUrl ? { origin: devUrl, close: () => {} } : await startApi()

  function openWindow() {
    const window = new BrowserWindow({
      width: 1100,
      height: 900,
      // The page draws its own 52px title bar; the traffic lights sit in its reserved left inset.
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 20, y: 19 },
      backgroundColor: '#1b1a1d',
    })
    // Electron has no context menu of its own; this is the browser's edit menu and spelling fixes.
    window.webContents.on('context-menu', (_event, params) => {
      const suggestions = params.dictionarySuggestions.map((word) => ({
        label: word,
        click: () => window.webContents.replaceMisspelling(word),
      }))
      Menu.buildFromTemplate([
        ...suggestions,
        ...(suggestions.length ? [{ type: 'separator' as const }] : []),
        { role: 'cut', enabled: params.editFlags.canCut },
        { role: 'copy', enabled: params.editFlags.canCopy },
        { role: 'paste', enabled: params.editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll' },
      ]).popup()
    })
    window.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url)
      return { action: 'deny' }
    })
    void window.loadURL(origin)
  }

  await electronApp.whenReady()
  openWindow()

  electronApp.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) openWindow()
  })
  electronApp.on('will-quit', close)
}

async function startApi() {
  // The API reads its config from the environment at import time, so this precedes the imports below.
  process.env.NODE_ENV = 'production'
  process.env.DESKTOP = '1'
  process.env.DATABASE_PATH = databasePath

  const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')
  const { db, sqlite } = await import('../../api/src/db/index.js')
  const { default: api } = await import('../../api/src/app.js')

  // packages/api/drizzle in dev; resources/api/drizzle when packaged (see electron-builder.yml).
  migrate(db, { migrationsFolder: resolve(here, '..', '..', 'api', 'drizzle') })

  // Loopback only, on whatever port is free: nothing else on the network can reach it.
  const server = api.listen(0, '127.0.0.1')
  await new Promise((done) => server.once('listening', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('API did not bind a port')
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => {
      server.close()
      sqlite.close()
    },
  }
}

electronApp.on('window-all-closed', () => electronApp.quit())

start().catch((error: unknown) => {
  dialog.showErrorBox('Awesomeness Mgmt failed to start', String(error))
  electronApp.exit(1)
})
