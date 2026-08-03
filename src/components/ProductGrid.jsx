import { useEffect, useState } from 'react'
import { Calculator } from 'lucide-react'
import { api } from '../api/client'
import ProductCard from './ProductCard'

function ProductGrid({ categoryId, onAddToCart, onOpenOther }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categoryId) return
    setLoading(true)
    setError(null)
    api
      .get(`/products?categoryId=${categoryId}&includeInactive=false`)
      .then((data) => setProducts([...data].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [categoryId])

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={onOpenOther}
          disabled={!categoryId}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 font-medium text-white active:scale-95 disabled:opacity-40"
        >
          <Calculator size={18} /> Outro
        </button>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center text-gray-400">A carregar produtos…</div>
      )}

      {!loading && error && <div className="flex flex-1 items-center justify-center text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,200px))] gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={onAddToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductGrid
