import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getItems, addItem, updateItem, deleteItem } from '../database'
import { IconAlert, IconSearch, IconEdit, IconTrash } from '../Icons'
import './GenerateBill.css'
import './Customers.css'
import './Inventory.css'

function Inventory() {
  const navigate = useNavigate()
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [newName, setNewName]       = useState('')
  const [newPrice, setNewPrice]     = useState('')
  const [newStock, setNewStock]     = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    setLoading(true)
    const data = await getItems()
    setItems(data)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newName.trim() || !newPrice) { alert('Enter name and price'); return }
    await addItem(newName.trim(), newPrice, newStock || 0)
    resetForm(); loadItems()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setNewName(item.name); setNewPrice(item.price); setNewStock(item.stock)
    setShowAddForm(false)
  }

  const handleUpdate = async () => {
    if (!newName.trim() || !newPrice) { alert('Enter name and price'); return }
    await updateItem(editItem.id, newName.trim(), newPrice, newStock || 0)
    resetForm(); loadItems()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    await deleteItem(id); loadItems()
  }

  const resetForm = () => {
    setShowAddForm(false); setEditItem(null)
    setNewName(''); setNewPrice(''); setNewStock('')
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const lowStockItems = items.filter(i => i.stock <= 5)
  const totalStock    = items.reduce((s, i) => s + i.stock, 0)

  if (loading) return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Inventory</h2>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="inv-stats">
          {[1,2,3].map(i => (
            <div key={i} className="inv-stat">
              <div className="skeleton" style={{ width: '40px', height: '24px', margin: '0 auto 6px' }} />
              <div className="skeleton" style={{ width: '60px', height: '10px', margin: '0 auto' }} />
            </div>
          ))}
        </div>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '14px' }} />)}
      </div>
    </div>
  )

  return (
    <div className="screen page-enter">
      <div className="screen-header">
        <div className="back-btn pressable" onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Inventory</h2>
      </div>

      <div className="screen-body">
        {lowStockItems.length > 0 && (
          <div className="alert-card">
            <IconAlert size={22} color="#A67F3D" />
            <div className="alert-info">
              <div className="alert-title">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low</div>
              <div className="alert-sub">{lowStockItems.map(i => i.name).join(', ')}</div>
            </div>
          </div>
        )}

        <div className="inv-stats">
          <div className="inv-stat"><div className="inv-stat-value green">{items.length}</div><div className="inv-stat-label">Total Items</div></div>
          <div className="inv-stat"><div className="inv-stat-value">{totalStock}</div><div className="inv-stat-label">Total Stock</div></div>
          <div className="inv-stat"><div className={`inv-stat-value ${lowStockItems.length > 0 ? 'red' : 'green'}`}>{lowStockItems.length}</div><div className="inv-stat-label">Low Stock</div></div>
        </div>

        <div className="search-wrap" style={{ marginBottom: '4px' }}>
          <span className="search-icon-svg"><IconSearch size={16} color="#948B76" /></span>
          <input className="search-input" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          {search.length > 0 && <div className="search-clear" onClick={() => setSearch('')}>✕</div>}
        </div>

        {!showAddForm && !editItem && (
          <button className="btn-green pressable" style={{ width: '100%' }} onClick={() => setShowAddForm(true)}>+ Add New Item</button>
        )}

        {showAddForm && (
          <div className="form-card" style={{ animation: 'slideUp 0.2s ease forwards' }}>
            <div className="card-label">NEW ITEM</div>
            <input className="input-field" placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: '8px' }} />
            <div className="row-inputs">
              <input className="input-field" placeholder="Price (Rs)" type="number" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              <input className="input-field" placeholder="Stock qty" type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} />
            </div>
            <div className="row-btns">
              <button className="btn-green pressable" onClick={handleAdd}>Save Item</button>
              <button className="btn-outline pressable" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        )}

        {editItem && (
          <div className="form-card" style={{ animation: 'slideUp 0.2s ease forwards' }}>
            <div className="card-label">EDIT ITEM</div>
            <input className="input-field" placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: '8px' }} />
            <div className="row-inputs">
              <input className="input-field" placeholder="Price (Rs)" type="number" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              <input className="input-field" placeholder="Stock qty" type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} />
            </div>
            <div className="row-btns">
              <button className="btn-green pressable" onClick={handleUpdate}>Update Item</button>
              <button className="btn-outline pressable" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        )}

        <div className="form-card">
          <div className="card-label">ALL ITEMS ({filtered.length})</div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--gray-400)', fontSize: '14px' }}>
              {search ? `No results for "${search}"` : 'No items yet'}
            </div>
          )}
          {filtered.map((item, i) => (
            <div key={item.id} className="inv-item-row"
              style={{ animation: 'slideUp 0.25s ease forwards', animationDelay: `${i * 30}ms`, opacity: 0 }}>
              <div className="inv-item-info">
                <div className="inv-item-name">{item.name}</div>
                <div className="inv-item-price">Rs {item.price}</div>
              </div>
              <div className={`inv-stock-badge ${item.stock <= 5 ? 'low' : ''}`}>
                <span className="inv-stock-num">{item.stock}</span>
                <span className="inv-stock-label">in stock</span>
              </div>
              <div className="inv-actions">
                <button className="inv-action-btn edit pressable" onClick={() => handleEdit(item)}><IconEdit /></button>
                <button className="inv-action-btn delete pressable" onClick={() => handleDelete(item.id)}><IconTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Inventory