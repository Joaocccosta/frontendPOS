import { useState } from 'react'
import { ArrowLeft, Banknote, CreditCard } from 'lucide-react'
import { formatPrice } from '../utils/currency'

const PAYMENT_METHODS = {
  CASH: 'CASH',
  MULTIBANCO: 'MULTIBANCO',
}

function ConfirmOrderModal({ total, showTableFields = false, onCancel, onConfirm }) {
  const [method, setMethod] = useState(null)
  const [amountReceivedText, setAmountReceivedText] = useState('')
  const [table, setTable] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const amountReceived = Number(amountReceivedText.replace(',', '.'))
  const hasValidAmount = amountReceivedText.trim() !== '' && !Number.isNaN(amountReceived)
  const change = hasValidAmount ? amountReceived - total : null
  const canConfirmCash = hasValidAmount && change >= 0

  function handleSelectMethod(selected) {
    setError(null)
    setMethod(selected)
  }

  function handleBack() {
    setMethod(null)
    setAmountReceivedText('')
    setError(null)
  }

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    const tableFields = { table: table.trim() || undefined, name: name.trim() || undefined }
    try {
      if (method === PAYMENT_METHODS.CASH) {
        await onConfirm({ paymentMethod: PAYMENT_METHODS.CASH, amountReceived, ...tableFields })
      } else {
        await onConfirm({ paymentMethod: PAYMENT_METHODS.MULTIBANCO, ...tableFields })
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao finalizar a compra.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">Confirmar Compra</h2>
        <p className="mt-4 text-center text-3xl font-bold text-gray-900">{formatPrice(total)}</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        {method === null && (
          <>
            {showTableFields && (
              <div className="mt-6 flex gap-3">
                <label className="flex-1 text-sm font-medium text-gray-600">
                  Mesa (opcional)
                  <input
                    value={table}
                    onChange={(e) => setTable(e.target.value)}
                    placeholder="Ex: 5"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="flex-1 text-sm font-medium text-gray-600">
                  Nome (opcional)
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
                  />
                </label>
              </div>
            )}
            <p className="mt-6 text-center text-sm font-medium text-gray-500">Método de pagamento</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => handleSelectMethod(PAYMENT_METHODS.CASH)}
                className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-gray-200 py-5 font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                <Banknote size={28} />
                Dinheiro
              </button>
              <button
                type="button"
                onClick={() => handleSelectMethod(PAYMENT_METHODS.MULTIBANCO)}
                className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-gray-200 py-5 font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                <CreditCard size={28} />
                Multibanco
              </button>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 w-full rounded-xl bg-gray-200 py-4 text-lg font-medium text-gray-700"
            >
              Cancelar
            </button>
          </>
        )}

        {method === PAYMENT_METHODS.CASH && (
          <>
            <label className="mt-6 block text-sm font-medium text-gray-700">
              Valor recebido
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                autoFocus
                value={amountReceivedText}
                onChange={(e) => setAmountReceivedText(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">Troco</span>
              <span
                className={`text-xl font-bold ${change != null && change < 0 ? 'text-red-500' : 'text-emerald-600'}`}
              >
                {change != null ? formatPrice(Math.max(change, 0)) : '—'}
              </span>
            </div>
            {change != null && change < 0 && (
              <p className="mt-1 text-right text-xs text-red-500">Valor insuficiente</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-200 py-4 text-lg font-medium text-gray-700 disabled:opacity-40"
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || !canConfirmCash}
                className="flex-1 rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white disabled:opacity-40"
              >
                {submitting ? 'A processar…' : 'Confirmar'}
              </button>
            </div>
          </>
        )}

        {method === PAYMENT_METHODS.MULTIBANCO && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-200 py-4 text-lg font-medium text-gray-700 disabled:opacity-40"
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white disabled:opacity-40"
            >
              {submitting ? 'A processar…' : 'Confirmar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmOrderModal
