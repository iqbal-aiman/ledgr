import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getItems, addItem, addOrGetCustomer, addSale } from '../database'
import './GenerateBill.css'

function SuccessCheck({ message }) {
  return (
    <div className="success-overlay">
      <div className="success-box">
        <svg className="check-svg" width="80" height="80" viewBox="0 0 80 80">
          <circle className="check-circle" cx="40" cy="40" r="36" fill="none"
            stroke="#0F1D2E" strokeWidth="3" strokeDasharray="226" strokeDashoffset="226" />
          <polyline className="check-mark" points="24,40 34,52 56,28" fill="none"
            stroke="#C9A15A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="50" strokeDashoffset="50" />
        </svg>
        <p className="success-text">{message}</p>
        <span className="success-sub">Redirecting to dashboard...</span>
      </div>
    </div>
  )
}

function AddSale() {
  const navigate = useNavigate()
  const [customerName, setCustomerName]   = useState('')
  const [items, setItems]                 = useState([])
  const [billItems, setBillItems]         = useState([])
  const [discount, setDiscount]           = useState('')
  const [success, setSuccess]             = useState(false)
  const [loading, setLoading]             = useState(false)
  const [showAddItem, setShowAddItem]     = useState(false)
  const [newItemName, setNewItemName]     = useState('')
  const [newItemPrice, setNewItemPrice]   = useState('')
  const [newItemStock, setNewItemStock]   = useState('')

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    const data = await getItems()
    setItems(data)
  }

  const handleAddNewItem = async () => {
    if (!newItemName.trim() || !newItemPrice) { alert('Enter item name and price'); return }
    const item = await addItem(newItemName.trim(), newItemPrice, newItemStock || 0)
    setItems(prev => [...prev, item])
    setNewItemName(''); setNewItemPrice(''); setNewItemStock(''); setShowAddItem(false)
  }

  const handleSelectItem = (e) => {
    const itemId = parseInt(e.target.value)
    if (!itemId) return
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const existing = billItems.find(b => b.id === itemId)
    if (existing) {
      setBillItems(billItems.map(b => b.id === itemId ? { ...b, qty: b.qty + 1 } : b))
    } else {
      setBillItems([...billItems, { ...item, qty: 1 }])
    }
    e.target.value = ''
  }

  const handleQtyChange = (id, qty) => {
    if (qty < 1) return
    setBillItems(billItems.map(b => b.id === id ? { ...b, qty: parseInt(qty) } : b))
  }

  const handleRemove = (id) => setBillItems(prev => prev.filter(b => b.id !== id))

  const getSubtotal = () => billItems.reduce((sum, b) => sum + b.price * b.qty, 0)
  const getDiscount = () => parseFloat(discount) || 0
  const getTotal    = () => Math.max(0, getSubtotal() - getDiscount())

  const handleSave = async () => {
    if (!customerName.trim()) { alert('Please enter customer name'); return }
    if (billItems.length === 0) { alert('Please add at least one item'); return }
    setLoading(true)
    const customer = await addOrGetCustomer(customerName.trim())
    await addSale(customer.id, customer.name, billItems, getSubtotal(), getDiscount(), getTotal(), 'quick')
    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 2200)
  }

  return (
    <div className="screen page-enter">
      {success && <SuccessCheck message="Sale Saved!" />}
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Add Sale</h2>
      </div>

      <div className="screen-body">
        <div className="form-card">
          <div className="card-label">CUSTOMER</div>
          <input className="input-field" placeholder="Type customer name" value={customerName}
            onChange={e => setCustomerName(e.target.value)} />
          <p className="field-hint">New name = new customer added automatically</p>
        </div>

        <div className="form-card">
          <div className="card-label">ITEMS</div>
          <select className="select-field" onChange={handleSelectItem} defaultValue="">
            <option value="">+ Select item to add</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} — Rs {item.price}{item.stock <= 5 ? ' · Low stock' : ''}
              </option>
            ))}
          </select>

          {!showAddItem ? (
            <div className="quick-add-btn pressable" onClick={() => setShowAddItem(true)}>+ Add new item to list</div>
          ) : (
            <div className="quick-add-form">
              <p className="quick-add-title">NEW ITEM</p>
              <input className="input-field" placeholder="Item name" value={newItemName}
                onChange={e => setNewItemName(e.target.value)} style={{ marginBottom: '8px' }} />
              <div className="row-inputs">
                <input className="input-field" placeholder="Price (Rs)" type="number" min="0"
                  value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
                <input className="input-field" placeholder="Stock qty" type="number" min="0"
                  value={newItemStock} onChange={e => setNewItemStock(e.target.value)} />
              </div>
              <div className="row-btns">
                <button className="btn-green" onClick={handleAddNewItem}>Save Item</button>
                <button className="btn-outline" onClick={() => setShowAddItem(false)}>Cancel</button>
              </div>
            </div>
          )}

          {billItems.length > 0 && (
            <div className="items-list">
              <div className="items-header"><span>Item</span><span>Qty</span><span>Price</span><span /></div>
              {billItems.map((item, i) => (
                <div key={item.id} className="item-row"
                  style={{ animation: 'slideUp 0.2s ease forwards', animationDelay: `${i * 30}ms`, opacity: 0 }}>
                  <div className="item-name">{item.name}</div>
                  <input className="item-qty" type="number" value={item.qty} min="1"
                    onChange={e => handleQtyChange(item.id, e.target.value)} />
                  <div className="item-price">Rs {(item.price * item.qty).toLocaleString()}</div>
                  <div className="remove-btn pressable" onClick={() => handleRemove(item.id)}>✕</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {billItems.length > 0 && (
          <div className="form-card">
            <div className="card-label">DISCOUNT (OPTIONAL)</div>
            <input className="input-field" placeholder="Enter discount amount in Rs" type="number" min="0"
              value={discount} onChange={e => setDiscount(e.target.value)} />
          </div>
        )}

        {billItems.length > 0 && (
          <div className="bill-total">
            <div className="total-row"><span>Subtotal</span><span>Rs {getSubtotal().toLocaleString()}</span></div>
            {getDiscount() > 0 && (
              <div className="total-row discount-row"><span>Discount</span><span>− Rs {getDiscount().toLocaleString()}</span></div>
            )}
            <div className="total-divider" />
            <div className="total-row final"><span>Total</span><span>Rs {getTotal().toLocaleString()}</span></div>
          </div>
        )}

        <div className="bill-actions">
          <button className="btn-outline pressable" onClick={() => navigate('/dashboard')}>Cancel</button>
          <button className="btn-green pressable" onClick={handleSave} disabled={loading}>
            {loading ? <span className="btn-loading"><span className="spinner" /> Saving...</span> : '✓ Save Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddSale