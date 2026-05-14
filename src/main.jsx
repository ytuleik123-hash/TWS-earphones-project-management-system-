import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: '' }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    this.setState({ info: info.componentStack || '' })
    console.error('React error:', error, info)
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: '40px', fontFamily: 'sans-serif', color: '#c00' }
      },
        React.createElement('h2', null, 'React 渲染错误'),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap' } },
          this.state.error?.toString() || 'Unknown error'
        ),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '16px' } },
          this.state.info || ''
        )
      )
    }
    return this.props.children
  }
}

// 全局 JS 错误捕获
window.addEventListener('error', (e) => {
  const root = document.getElementById('root')
  if (root && !root.querySelector('h2')) {
    root.innerHTML = `<div style="padding:40px;font-family:sans-serif;color:#c00">
      <h2>JS 加载/运行错误</h2>
      <pre>${e.message || e.error?.message || 'Unknown error'}</pre>
      <pre style="font-size:12px;margin-top:16px">${e.error?.stack || ''}</pre>
    </div>`
  }
  return true
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
