import { useState } from 'react'
import { Mail } from 'lucide-react'

const ROLES = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'STAFF', label: 'Funcionário' },
]

function buildMailtoHref(email, password) {
  const subject = 'O seu acesso à conta'
  const body = `Email: ${email}\nPalavra-passe: ${password}\n\nPor favor altere a palavra-passe no primeiro acesso.`
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function StaffFormModal({ staff, onCancel, onSubmit }) {
  const isEditing = Boolean(staff)
  const [email, setEmail] = useState(staff?.email ?? '')
  const [fullName, setFullName] = useState(staff?.fullName ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(staff?.role ? staff.role.toUpperCase() : 'STAFF')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)

  const isValid = fullName.trim() && role && (isEditing || (email.trim() && password.length >= 8))

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      if (isEditing) {
        await onSubmit({ fullName: fullName.trim(), role })
      } else {
        await onSubmit({ email: email.trim(), fullName: fullName.trim(), password, role })
        setCreated({ email: email.trim(), password })
      }
    } catch (err) {
      setError(err.message || 'Não foi possível guardar.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Editar Funcionário' : 'Adicionar Funcionário'}</h2>

        {created ? (
          <>
            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              Conta criada para <strong>{created.email}</strong>. Pode agora partilhar as credenciais com esta
              pessoa (a palavra-passe não voltará a ser mostrada aqui).
            </p>
            <a
              href={buildMailtoHref(created.email, created.password)}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-200 py-3 text-lg font-medium text-gray-700"
            >
              <Mail size={18} /> Enviar por email
            </a>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white"
            >
              Fechar
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            {!isEditing && (
              <label className="mt-4 block text-sm font-medium text-gray-600">
                Email
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
                />
              </label>
            )}

            <label className="mt-4 block text-sm font-medium text-gray-600">
              Nome
              <input
                required
                autoFocus={isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
              />
            </label>

            {!isEditing && (
              <label className="mt-4 block text-sm font-medium text-gray-600">
                Palavra-passe inicial
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
                />
                <span className="mt-1 block text-xs text-gray-400">
                  Mínimo 8 caracteres. A pessoa terá de a alterar no primeiro acesso.
                </span>
              </label>
            )}

            <span className="mt-4 block text-sm font-medium text-gray-600">Papel</span>
            <div className="mt-1 flex flex-col gap-2">
              {ROLES.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-base text-gray-700">
                  <input
                    type="radio"
                    name="staff-role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {option.label}
                </label>
              ))}
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
                type="submit"
                disabled={submitting || !isValid}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
              >
                {submitting ? 'A guardar…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default StaffFormModal
