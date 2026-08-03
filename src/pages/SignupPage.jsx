import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signup(companyName, fullName, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Não foi possível criar a conta.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-y-auto bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-gray-800">Criar Empresa</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Comece a usar o Caixa Associação</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <label className="mt-6 block text-sm font-medium text-gray-700">
          Nome da empresa/associação
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          O seu nome
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Palavra-passe
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
        >
          {submitting ? 'A criar…' : 'Criar empresa'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  )
}

export default SignupPage
