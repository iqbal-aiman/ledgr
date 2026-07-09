import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import GenerateBill from './screens/GenerateBill'
import AddSale from './screens/AddSale'
import AddPurchase from './screens/AddPurchase'
import Customers from './screens/Customers'
import CustomerDetail from './screens/CustomerDetail'
import Reports from './screens/Reports'
import Settings from './screens/Settings'
import Inventory from './screens/Inventory'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('ledgr_session')
    if (session) setIsLoggedIn(true)
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem('ledgr_session', 'true')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('ledgr_session')
    setIsLoggedIn(false)
  }

  // Show splash screen only on first load
  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isLoggedIn
            ? <Navigate to="/dashboard" />
            : <Login onLogin={handleLogin} />
        } />
        <Route path="/dashboard" element={
          isLoggedIn
            ? <Dashboard onLogout={handleLogout} />
            : <Navigate to="/" />
        } />
        <Route path="/generate-bill" element={
          isLoggedIn ? <GenerateBill /> : <Navigate to="/" />
        } />
        <Route path="/add-sale" element={
          isLoggedIn ? <AddSale /> : <Navigate to="/" />
        } />
        <Route path="/add-purchase" element={
          isLoggedIn ? <AddPurchase /> : <Navigate to="/" />
        } />
        <Route path="/customers" element={
          isLoggedIn ? <Customers /> : <Navigate to="/" />
        } />
        <Route path="/customers/:id" element={
          isLoggedIn ? <CustomerDetail /> : <Navigate to="/" />
        } />
        <Route path="/reports" element={
          isLoggedIn ? <Reports /> : <Navigate to="/" />
        } />
        <Route path="/settings" element={
          isLoggedIn
            ? <Settings onLogout={handleLogout} />
            : <Navigate to="/" />
        } />
        <Route path="/inventory" element={
          isLoggedIn ? <Inventory /> : <Navigate to="/" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App