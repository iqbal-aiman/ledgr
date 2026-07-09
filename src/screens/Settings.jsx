import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getItems, addItem, deleteItem,
  changePassword, exportBackup, importBackup,
  checkPassword, getShopName, setShopName
} from '../database'
import { IconDownload, IconUpload, IconLock, IconTrash } from '../Icons'
import './GenerateBill.css'
import './Settings.css'

function Settings({ onLogout }) {
  const navigate = useNavigate()
  const [items, setItems]               = useState([])
  const [newItemName, setNewItemName]   = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemStock, setNewItemStock] = useState('')
  const [oldPassword, setOldPassword]   = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [showOld, setShowOld]           = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [passwordMsg, setPasswordMsg]   = useState('')
  const [shopName, setShopNameState]    = useState('')
  const [shopMsg, setShopMsg]           = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const i = await getItems()
    const s = await getShopName()
    setItems(i); setShopNameState(s)
    setLoading(false)
  }

  const handleSaveShopName = async () => {
    if (!shopName.trim()) { setShopMsg('Enter shop name'); return }
    await setShopName(shopName.trim())
    setShopMsg('Saved!')
    setTimeout(() => setShopMsg(''), 2000)
  }

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemPrice) { alert('Enter item name and price'); return }
    const item = await addItem(newItemName.trim(), newItemPrice, newItemStock || 0)
    setItems(prev => [...prev, item])
    setNewItemName(''); setNewItemPrice(''); setNewItemStock('')
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return
    await deleteItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) { setPasswordMsg('Enter your current password'); return }
    const correct = await checkPassword(oldPassword)
    if (!correct) { setPasswordMsg('Current password is incorrect'); return }
    if (newPassword.length < 6) { setPasswordMsg('New password must be at least 6 characters'); return }
    await changePassword(newPassword)
    setPasswordMsg('Password changed successfully!')
    setOldPassword(''); setNewPassword('')
    setTimeout(() => setPasswordMsg(''), 3000)
  }

  const handleExport = async () => {
    const data = await exportBackup()
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `ledgr-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const success = await importBackup(ev.target.result)
      if (success) { alert('Backup restored successfully!'); loadData() }
      else { alert('Invalid backup file. Please check the file and try again.') }
    }
    reader.readAsText(file)
  }

  const EyeIcon = ({ crossed }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#948B76" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      {crossed ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20 C7 20 2.73 16.39 1 12 a10.07 10.07 0 0 1 2.06-3.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4 c5 0 9.27 3.61 11 8 a10.12 10.12 0 0 1-1.17 2.06" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )

  if (loading) return (
    <div className="screen">
      <div className="screen-header">
        <div className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <h2>Settings</h2>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '18px' }} />)}
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
        <h2>Settings</h2>
      </div>

      <div className="screen-body">
        <div className="form-card">
          <div className="card-label">SHOP NAME</div>
          <input className="input-field" placeholder="Enter your shop name" value={shopName}
            onChange={e => setShopNameState(e.target.value)} style={{ marginBottom: '10px' }} />
          {shopMsg && <p className="settings-msg success">{shopMsg}</p>}
          <button className="btn-green pressable" onClick={handleSaveShopName}>Save Shop Name</button>
        </div>

        <div className="form-card">
          <div className="card-label">MANAGE ITEMS</div>
          <div className="add-item-row">
            <input className="input-field" placeholder="Item name" value={newItemName}
              onChange={e => setNewItemName(e.target.value)} style={{ flex: 2 }} />
            <input className="input-field" placeholder="Price" type="number" min="0" value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value)} style={{ flex: 1 }} />
            <input className="input-field" placeholder="Stock" type="number" min="0" value={newItemStock}
              onChange={e => setNewItemStock(e.target.value)} style={{ flex: 1 }} />
            <button className="btn-green-sm pressable" onClick={handleAddItem}>Add</button>
          </div>

          <div className="settings-items-list">
            {items.length === 0 && <p className="field-hint" style={{ padding: '12px 0' }}>No items yet. Add your shop items above.</p>}
            {items.map((item, i) => (
              <div key={item.id} className="settings-item-row"
                style={{ animation: 'slideUp 0.25s ease forwards', animationDelay: `${i * 30}ms`, opacity: 0 }}>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">
                    <span className="item-price-tag">Rs {item.price}</span>
                    <span className="item-dot">·</span>
                    <span className={`item-stock-tag ${item.stock <= 5 ? 'low' : ''}`}>{item.stock} in stock</span>
                  </div>
                </div>
                <button className="inv-action-btn delete pressable" onClick={() => handleDeleteItem(item.id)}><IconTrash /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card">
          <div className="card-label">CHANGE PASSWORD</div>
          <div className="password-wrap" style={{ marginBottom: '10px' }}>
            <input type={showOld ? 'text' : 'password'} className="input-field" placeholder="Current password"
              value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ paddingRight: '48px' }} />
            <button className="eye-btn" onClick={() => setShowOld(!showOld)} tabIndex={-1} type="button"><EyeIcon crossed={showOld} /></button>
          </div>
          <div className="password-wrap" style={{ marginBottom: '10px' }}>
            <input type={showNew ? 'text' : 'password'} className="input-field" placeholder="New password (min 6 characters)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ paddingRight: '48px' }} />
            <button className="eye-btn" onClick={() => setShowNew(!showNew)} tabIndex={-1} type="button"><EyeIcon crossed={showNew} /></button>
          </div>
          {passwordMsg && (
            <p className={`settings-msg ${passwordMsg.includes('success') ? 'success' : 'error'}`}>{passwordMsg}</p>
          )}
          <button className="btn-green pressable" onClick={handleChangePassword}>Update Password</button>
        </div>

        <div className="form-card">
          <div className="card-label">BACKUP & RESTORE</div>
          <p className="field-hint" style={{ marginBottom: '14px' }}>Export all your data as a JSON file to keep it safe. Import it anytime to restore your data.</p>
          <button className="btn-green pressable" onClick={handleExport} style={{ marginBottom: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconDownload size={16} /> Export Backup</span>
          </button>
          <label className="btn-import pressable">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconUpload size={16} /> Import Backup</span>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>

        <button className="btn-logout pressable" onClick={onLogout}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconLock size={16} /> Lock App</span>
        </button>

        <p className="app-version">Ledgr v1.0 · Offline & Secure</p>
      </div>
    </div>
  )
}

export default Settings