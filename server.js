const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

// Редирект с голого домена на www
app.use((req, res, next) => {
  const host = req.headers.host
  if (host === 'medredactor.ru') {
    return res.redirect(301, `https://www.medredactor.ru${req.url}`)
  }
  next()
})

// Чистые URL: /offer → offer.html, /legal/privacy → legal/privacy.html
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('robots.txt') || filePath.endsWith('sitemap.xml')) {
      res.setHeader('Cache-Control', 'public, max-age=3600')
    }
  }
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => console.log(`Landing: http://localhost:${PORT}`))
