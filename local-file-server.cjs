/**
 * TWS Material Tracker - 本地文件打开助手
 *
 * 通过后台 HTTP 请求接收文件路径，用系统命令打开文件。
 * 先检查文件是否存在，再打开，避免 Windows 弹"找不到文件"对话框。
 *
 * 启动：node local-file-server.cjs
 */

const http = require('http')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const PORT = 3456

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const urlObj = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = urlObj.pathname

  // 健康检查
  if (pathname === '/ping') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // 打开文件
  if (pathname === '/open') {
    const filePath = urlObj.searchParams.get('path')
    if (!filePath) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: '缺少 path 参数' }))
      return
    }

    if (/[<>"|]/.test(filePath)) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: '路径包含非法字符' }))
      return
    }

    console.log('请求打开:', filePath)

    // 先检查文件是否存在
    try {
      fs.accessSync(filePath, fs.constants.R_OK)
    } catch {
      console.error('文件不存在:', filePath)
      res.writeHead(404)
      res.end(JSON.stringify({
        error: `文件不存在或无法访问`,
        detail: `请确认路径正确:\n${filePath}`,
        file: filePath
      }))
      return
    }

    console.log('文件存在, 正在打开...')

    // 用 start 命令打开（不等待进程结束）
    const cmd = process.platform === 'win32'
      ? `start "" "${filePath}"`
      : process.platform === 'darwin'
        ? `open "${filePath}"`
        : `xdg-open "${filePath}"`

    exec(cmd, { timeout: 5000 }, (err) => {
      if (err) {
        console.error('打开命令失败:', err.message)
        res.writeHead(500)
        res.end(JSON.stringify({
          error: '打开文件失败',
          detail: err.message,
          file: filePath
        }))
        return
      }
      console.log('✓ 已打开:', filePath)
      res.writeHead(200)
      res.end(JSON.stringify({ status: 'opened', file: filePath }))
    })
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`✓ 本地文件打开助手运行在 http://localhost:${PORT}`)
  console.log(`  请在 TWS 物料追踪面板中点击文件链接即可打开本地文件`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，文件打开助手可能已在运行`)
  } else {
    console.error('服务器启动失败:', err.message)
  }
})
