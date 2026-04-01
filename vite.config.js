import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const feedbackPlugin = () => ({
  name: 'feedback-api',
  configureServer(server) {
    const fbPath = path.resolve(__dirname, 'feedback.json')

    server.middlewares.use('/api/feedback', (req, res) => {
      if (req.method === 'GET') {
        try {
          const data = fs.existsSync(fbPath) ? fs.readFileSync(fbPath, 'utf-8') : '{}'
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch { res.end('{}') }
      } else if (req.method === 'POST') {
        let body = ''
        req.on('data', c => body += c)
        req.on('end', () => {
          try {
            JSON.parse(body) // validate
            fs.writeFileSync(fbPath, body, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end('{"ok":true}')
          } catch { res.statusCode = 400; res.end('{"error":"invalid json"}') }
        })
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/luckymeal-prototype/' : '/',
  plugins: [react(), feedbackPlugin()],
  server: {
    port: 8080,
    host: true,
  },
})
