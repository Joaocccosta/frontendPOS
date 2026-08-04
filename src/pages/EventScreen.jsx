import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react'
import { api } from '../api/client'
import CategorySidebar from '../components/CategorySidebar'
import ProductGrid from '../components/ProductGrid'
import CartPanel from '../components/CartPanel'
import ConfirmOrderModal from '../components/ConfirmOrderModal'
import ConfirmDialog from '../components/ConfirmDialog'
import OtherItemModal from '../components/OtherItemModal'
import ScreenControls from '../components/ScreenControls'
import MesasListView, { displayTableName } from '../components/MesasListView'
import TableFormModal from '../components/TableFormModal'

const POLL_INTERVAL_MS = 5000

async function deleteProductSilently(productId) {
  try {
    await api.delete(`/products/${productId}`)
  } catch {
    // best-effort cleanup of a throwaway "Outro" product; safe to ignore failures
  }
}

function EventScreen() {
  const navigate = useNavigate()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [cart, setCart] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [error, setError] = useState(null)

  const [mode, setMode] = useState('caixa')
  const [tables, setTables] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [showTableForm, setShowTableForm] = useState(false)

  const isTableMode = mode === 'mesas' && selectedTableId != null
  const selectedTable = isTableMode ? tables.find((t) => t.id === selectedTableId) : null
  const activeItems = isTableMode
    ? (selectedTable?.items ?? []).map((item) => ({
        productId: item.productId,
        name: item.nameSnapshot,
        unitPrice: item.priceSnapshot,
        quantity: item.quantity,
        cartItemId: item.id,
        isCustom: item.nameSnapshot === 'Outro',
        isKitchen: item.isKitchen,
        isBar: item.isBar,
      }))
    : cart

  // Poll the mesas list while it's on screen, so a table closed/created on another
  // device disappears/appears here without needing to navigate away and back.
  useEffect(() => {
    if (mode !== 'mesas' || selectedTableId != null) return
    loadTables()
    const interval = setInterval(loadTables, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [mode, selectedTableId])

  // Poll the currently open table too, so items added from another device show up here.
  useEffect(() => {
    if (selectedTableId == null) return
    refreshTable(selectedTableId)
    const interval = setInterval(() => refreshTable(selectedTableId), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [selectedTableId])

  async function loadTables() {
    try {
      const data = await api.get('/carts')
      setTables(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function refreshTable(id) {
    try {
      const cart = await api.get(`/carts/${id}`)
      setTables((prev) => {
        const exists = prev.some((t) => t.id === id)
        return exists ? prev.map((t) => (t.id === id ? cart : t)) : [...prev, cart]
      })
    } catch (err) {
      setError(err.message)
    }
  }

  function applyCartUpdate(updated) {
    setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  function handleShowMesasList() {
    setMode('mesas')
    setSelectedTableId(null)
  }

  function handleBackToMesasList() {
    setSelectedTableId(null)
  }

  async function handleAddToCart(product) {
    if (isTableMode) {
      const existing = activeItems.find((item) => item.productId === product.id)
      try {
        const updated = existing
          ? await api.put(`/carts/${selectedTable.id}/items/${existing.cartItemId}`, {
              productId: product.id,
              quantity: existing.quantity + 1,
            })
          : await api.post(`/carts/${selectedTable.id}/items`, { productId: product.id, quantity: 1 })
        applyCartUpdate(updated)
      } catch (err) {
        setError(err.message)
      }
      return
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          isKitchen: product.station === 'KITCHEN',
          isBar: product.station === 'BAR',
        },
      ]
    })
  }

  async function handleAddOther(value) {
    const created = await api.post('/products', {
      categoryId: selectedCategoryId,
      name: 'Outro',
      price: value,
      sortOrder: 0,
    })
    if (isTableMode) {
      try {
        const updated = await api.post(`/carts/${selectedTable.id}/items`, { productId: created.id, quantity: 1 })
        applyCartUpdate(updated)
      } catch (err) {
        setError(err.message)
      }
    } else {
      setCart((prev) => [
        ...prev,
        { productId: created.id, name: 'Outro', unitPrice: value, quantity: 1, isCustom: true, isKitchen: false, isBar: false },
      ])
    }
    try {
      await api.patch(`/products/${created.id}/deactivate`)
    } catch {
      // best-effort hide; not critical since this product is a one-off throwaway
    }
    setShowOther(false)
  }

  async function handleIncrement(productId) {
    if (isTableMode) {
      const item = activeItems.find((i) => i.productId === productId)
      if (!item) return
      try {
        const updated = await api.put(`/carts/${selectedTable.id}/items/${item.cartItemId}`, {
          productId,
          quantity: item.quantity + 1,
        })
        applyCartUpdate(updated)
      } catch (err) {
        setError(err.message)
      }
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)),
    )
  }

  async function handleDecrement(productId) {
    if (isTableMode) {
      const item = activeItems.find((i) => i.productId === productId)
      if (!item) return
      try {
        let updated
        if (item.quantity <= 1) {
          updated = await api.delete(`/carts/${selectedTable.id}/items/${item.cartItemId}`)
          if (item.isCustom) deleteProductSilently(item.productId)
        } else {
          updated = await api.put(`/carts/${selectedTable.id}/items/${item.cartItemId}`, {
            productId,
            quantity: item.quantity - 1,
          })
        }
        applyCartUpdate(updated)
      } catch (err) {
        setError(err.message)
      }
      return
    }
    const target = cart.find((item) => item.productId === productId)
    if (target?.isCustom && target.quantity <= 1) deleteProductSilently(target.productId)
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  async function handleRemove(productId) {
    if (isTableMode) {
      const item = activeItems.find((i) => i.productId === productId)
      if (!item) return
      try {
        const updated = await api.delete(`/carts/${selectedTable.id}/items/${item.cartItemId}`)
        if (item.isCustom) deleteProductSilently(item.productId)
        applyCartUpdate(updated)
      } catch (err) {
        setError(err.message)
      }
      return
    }
    const target = cart.find((item) => item.productId === productId)
    if (target?.isCustom) deleteProductSilently(target.productId)
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  function handleClear() {
    if (activeItems.length === 0) return
    setConfirmAction({
      title: 'Limpar carrinho',
      message: 'Tem a certeza que quer limpar o carrinho?',
      danger: true,
      onConfirm: async () => {
        setConfirmAction(null)
        if (isTableMode) {
          try {
            let updated = selectedTable
            for (const item of activeItems) {
              updated = await api.delete(`/carts/${selectedTable.id}/items/${item.cartItemId}`)
              if (item.isCustom) deleteProductSilently(item.productId)
            }
            applyCartUpdate(updated)
          } catch (err) {
            setError(err.message)
          }
          return
        }
        activeItems.filter((item) => item.isCustom).forEach((item) => deleteProductSilently(item.productId))
        setCart([])
      },
    })
  }

  async function handleConfirmOrder({ paymentMethod, amountReceived, table, name }) {
    const customItems = activeItems.filter((item) => item.isCustom)
    for (const item of customItems) {
      await api.patch(`/products/${item.productId}/activate`)
    }
    await api.post('/orders', {
      items: activeItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod,
      amountReceived: paymentMethod === 'CASH' ? amountReceived : undefined,
      table: isTableMode ? selectedTable?.table : table,
      name: isTableMode ? selectedTable?.name : name,
    })
    customItems.forEach((item) => deleteProductSilently(item.productId))
    if (isTableMode) {
      await api.delete(`/carts/${selectedTable.id}`)
      setTables((prev) => prev.filter((t) => t.id !== selectedTableId))
      setSelectedTableId(null)
    } else {
      setCart([])
    }
    setShowConfirm(false)
  }

  async function handleCreateTable({ table, name }) {
    try {
      const cart = await api.post('/carts', { table, name })
      setTables((prev) => [...prev, cart])
      setSelectedTableId(cart.id)
      setShowTableForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleDeleteTable() {
    if (activeItems.length > 0) return
    setConfirmAction({
      title: 'Eliminar mesa',
      message: 'Tem a certeza que quer eliminar esta mesa?',
      danger: true,
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          await api.delete(`/carts/${selectedTableId}`)
          setTables((prev) => prev.filter((t) => t.id !== selectedTableId))
          setSelectedTableId(null)
        } catch (err) {
          setError(err.message)
        }
      },
    })
  }

  const total = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-gray-100">
      <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('caixa')
              setSelectedTableId(null)
            }}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition ${
              mode === 'caixa' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingCart size={18} /> Caixa
          </button>
          <button
            type="button"
            onClick={handleShowMesasList}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition ${
              mode === 'mesas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <UtensilsCrossed size={18} /> Mesas
          </button>
        </div>
        {isTableMode && (
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">
                {selectedTable ? displayTableName(selectedTable.table) : ''}
              </span>
              {selectedTable?.name && <span className="text-lg font-medium text-gray-600">{selectedTable.name}</span>}
            </div>
            <button
              type="button"
              onClick={handleDeleteTable}
              disabled={activeItems.length > 0}
              title={
                activeItems.length > 0
                  ? 'Esvazia o carrinho da mesa antes de a eliminar'
                  : 'Eliminar esta mesa'
              }
              aria-label="Eliminar mesa"
              className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-600">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-medium">
            Fechar
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {mode === 'mesas' && !selectedTableId ? (
          <div className="relative flex flex-1">
            <MesasListView
              tables={tables}
              onSelectTable={setSelectedTableId}
              onCreateTable={() => setShowTableForm(true)}
            />
            <ScreenControls onBack={() => setMode('caixa')} backLabel="Voltar à venda" floating />
          </div>
        ) : (
          <>
            <CategorySidebar
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onBack={isTableMode ? handleBackToMesasList : () => navigate('/')}
              backLabel={isTableMode ? 'Voltar às mesas' : 'Voltar ao início'}
            />
            <ProductGrid
              categoryId={selectedCategoryId}
              onAddToCart={handleAddToCart}
              onOpenOther={() => setShowOther(true)}
            />
            <CartPanel
              items={activeItems}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              onClear={handleClear}
              onCheckout={() => setShowConfirm(true)}
              checkoutLabel={isTableMode ? 'Fechar Conta' : 'Finalizar Compra'}
            />
          </>
        )}
      </div>

      {showConfirm && (
        <ConfirmOrderModal
          total={total}
          showTableFields={!isTableMode}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
      {showOther && <OtherItemModal onCancel={() => setShowOther(false)} onConfirm={handleAddOther} />}
      {showTableForm && (
        <TableFormModal
          existingTables={tables.map((t) => t.table)}
          onCancel={() => setShowTableForm(false)}
          onConfirm={handleCreateTable}
        />
      )}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          danger={confirmAction.danger}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  )
}

export default EventScreen
