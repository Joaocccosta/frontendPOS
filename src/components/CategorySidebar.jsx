import { useEffect, useState } from 'react'
import { api } from '../api/client'
import ScreenControls from './ScreenControls'

function CategorySidebar({ selectedCategoryId, onSelectCategory, onBack, backLabel }) {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .get('/categories?includeInactive=false')
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder)
        setCategories(sorted)
        if (sorted.length > 0) onSelectCategory(sorted[0].id)
      })
      .catch((err) => setError(err.message))
  }, [onSelectCategory])

  return (
    <nav className="flex w-40 shrink-0 flex-col bg-gray-900">
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {error && <div className="p-2 text-sm text-red-400">{error}</div>}
        {!error &&
          categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`w-full rounded-xl px-3 py-4 text-left text-base font-semibold transition ${
                category.id === selectedCategoryId
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
      </div>
      <ScreenControls onBack={onBack} backLabel={backLabel} />
    </nav>
  )
}

export default CategorySidebar
