import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodaySales, getWeeklySales, getMonthlySales, getPurchases } from '../database'
import { IconReceipt, IconBolt, IconChevronLeft } from '../Icons'
import './Reports.css'

function Reports() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('daily')
  const [sales, setSales] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    setLoading(true)
    let s = []
    if (tab === 'daily') s = await getTodaySales()
    if (tab === 'weekly') s = await getWeeklySales()
    if (tab === 'monthly') s = await getMonthlySales()
    const p = await getPurchases()
    setSales(s); setPurchases(p)
    setLoading(false)
  }

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0)
  const totalDiscount = sales.reduce((sum, s) => sum + (s.discount || 0), 0)
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0)
  const billCount = sales.filter(s => s.type === 'bill').length
  const quickCount = sales.filter(s => s.type === 'quick').length

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const getBarData = () => {
    if (tab === 'daily') {
      const slots = [
        { label: '12am', start: 0, end: 4 }, { label: '4am', start: 4, end: 8 },
        { label: '8am', start: 8, end: 12 }, { label: '12pm', start: 12, end: 16 },
        { label: '4pm', start: 16, end: 20 }, { label: '8pm', start: 20, end: 24 },
      ]
      return slots.map(slot => {
        const slotSales = sales.filter(s => {
          const h = new Date(s.date).getHours()
          return h >= slot.start && h < slot.end
        })
        return { label: slot.label, total: slotSales.reduce((sum, s) => sum + s.total, 0) }
      })
    }
    if (tab === 'weekly') {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString('en-PK', { weekday: 'short' })
        const dateStr = d.toDateString()
        const daySales = sales.filter(s => new Date(s.date).toDateString() === dateStr)
        days.push({ label, total: daySales.reduce((sum, s) => sum + s.total, 0) })
      }
      return days
    }
    if (tab === 'monthly') {
      const weeks = [
        { label: 'Wk 1', start: 28, end: 21 }, { label: 'Wk 2', start: 21, end: 14 },
        { label: 'Wk 3', start: 14, end: 7 }, { label: 'Wk 4', start: 7, end: 0 },
      ]
      return weeks.map(week => {
        const startDate = new Date(); startDate.setDate(startDate.getDate() - week.start)
        const endDate = new Date(); endDate.setDate(endDate.getDate() - week.end)
        const weekSales = sales.filter(s => {
          const d = new Date(s.date)
          return d >= startDate && d <= endDate
        })
        return { label: week.label, total: weekSales.reduce((sum, s) => sum + s.total, 0) }
      })
    }
    return []
  }

  const barData = getBarData()
  const maxBar = Math.max(...barData.map(d => d.total), 1)

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/dashboard')}><IconChevronLeft /></div>
        <h2>Reports</h2>
      </div>

      <div className="tab-bar">
        <div className={`tab ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>Daily</div>
        <div className={`tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>Weekly</div>
        <div className={`tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly</div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
      ) : (
        <div className="screen-body">
          <div className="summary-card">
            <div className="s-label">{tab === 'daily' ? "Today's" : tab === 'weekly' ? "This Week's" : "This Month's"} Revenue</div>
            <div className="s-value">Rs {totalSales.toLocaleString()}</div>
            <div className="s-sub">{sales.length} total transactions</div>
          </div>

          <div className="s-row">
            <div className="s-mini"><div className="s-mini-label">Bills</div><div className="s-mini-value green">{billCount}</div></div>
            <div className="s-mini"><div className="s-mini-label">Quick Sales</div><div className="s-mini-value">{quickCount}</div></div>
            <div className="s-mini"><div className="s-mini-label">Discounts</div><div className="s-mini-value red">Rs {totalDiscount.toLocaleString()}</div></div>
            <div className="s-mini"><div className="s-mini-label">Net</div><div className="s-mini-value green">Rs {(totalSales - totalPurchases).toLocaleString()}</div></div>
          </div>

          <div className="chart-card">
            <div className="chart-title">
              {tab === 'daily' ? 'Sales by Time of Day' : tab === 'weekly' ? 'Sales — Last 7 Days' : 'Sales — Last 4 Weeks'}
            </div>
            <div className="bar-chart">
              {barData.map((d, i) => (
                <div key={i} className="bar-col">
                  <div className="bar-amount">{d.total > 0 ? (d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : `${d.total}`) : ''}</div>
                  <div className={`bar ${d.total > 0 ? 'active' : ''}`} style={{ height: `${Math.max((d.total / maxBar) * 80, 4)}px` }} />
                  <div className="bar-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {totalPurchases > 0 && (
            <div className="purchases-card">
              <div className="pc-left"><div className="pc-label">Total Purchases</div><div className="pc-value">Rs {totalPurchases.toLocaleString()}</div></div>
              <div className="pc-right"><div className="pc-label">Profit</div><div className="pc-value green">Rs {(totalSales - totalPurchases).toLocaleString()}</div></div>
            </div>
          )}

          <div className="form-card">
            <h3>TRANSACTIONS</h3>
            {sales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)' }}>No transactions for this period</div>
            ) : (
              sales.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map(sale => (
                <div key={sale.id} className="txn-item">
                  <div className="txn-icon">{sale.type === 'bill' ? <IconReceipt size={18} color="#0F1D2E" /> : <IconBolt size={18} color="#A67F3D" />}</div>
                  <div className="txn-info">
                    <div className="txn-name">{sale.customerName}</div>
                    <div className="txn-date">{formatDate(sale.date)}</div>
                    {sale.discount > 0 && <div className="txn-discount">Discount: Rs {sale.discount}</div>}
                  </div>
                  <div className="txn-amount">Rs {sale.total.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports