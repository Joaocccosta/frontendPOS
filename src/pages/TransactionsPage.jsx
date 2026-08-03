import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../api/client'
import { formatPrice } from '../utils/currency'
import ProductSummaryPanel from '../components/ProductSummaryPanel'

function pad(n) {
  return String(n).padStart(2, '0')
}

function toLocalInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function startOfTodayLocal() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return toLocalInputValue(date)
}

function nowLocal() {
  return toLocalInputValue(new Date())
}

function TransactionsPage() {
  const [from, setFrom] = useState(startOfTodayLocal())
  const [to, setTo] = useState(nowLocal())
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders(startOfTodayLocal(), nowLocal())
  }, [])

  async function loadOrders(fromValue, toValue) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        from: new Date(fromValue).toISOString(),
        to: new Date(toValue).toISOString(),
      })
      const data = await api.get(`/orders?${params}`)
      setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFilter(e) {
    e.preventDefault()
    loadOrders(from, to)
  }

  const total = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-gray-100">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <Link to="/" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Transações</h1>
      </header>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-white px-6 py-4"
      >
        <div>
          <label htmlFor="from-date" className="block text-sm font-medium text-gray-600">
            De
          </label>
          <input
            id="from-date"
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="to-date" className="block text-sm font-medium text-gray-600">
            Até
          </label>
          <input
            id="to-date"
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white active:scale-95"
        >
          Filtrar
        </button>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500">Total recebido</p>
          <p className="text-2xl font-bold text-emerald-700">{formatPrice(total)}</p>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && <p className="text-center text-gray-400">A carregar…</p>}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-400">Sem vendas neste intervalo</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col items-start gap-6 lg:flex-row">
            <ul className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(300px,380px))] items-start gap-4">
              {orders.map((order) => (
                <li key={order.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      Venda #{order.id} — {new Date(order.createdAt).toLocaleString('pt-PT')}
                    </span>
                    <span className="text-lg font-semibold text-emerald-700">{formatPrice(order.total)}</span>
                  </div>
                  <ul className="mt-2 divide-y divide-gray-100 text-sm text-gray-600">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between py-1">
                        <span>
                          {item.nameSnapshot} x{item.quantity}
                        </span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <ProductSummaryPanel orders={orders} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage
