import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomers, getSalesByCustomer } from '../database'
import { IconSearch, IconUsers, IconChevronRight } from '../Icons'
import './Customers.css'

function SkeletonCustomers() {
  return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Customers</h2>
      </div>
      <div className="search-bar"><div className="skeleton" style={{ height: '44px', borderRadius: '12px' }} /></div>
      <div className="customer-list">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="customer-card" style={{ pointerEvents: 'none' }}>
            <div className="skeleton" style={{ width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton" style={{ width: '55%', height: '14px' }} />
              <div className="skeleton" style={{ width: '75%', height: '11px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <div className="skeleton" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton" style={{ width: '45px', height: '10px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => { loadCustomers() }, [])

  const loadCustomers = async () => {
    setLoading(true)
    const all = await getCustomers()
    const withTotals = await Promise.all(all.map(async c => {
      const sales   = await getSalesByCustomer(c.id)
      const total   = sales.reduce((sum, s) => sum + s.total, 0)
      const sorted  = sales.sort((a, b) => new Date(b.date) - new Date(a.date))
      const lastSale = sorted[0] || null
      return { ...c, total, billCount: sales.length, lastSale }
    }))
    withTotals.sort((a, b) => {
      if (!a.lastSale && !b.lastSale) return 0
      if (!a.lastSale) return 1
      if (!b.lastSale) return -1
      return new Date(b.lastSale.date) - new Date(a.lastSale.date)
    })
    setCustomers(withTotals)
    setLoading(false)
  }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getLastVisit = (lastSale) => {
    if (!lastSale) return 'No visits yet'
    const diff = Math.floor((new Date() - new Date(lastSale.date)) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return `${diff} days ago`
  }

  if (loading) return <SkeletonCustomers />

  return (
    <div className="screen page-enter">
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Customers ({customers.length})</h2>
      </div>

      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon-svg"><IconSearch size={16} color="#948B76" /></span>
          <input className="search-input" placeholder="Search customers..." value={search}
            onChange={e => setSearch(e.target.value)} />
          {search.length > 0 && <div className="search-clear" onClick={() => setSearch('')}>✕</div>}
        </div>
      </div>

      <div className="customer-list">
        {filtered.length === 0 && (
          <div className="empty-state-card">
            <IconUsers size={36} color="#DCD3BC" />
            <p>{search ? `No results for "${search}"` : 'No customers yet'}</p>
            <span>{search ? 'Try a different name' : 'Customers are added automatically when you generate a bill'}</span>
          </div>
        )}
        {filtered.map((customer, i) => (
          <div key={customer.id} className="customer-card pressable" onClick={() => navigate(`/customers/${customer.id}`)}
            style={{ animation: 'slideUp 0.3s ease forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}>
            <div className="cust-avatar">{getInitials(customer.name)}</div>
            <div className="cust-info">
              <div className="cust-name">{customer.name}</div>
              <div className="cust-meta">
                {getLastVisit(customer.lastSale)}
                {customer.billCount > 0 && <span className="cust-dot">·</span>}
                {customer.billCount > 0 && <span>{customer.billCount} transactions</span>}
              </div>
            </div>
            <div className="cust-right">
              <div className="cust-amount">Rs {customer.total.toLocaleString()}</div>
              <div className="cust-amount-label">total spent</div>
            </div>
            <div className="cust-chevron"><IconChevronRight size={14} color="#948B76" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Customers