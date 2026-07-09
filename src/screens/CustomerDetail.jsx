import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCustomers, getSalesByCustomer } from '../database'
import { IconReceipt, IconBolt } from '../Icons'
import './CustomerDetail.css'

function CustomerDetail() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const [customer, setCustomer] = useState(null)
  const [sales, setSales]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    setLoading(true)
    const customers = await getCustomers()
    const found     = customers.find(c => c.id === parseInt(id))
    setCustomer(found)
    if (found) {
      const s = await getSalesByCustomer(found.id)
      setSales(s.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }
    setLoading(false)
  }

  const totalSpent  = sales.reduce((sum, s) => sum + s.total, 0)
  const totalDiscount = sales.reduce((sum, s) => sum + (s.discount || 0), 0)
  const billCount   = sales.filter(s => s.type === 'bill').length

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const getInitials = (name) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Customer</h2>
      </div>
      <div className="cust-detail-hero">
        <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 12px' }} />
        <div className="skeleton" style={{ width: '140px', height: '20px', margin: '0 auto 8px' }} />
        <div className="skeleton" style={{ width: '100px', height: '12px', margin: '0 auto' }} />
      </div>
      <div className="history-list">
        {[1,2,3].map(i => (
          <div key={i} className="history-card">
            <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '13px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div className="skeleton" style={{ width: '50%', height: '13px' }} />
              <div className="skeleton" style={{ width: '70%', height: '11px' }} />
              <div className="skeleton" style={{ width: '60%', height: '10px' }} />
            </div>
            <div className="skeleton" style={{ width: '55px', height: '14px' }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (!customer) return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/customers')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Customer</h2>
      </div>
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--gray-400)' }}>Customer not found</div>
    </div>
  )

  return (
    <div className="screen page-enter">
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/customers')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Customer Detail</h2>
      </div>

      <div className="cust-detail-hero">
        <div className="cust-big-avatar">{getInitials(customer.name)}</div>
        <h2>{customer.name}</h2>
        <p>Customer since {new Date(customer.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}</p>

        <div className="cust-stats-row">
          <div className="cust-stat"><div className="cv">Rs {totalSpent.toLocaleString()}</div><div className="cl">Total Spent</div></div>
          <div className="cust-stat-divider" />
          <div className="cust-stat"><div className="cv">{sales.length}</div><div className="cl">Transactions</div></div>
          <div className="cust-stat-divider" />
          <div className="cust-stat"><div className="cv">{billCount}</div><div className="cl">Bills</div></div>
        </div>

        {totalDiscount > 0 && (
          <div className="discount-badge">Rs {totalDiscount.toLocaleString()} total discounts given</div>
        )}
      </div>

      <div className="history-list">
        <div className="history-title">Transaction History</div>

        {sales.length === 0 && (
          <div className="empty-state-card">
            <IconReceipt size={36} color="#DCD3BC" />
            <p>No transactions yet</p>
          </div>
        )}

        {sales.map((sale, i) => (
          <div key={sale.id} className="history-card"
            style={{ animation: 'slideUp 0.3s ease forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}>
            <div className={`hist-icon ${sale.type}`}>
              {sale.type === 'bill' ? <IconReceipt size={18} color="#0F1D2E" /> : <IconBolt size={18} color="#A67F3D" />}
            </div>
            <div className="hist-info">
              <div className="hist-type">{sale.type === 'bill' ? 'Bill Generated' : 'Quick Sale'}</div>
              <div className="hist-date">{formatDate(sale.date)}</div>
              <div className="hist-items">{sale.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
              {sale.discount > 0 && <div className="hist-discount">Discount: Rs {sale.discount.toLocaleString()}</div>}
            </div>
            <div className="hist-amount">Rs {sale.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerDetail