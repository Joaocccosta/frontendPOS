import { Minus, Plus, X } from 'lucide-react'
import { formatPrice } from '../utils/currency'

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const subtotal = item.unitPrice * item.quantity

  return (
    <li className="flex items-center justify-between gap-2 border-b border-gray-200 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-800">
          {item.name} x{item.quantity}
        </p>
        <p className="text-sm text-gray-500">{formatPrice(subtotal)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onDecrement(item.productId)}
          className="rounded-full bg-gray-200 p-2 active:scale-95"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onIncrement(item.productId)}
          className="rounded-full bg-gray-200 p-2 active:scale-95"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="ml-1 rounded-full bg-red-100 p-2 text-red-600 active:scale-95"
        >
          <X size={16} />
        </button>
      </div>
    </li>
  )
}

export default CartItem
