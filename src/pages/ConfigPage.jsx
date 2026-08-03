import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ConfigCategoryList from '../components/ConfigCategoryList'
import ConfigCategoryFormModal from '../components/ConfigCategoryFormModal'
import ConfigProductList from '../components/ConfigProductList'
import ConfigProductFormModal from '../components/ConfigProductFormModal'
import ConfirmDialog from '../components/ConfirmDialog'

function sortBySortOrder(items) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function ConfigPage() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'owner' || profile?.role === 'manager'
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [products, setProducts] = useState([])
  const [categoryModal, setCategoryModal] = useState(null)
  const [productModal, setProductModal] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId != null) loadProducts(selectedCategoryId)
    else setProducts([])
  }, [selectedCategoryId])

  async function loadCategories() {
    try {
      const data = await api.get('/categories?includeInactive=true')
      const sorted = sortBySortOrder(data)
      setCategories(sorted)
      setSelectedCategoryId((current) => current ?? sorted[0]?.id ?? null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function loadProducts(categoryId) {
    try {
      const data = await api.get(`/products?categoryId=${categoryId}&includeInactive=true`)
      setProducts(sortBySortOrder(data))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreateCategory(name) {
    await api.post('/categories', { name, sortOrder: categories.length + 1 })
    await loadCategories()
    setCategoryModal(null)
  }

  async function handleUpdateCategory(category, name) {
    await api.put(`/categories/${category.id}`, { name, sortOrder: category.sortOrder })
    await loadCategories()
    setCategoryModal(null)
  }

  async function handleToggleCategoryActive(category) {
    try {
      await api.patch(`/categories/${category.id}/${category.active ? 'deactivate' : 'activate'}`)
      await loadCategories()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleDeleteCategory(category) {
    setConfirmAction({
      title: 'Eliminar categoria',
      message: `Eliminar a categoria "${category.name}"? Todos os produtos desta categoria serão eliminados permanentemente. Esta ação não pode ser revertida.`,
      danger: true,
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          await api.delete(`/categories/${category.id}`)
          if (selectedCategoryId === category.id) setSelectedCategoryId(null)
          await loadCategories()
        } catch (err) {
          setError(err.message)
        }
      },
    })
  }

  async function handleReorderCategories(reordered) {
    setCategories(reordered)
    try {
      await Promise.all(
        reordered.map((category, index) => {
          const sortOrder = index + 1
          if (sortOrder === category.sortOrder) return null
          return api.put(`/categories/${category.id}`, { name: category.name, sortOrder })
        }),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      await loadCategories()
    }
  }

  async function handleCreateProduct({ name, price, categoryId, image, station }) {
    await api.post('/products', { categoryId, name, price, sortOrder: products.length + 1, image, station })
    await loadProducts(selectedCategoryId)
    setProductModal(null)
  }

  async function handleUpdateProduct(product, { name, price, categoryId, image, station }) {
    await api.put(`/products/${product.id}`, { categoryId, name, price, sortOrder: product.sortOrder, image, station })
    await loadProducts(selectedCategoryId)
    setProductModal(null)
  }

  async function handleToggleProductActive(product) {
    try {
      await api.patch(`/products/${product.id}/${product.active ? 'deactivate' : 'activate'}`)
      await loadProducts(selectedCategoryId)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleDeleteProduct(product) {
    setConfirmAction({
      title: 'Eliminar produto',
      message: `Eliminar o produto "${product.name}"? Esta ação não pode ser revertida.`,
      danger: true,
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          await api.delete(`/products/${product.id}`)
          await loadProducts(selectedCategoryId)
        } catch (err) {
          setError(err.message)
        }
      },
    })
  }

  async function handleReorderProducts(reordered) {
    setProducts(reordered)
    try {
      await Promise.all(
        reordered.map((product, index) => {
          const sortOrder = index + 1
          if (sortOrder === product.sortOrder) return null
          return api.put(`/products/${product.id}`, {
            categoryId: product.categoryId,
            name: product.name,
            price: product.price,
            sortOrder,
            image: product.image,
            station: product.station,
          })
        }),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      await loadProducts(selectedCategoryId)
    }
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-gray-100">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <Link to="/" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Configuração</h1>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-600">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-medium">
            Fechar
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <ConfigCategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onReorder={handleReorderCategories}
          onToggleActive={handleToggleCategoryActive}
          onEdit={(category) => setCategoryModal(category)}
          onCreate={() => setCategoryModal('create')}
          onDelete={handleDeleteCategory}
          canManage={canManage}
        />

        {selectedCategoryId ? (
          <ConfigProductList
            products={products}
            onReorder={handleReorderProducts}
            onToggleActive={handleToggleProductActive}
            onEdit={(product) => setProductModal(product)}
            onCreate={() => setProductModal('create')}
            onDelete={handleDeleteProduct}
            canManage={canManage}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Cria uma categoria para começar
          </div>
        )}
      </div>

      {categoryModal && (
        <ConfigCategoryFormModal
          initialName={categoryModal === 'create' ? '' : categoryModal.name}
          onCancel={() => setCategoryModal(null)}
          onSubmit={(name) =>
            categoryModal === 'create' ? handleCreateCategory(name) : handleUpdateCategory(categoryModal, name)
          }
        />
      )}

      {productModal && (
        <ConfigProductFormModal
          product={productModal === 'create' ? null : productModal}
          categories={categories}
          defaultCategoryId={selectedCategoryId}
          onCancel={() => setProductModal(null)}
          onSubmit={(values) =>
            productModal === 'create' ? handleCreateProduct(values) : handleUpdateProduct(productModal, values)
          }
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

export default ConfigPage
