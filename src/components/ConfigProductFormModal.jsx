import { useState } from 'react'
import { Package, X } from 'lucide-react'
import { resizeImageToBlob } from '../utils/image'
import { api } from '../api/client'

function ConfigProductFormModal({ product, categories, defaultCategoryId, onCancel, onSubmit }) {
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(String(product?.categoryId ?? defaultCategoryId ?? ''))
  const [image, setImage] = useState(product?.image ?? null)
  const [station, setStation] = useState(product?.station ?? 'NONE')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const parsedPrice = Number(price)
  const isValid = name.trim() && price !== '' && !Number.isNaN(parsedPrice) && parsedPrice >= 0 && categoryId

  async function uploadImage(file) {
    setUploading(true)
    setError(null)
    try {
      const blob = await resizeImageToBlob(file)
      setImage(URL.createObjectURL(blob)) // instant local preview while the upload is in flight
      const formData = new FormData()
      formData.append('file', blob, 'product.jpg')
      const { url } = await api.upload('/v1/uploads/product-image', formData)
      setImage(url)
    } catch (err) {
      setError(err.message)
      setImage(product?.image ?? null)
    } finally {
      setUploading(false)
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadImage(file)
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        await uploadImage(file)
        break
      }
    }
  }

  // Products created before image uploads existed still have a base64 data
  // URI in `image` (untouched edits just resubmit it as-is). Catch that here
  // so every save migrates it to Supabase Storage instead of persisting it.
  async function ensureImageIsUploaded() {
    if (!image || !image.startsWith('data:')) return image
    const blob = await (await fetch(image)).blob()
    const formData = new FormData()
    formData.append('file', blob, 'product.jpg')
    const { url } = await api.upload('/v1/uploads/product-image', formData)
    return url
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid || uploading) return
    setSubmitting(true)
    setError(null)
    try {
      const finalImage = await ensureImageIsUploaded()
      await onSubmit({ name: name.trim(), price: parsedPrice, categoryId: Number(categoryId), image: finalImage, station })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} onPaste={handlePaste} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">{product ? 'Editar Produto' : 'Novo Produto'}</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="text-gray-400" size={32} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-lg bg-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
              {uploading ? 'A carregar…' : 'Escolher imagem'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400">ou cola uma imagem (Ctrl+V)</p>
            {image && !uploading && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="flex items-center gap-1 text-sm text-red-600"
              >
                <X size={14} /> Remover imagem
              </button>
            )}
          </div>
        </div>

        <label htmlFor="product-name" className="mt-4 block text-sm font-medium text-gray-600">
          Nome
        </label>
        <input
          id="product-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
        />

        <label htmlFor="product-price" className="mt-4 block text-sm font-medium text-gray-600">
          Preço (€)
        </label>
        <input
          id="product-price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
        />

        <label htmlFor="product-category" className="mt-4 block text-sm font-medium text-gray-600">
          Categoria
        </label>
        <select
          id="product-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span className="mt-4 block text-sm font-medium text-gray-600">Imprimir em</span>
        <div className="mt-1 flex gap-4">
          {[
            { value: 'NONE', label: 'Nenhum' },
            { value: 'KITCHEN', label: 'Cozinha' },
            { value: 'BAR', label: 'Bar' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-base text-gray-700">
              <input
                type="radio"
                name="product-station"
                value={option.value}
                checked={station === option.value}
                onChange={() => setStation(option.value)}
                className="h-4 w-4 accent-emerald-600"
              />
              {option.label}
            </label>
          ))}
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl bg-gray-200 py-3 text-lg font-medium text-gray-700 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || uploading || !isValid}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
          >
            {submitting ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConfigProductFormModal
