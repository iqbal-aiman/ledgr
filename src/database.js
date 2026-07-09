import { Preferences } from '@capacitor/preferences'

// ===== HELPER FUNCTIONS =====
const saveData = async (key, value) => {
  await Preferences.set({ key, value: JSON.stringify(value) })
}

const getData = async (key) => {
  const { value } = await Preferences.get({ key })
  return value ? JSON.parse(value) : null
}

// ===== ITEMS / INVENTORY =====
export const getItems = async () => {
  const items = await getData('ledgr_items')
  return items || []
}

export const addItem = async (name, price, stock = 0) => {
  const items = await getItems()
  const newItem = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    stock: parseInt(stock),
    lowStockAlert: 5
  }
  items.push(newItem)
  await saveData('ledgr_items', items)
  return newItem
}

export const updateItem = async (id, name, price, stock) => {
  const items = await getItems()
  const updated = items.map(i =>
    i.id === id
      ? { ...i, name, price: parseFloat(price), stock: parseInt(stock) }
      : i
  )
  await saveData('ledgr_items', updated)
}

export const deleteItem = async (id) => {
  const items = await getItems()
  await saveData('ledgr_items', items.filter(i => i.id !== id))
}

export const getLowStockItems = async () => {
  const items = await getItems()
  return items.filter(i => i.stock <= i.lowStockAlert)
}

export const deductStock = async (billItems) => {
  const items = await getItems()
  const updated = items.map(item => {
    const billItem = billItems.find(b => b.id === item.id)
    if (billItem) {
      return { ...item, stock: Math.max(0, item.stock - billItem.qty) }
    }
    return item
  })
  await saveData('ledgr_items', updated)
}

export const restockItems = async (purchaseItems) => {
  const items = await getItems()
  const updated = items.map(item => {
    const purchasedItem = purchaseItems.find(p => p.id === item.id)
    if (purchasedItem) {
      return { ...item, stock: item.stock + purchasedItem.qty }
    }
    return item
  })
  await saveData('ledgr_items', updated)
}

// ===== CUSTOMERS =====
export const getCustomers = async () => {
  const customers = await getData('ledgr_customers')
  return customers || []
}

export const addOrGetCustomer = async (name) => {
  const customers = await getCustomers()
  const existing = customers.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) return existing
  const newCustomer = {
    id: Date.now(),
    name,
    createdAt: new Date().toISOString()
  }
  customers.push(newCustomer)
  await saveData('ledgr_customers', customers)
  return newCustomer
}

// ===== SALES =====
export const getSales = async () => {
  const sales = await getData('ledgr_sales')
  return sales || []
}

export const addSale = async (
  customerId, customerName, items, subtotal, discount, total, type
) => {
  const sales = await getSales()
  const newSale = {
    id: Date.now(),
    customerId,
    customerName,
    items,
    subtotal: parseFloat(subtotal),
    discount: parseFloat(discount || 0),
    total: parseFloat(total),
    type,
    date: new Date().toISOString()
  }
  sales.push(newSale)
  await saveData('ledgr_sales', sales)
  if (type === 'bill') {
    await deductStock(items)
  }
  return newSale
}

export const getSalesByCustomer = async (customerId) => {
  const sales = await getSales()
  return sales.filter(s => s.customerId === customerId)
}

// ===== PURCHASES =====
export const getPurchases = async () => {
  const purchases = await getData('ledgr_purchases')
  return purchases || []
}

export const addPurchase = async (supplierName, items, total) => {
  const purchases = await getPurchases()
  const newPurchase = {
    id: Date.now(),
    supplierName,
    items,
    total: parseFloat(total),
    date: new Date().toISOString()
  }
  purchases.push(newPurchase)
  await saveData('ledgr_purchases', purchases)
  await restockItems(items)
  return newPurchase
}

// ===== REPORTS =====
export const getTodaySales = async () => {
  const sales = await getSales()
  const today = new Date().toDateString()
  return sales.filter(s => new Date(s.date).toDateString() === today)
}

export const getWeeklySales = async () => {
  const sales = await getSales()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return sales.filter(s => new Date(s.date) >= weekAgo)
}

export const getMonthlySales = async () => {
  const sales = await getSales()
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  return sales.filter(s => new Date(s.date) >= monthAgo)
}

export const getSalesByDateRange = async (startDate, endDate) => {
  const sales = await getSales()
  return sales.filter(s => {
    const d = new Date(s.date)
    return d >= startDate && d <= endDate
  })
}

// ===== PASSWORD =====
export const checkPassword = async (password) => {
  const stored = await getData('ledgr_password')
  return password === (stored || 'ledgr123')
}

export const changePassword = async (newPassword) => {
  await saveData('ledgr_password', newPassword)
}

// ===== SHOP NAME =====
export const getShopName = async () => {
  const name = await getData('ledgr_shop_name')
  return name || ''
}

export const setShopName = async (name) => {
  await saveData('ledgr_shop_name', name)
}

// ===== BACKUP =====
export const exportBackup = async () => {
  const data = {
    items: await getItems(),
    customers: await getCustomers(),
    sales: await getSales(),
    purchases: await getPurchases(),
    exportedAt: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

export const importBackup = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString)
    if (data.items) await saveData('ledgr_items', data.items)
    if (data.customers) await saveData('ledgr_customers', data.customers)
    if (data.sales) await saveData('ledgr_sales', data.sales)
    if (data.purchases) await saveData('ledgr_purchases', data.purchases)
    return true
  } catch (e) {
    return false
  }
}

export const isFirstTime = async () => {
  const password = await getData('ledgr_password')
  return !password
}