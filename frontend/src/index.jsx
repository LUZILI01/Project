import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

ReactDOM.render(
  <Suspense fallback="loading">
    <HashRouter>
      <App />
    </HashRouter>
  </Suspense>,
  document.getElementById('root')
)
