import http from 'http'
import fs from 'fs'
const out = process.argv[2]
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method !== 'POST') return res.end()
  const name = req.url.split('/').pop().replace(/[^\w.]/g, '')
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => { fs.writeFileSync(`${out}/${name}`, Buffer.concat(chunks)); res.end('ok') })
}).listen(3999, '127.0.0.1')
