const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

app.disable('x-powered-by')

// Trust Railway's reverse proxy so req.protocol/req.ip reflect reality.
app.set('trust proxy', 1)

// Bare-domain redirect — consolidate canonical on www.
app.use((req, res, next) => {
  const host = req.headers.host
  if (host === 'medredactor.ru') {
    return res.redirect(301, `https://www.medredactor.ru${req.url}`)
  }
  next()
})

// Security + SEO headers. CSP intentionally loose — landing is static and
// we run inline <style>/<script> blocks; tighten later if analytics lands.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')
  next()
})

// Explicit routes for SEO-critical files so content-type is always correct
// (avoids the static-middleware path where content-type sniffing has bitten us).
app.get('/robots.txt', (req, res) => {
  res.type('text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.sendFile(path.join(__dirname, 'robots.txt'))
})
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.sendFile(path.join(__dirname, 'sitemap.xml'))
})
app.get('/og.png', (req, res) => {
  res.type('image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
  res.sendFile(path.join(__dirname, 'og.png'))
})
app.get('/og.svg', (req, res) => {
  res.type('image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
  res.sendFile(path.join(__dirname, 'og.svg'))
})

// Pretty URLs: /offer → offer.html, /legal/privacy → legal/privacy.html
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=300')
    } else if (/\.(png|jpg|jpeg|svg|ico|webp)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
    }
  }
}))

app.get('*', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => console.log(`Landing: http://localhost:${PORT}`))
