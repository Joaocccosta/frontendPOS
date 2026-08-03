import { Package } from 'lucide-react'
import { formatPrice } from '../utils/currency'

function ProductCard({ product, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md active:scale-95"
    >
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="text-gray-400" size={36} />
        )}
      </div>
      <span className="line-clamp-2 text-center text-sm font-medium text-gray-800">{product.name}</span>
      <span className="text-sm font-semibold text-emerald-700">{formatPrice(product.price)}</span>
    </button>
  )
}

export default ProductCard
