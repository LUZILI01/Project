import React from 'react'
import RouterView from './router'
// import { HashRouter as Router, Route, Routes } from "react-router-dom"
// import Login from "./components/Login"
// import Register from "./components/Register"
// import Home from "./components/Home"
import { SnackbarProvider } from './components/SnackbarManager'

function App () {
  return (
    <SnackbarProvider>
      <RouterView />
    </SnackbarProvider>
  )
}

export default App
