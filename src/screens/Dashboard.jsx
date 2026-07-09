import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getTodaySales, getCustomers, getMonthlySales, getShopName } from '../database'
import { IconReceipt, IconBolt, IconCart, IconUsers, IconBox, IconChart, IconGear } from '../Icons'
import './Dashboard.css'

function useCountUp(target, duration = 800, started = false) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!started || target === 0) {
      setValue(target)
      return
    }
    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else setValue(target)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, started, duration])

  return value
}

function SkeletonDashboard() {
  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="dash-top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ width: '80px', height: '12px' }} />
            <div className="skeleton" style={{ width: '140px', height: '20px' }} />
            <div className="skeleton" style={{ width: '180px', height: '11px' }} />
          </div>
          <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
        </div>
      </div>
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: '70%', height: '11px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '90%', height: '24px', marginBottom: '6px' }} />
            <div className="skeleton" style={{ width: '50%', height: '10px' }} />
          </div>
        ))}
      </div>
      <div className="section-block">
        <div className="skeleton" style={{ width: '100px', height: '12px', marginBottom: '12px' }} />
        <div className="qa-grid">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="skeleton" style={{ height: '76px', borderRadius: '16px' }} />
          ))}
        </div>
      </div>
      <div className="section-block">
        <div className="skeleton" style={{ width: '140px', height: '12px', marginBottom: '12px' }} />
        <div className="txn-card">
          {[1, 2, 3].map(i => (
            <div key={i} className="txn-item">
              <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton" style={{ width: '60%', height: '13px' }} />
                <div className="skeleton" style={{ width: '40%', height: '11px' }} />
              </div>
              <div className="skeleton" style={{ width: '60px', height: '14px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ onLogout }) {
  const navigate = useNavigate()
  const [todaySales, setTodaySales] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [customers, setCustomers] = useState([])
  const [shopName, setShopName] = useState('My Shop')
  const [loading, setLoading] = useState(true)
  const [animStarted, setAnimStarted] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const today = await getTodaySales()
    const monthly = await getMonthlySales()
    const custs = await getCustomers()
    const shop = await getShopName()
    setTodaySales(today)
    setMonthlySales(monthly)
    setCustomers(custs)
    setShopName(shop || 'My Shop')
    setLoading(false)
    setTimeout(() => setAnimStarted(true), 100)
  }

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0)
  const monthTotal = monthlySales.reduce((sum, s) => sum + s.total, 0)
  const todayBills = todaySales.filter(s => s.type === 'bill').length
  const todayQuick = todaySales.filter(s => s.type === 'quick').length

  const animTodayTotal = useCountUp(todayTotal, 900, animStarted)
  const animMonthTotal = useCountUp(monthTotal, 1100, animStarted)
  const animCustomers = useCountUp(customers.length, 700, animStarted)
  const animBills = useCountUp(todayBills, 600, animStarted)

  const todayLabel = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const recentSales = [...todaySales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleString('en-PK', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const quickActions = [
    { icon: IconReceipt, label: 'Generate Bill', path: '/generate-bill', primary: true },
    { icon: IconBolt,    label: 'Add Sale',      path: '/add-sale',      primary: false },
    { icon: IconCart,    label: 'Purchase',      path: '/add-purchase',  primary: false },
    { icon: IconUsers,   label: 'Customers',     path: '/customers',     primary: false },
    { icon: IconBox,     label: 'Inventory',     path: '/inventory',     primary: false },
    { icon: IconChart,   label: 'Reports',       path: '/reports',       primary: false },
    { icon: IconGear,    label: 'Settings',      path: '/settings',      primary: false },
  ]

  if (loading) return <SkeletonDashboard />

  return (
    <div className="dashboard page-enter">
      <div className="dash-header">
        <div className="dash-top">
          <div className="dash-title-group">
            <p className="dash-greeting">Good {getGreeting()}</p>
            <h2>{shopName}</h2>
            <p className="dash-date">{todayLabel}</p>
          </div>
          <div className="dash-avatar pressable" onClick={() => navigate('/settings')} title="Settings">
            {shopName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent" style={{ animationDelay: '0ms' }}>
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">Rs {animTodayTotal.toLocaleString()}</div>
          <div className="stat-sub">{todaySales.length} transactions</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '60ms' }}>
          <div className="stat-label">This Month</div>
          <div className="stat-value">Rs {animMonthTotal.toLocaleString()}</div>
          <div className="stat-sub">{monthlySales.length} transactions</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '120ms' }}>
          <div className="stat-label">Customers</div>
          <div className="stat-value">{animCustomers}</div>
          <div className="stat-sub">registered</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '180ms' }}>
          <div className="stat-label">Today Bills</div>
          <div className="stat-value">{animBills}</div>
          <div className="stat-sub">{todayQuick} quick sales</div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-label">Quick Actions</div>
        <div className="qa-grid">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <div
                key={i}
                className={`qa-btn pressable ${action.primary ? 'primary' : ''}`}
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="qa-icon"><Icon size={20} color={action.primary ? '#0F1D2E' : '#0F1D2E'} /></div>
                <div className="qa-label">{action.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="section-block">
        <div className="section-row">
          <div className="section-label">Recent Transactions</div>
          <span className="see-all" onClick={() => navigate('/reports')}>See all →</span>
        </div>

        <div className="txn-card">
          {recentSales.length === 0 ? (
            <div className="empty-state">
              <IconReceipt size={36} color="#DCD3BC" />
              <p>No transactions today</p>
              <span>Generate a bill or add a sale to get started</span>
            </div>
          ) : (
            recentSales.map((sale, i) => (
              <div
                key={sale.id}
                className="txn-item"
                style={{ animation: 'slideUp 0.3s ease forwards', animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="txn-avatar">{getInitials(sale.customerName)}</div>
                <div className="txn-info">
                  <div className="txn-name">{sale.customerName}</div>
                  <div className="txn-meta">
                    <span>{formatTime(sale.date)}</span>
                    <span className={`txn-badge ${sale.type}`}>
                      {sale.type === 'bill' ? 'Bill' : 'Quick'}
                    </span>
                  </div>
                </div>
                <div className="txn-amount">Rs {sale.total.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export default Dashboard