import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ChangePasswordPage() {
  const { profile, changePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isValid = currentPassword && newPassword.length >= 8 && newPassword === confirmPassword

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      await changePassword(currentPassword, newPassword)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível alterar a palavra-passe.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-gray-800">Alterar Palavra-passe</h1>
        {profile?.mustChangePassword ? (
          <p className="mt-1 text-center text-sm text-gray-500">
            Esta é a primeira vez que entra nesta conta. Defina uma nova palavra-passe para continuar.
          </p>
        ) : (
          <p className="mt-1 text-center text-sm text-gray-500">Escolha uma nova palavra-passe.</p>
        )}

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <label className="mt-6 block text-sm font-medium text-gray-700">
          Palavra-passe atual
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Nova palavra-passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Confirmar nova palavra-passe
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <span className="mt-1 block text-xs text-red-500">As palavras-passe não coincidem</span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting || !isValid}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
        >
          {submitting ? 'A guardar…' : 'Guardar nova palavra-passe'}
        </button>

        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Sair
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordPage
