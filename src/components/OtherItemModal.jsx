import { useState } from 'react'
import { Delete } from 'lucide-react'
import { formatPrice } from '../utils/currency'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_CENTS = 99999999

function OtherItemModal({ onCancel, onConfirm }) {
  const [cents, setCents] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function pressDigit(digit) {
    setCents((prev) => Math.min(prev * 10 + digit, MAX_CENTS))
  }

  function pressBackspace() {
    setCents((prev) => Math.floor(prev / 10))
  }

  async function handleConfirm() {
    if (cents <= 0) return
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(cents / 100)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">Valor Personalizado</h2>
        <p className="mt-4 text-center text-4xl font-bold text-gray-900">{formatPrice(cents / 100)}</p>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => pressDigit(digit)}
              aria-label={`Dígito ${digit}`}
              className="rounded-xl bg-gray-100 py-4 text-2xl font-semibold text-gray-800 active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCents(0)}
            aria-label="Limpar valor"
            className="rounded-xl bg-gray-200 py-4 text-lg font-medium text-gray-600 active:scale-95"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => pressDigit(0)}
            aria-label="Dígito 0"
            className="rounded-xl bg-gray-100 py-4 text-2xl font-semibold text-gray-800 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={pressBackspace}
            aria-label="Apagar"
            className="flex items-center justify-center rounded-xl bg-gray-200 py-4 text-gray-600 active:scale-95"
          >
            <Delete size={22} />
          </button>
        </div>

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
            type="button"
            onClick={handleConfirm}
            disabled={submitting || cents <= 0}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
          >
            {submitting ? 'A adicionar…' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtherItemModal
