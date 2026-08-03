import { formatPrice } from '../utils/currency'

const MAX_CHART_ROWS = 7
const BAR_COLOR = '#059669'

function aggregateProducts(orders) {
  const map = new Map()
  for (const order of orders) {
    for (const item of order.items) {
      const existing = map.get(item.nameSnapshot) ?? { name: item.nameSnapshot, quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.subtotal
      map.set(item.nameSnapshot, existing)
    }
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity)
}

function ProductSummaryPanel({ orders }) {
  const products = aggregateProducts(orders)

  if (products.length === 0) {
    return (
      <div className="w-full shrink-0 rounded-xl bg-white p-6 shadow-sm lg:w-96">
        <h2 className="text-lg font-semibold text-gray-800">Produtos Vendidos</h2>
        <p className="mt-6 text-center text-gray-400">Sem produtos neste intervalo</p>
      </div>
    )
  }

  const chartRows = products.slice(0, MAX_CHART_ROWS)
  const rest = products.slice(MAX_CHART_ROWS)
  const restQuantity = rest.reduce((sum, p) => sum + p.quantity, 0)
  if (restQuantity > 0) {
    chartRows.push({ name: 'Outros', quantity: restQuantity, revenue: rest.reduce((s, p) => s + p.revenue, 0) })
  }
  const maxQuantity = Math.max(...chartRows.map((p) => p.quantity))

  return (
    <div className="w-full shrink-0 rounded-xl bg-white p-6 shadow-sm lg:w-96">
      <h2 className="text-lg font-semibold text-gray-800">Produtos Vendidos</h2>

      {products.length === 1 ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">{products[0].name}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{products[0].quantity}</p>
          <p className="text-sm text-gray-500">unidades vendidas</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {chartRows.map((product) => (
            <div key={product.name} className="flex items-center gap-2">
              <span
                className="w-20 shrink-0 truncate text-right text-xs text-gray-600"
                title={product.name}
              >
                {product.name}
              </span>
              <div className="h-5 flex-1 rounded-sm bg-gray-100">
                <div
                  className="h-5 rounded-r-sm"
                  style={{ width: `${(product.quantity / maxQuantity) * 100}%`, backgroundColor: BAR_COLOR }}
                />
              </div>
              <span className="w-8 shrink-0 text-xs text-gray-700 tabular-nums">{product.quantity}</span>
            </div>
          ))}
        </div>
      )}

      <table className="mt-6 w-full text-sm">
        <caption className="sr-only">Contagem total e receita por produto no intervalo selecionado</caption>
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th scope="col" className="py-2 font-medium">
              Produto
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Qtd
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.name}>
              <td className="py-2 text-gray-800">{product.name}</td>
              <td className="py-2 text-right text-gray-600 tabular-nums">{product.quantity}</td>
              <td className="py-2 text-right font-medium text-emerald-700 tabular-nums">
                {formatPrice(product.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductSummaryPanel
