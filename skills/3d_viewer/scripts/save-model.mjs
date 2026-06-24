import fs from 'fs'
import path from 'path'

export function handlePutModel(req, res, rootDir) {
  const urlPath = req.url.split('?')[0]
  const filePath = path.resolve(rootDir, '.' + urlPath)

  // Security: reject paths outside rootDir
  if (!filePath.startsWith(rootDir + path.sep) && filePath !== rootDir) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', () => {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, Buffer.concat(chunks))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ url: urlPath }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
  })
}
