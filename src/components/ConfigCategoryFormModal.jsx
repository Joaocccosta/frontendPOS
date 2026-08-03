import { useState } from 'react'

function ConfigCategoryFormModal({ initialName, onCancel, onSubmit }) {
  const [name, setName] = useState(initialName || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(name.trim())
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialName ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da categoria"
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
        />
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
            disabled={submitting || !name.trim()}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
          >
            {submitting ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConfigCategoryFormModal
