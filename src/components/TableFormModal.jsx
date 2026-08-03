import { useState } from 'react'

function TableFormModal({ existingTables, onCancel, onConfirm }) {
  const [table, setTable] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedTable = table.trim()
    if (!trimmedTable) return
    const isDuplicate = existingTables.some((existing) => existing.toLowerCase() === trimmedTable.toLowerCase())
    if (isDuplicate) {
      setError('Já existe uma mesa com este número')
      return
    }
    setSubmitting(true)
    onConfirm({ table: trimmedTable, name: name.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">Nova Mesa</h2>

        <label className="mt-4 block text-sm font-medium text-gray-600">
          Número da mesa
          <input
            autoFocus
            value={table}
            onChange={(e) => {
              setTable(e.target.value)
              setError(null)
            }}
            placeholder="Ex: 5"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-600">
          Nome da pessoa (opcional)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
          />
        </label>

        {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
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
            disabled={submitting || !table.trim()}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  )
}

export default TableFormModal
