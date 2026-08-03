import { formatPrice } from '../utils/currency'
import CartItem from './CartItem'

function CartPanel({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
  title = 'Carrinho',
  checkoutLabel = 'Finalizar Compra',
}) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
      <h2 className="border-b border-gray-200 p-4 text-lg font-semibold text-gray-800">{title}</h2>
      <ul className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <li className="py-8 text-center text-gray-400">Carrinho vazio</li>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onRemove={onRemove}
            />
          ))
        )}
      </ul>
      <div className="border-t border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between text-2xl font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={items.length === 0}
            className="rounded-xl bg-gray-200 py-4 text-lg font-medium text-gray-700 disabled:opacity-40"
          >
            Limpar Carrinho
          </button>
          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0}
            className="rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white disabled:opacity-40"
          >
            {checkoutLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPanel
