import { Link } from 'react-router-dom'
import { LogOut, Receipt, Settings, ShoppingCart, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const { profile, logout } = useAuth()
  const canManageStaff = profile?.role === 'owner' || profile?.role === 'manager'

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-y-auto bg-gray-100 p-6">
      {profile && (
        <div className="absolute top-4 right-4 flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">{profile.companyName}</span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
      <h1 className="text-center text-3xl font-semibold text-gray-800 sm:text-4xl">Caixa Associação</h1>
      <div className="flex w-full max-w-4xl flex-wrap items-stretch justify-center gap-6">
        <Link
          to="/config"
          className="flex min-w-40 max-w-72 flex-1 basis-48 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl active:scale-95 sm:p-10"
        >
          <Settings size={56} className="text-gray-700" />
          <span className="text-center text-xl font-medium text-gray-800 sm:text-2xl">Configurar Produtos</span>
        </Link>
        <Link
          to="/venda"
          className="flex min-w-40 max-w-72 flex-1 basis-48 flex-col items-center justify-center gap-4 rounded-2xl bg-emerald-600 p-6 text-white shadow-md transition hover:shadow-xl active:scale-95 sm:p-10"
        >
          <ShoppingCart size={56} />
          <span className="text-center text-xl font-medium sm:text-2xl">Iniciar Venda</span>
        </Link>
        <Link
          to="/transacoes"
          className="flex min-w-40 max-w-72 flex-1 basis-48 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl active:scale-95 sm:p-10"
        >
          <Receipt size={56} className="text-gray-700" />
          <span className="text-center text-xl font-medium text-gray-800 sm:text-2xl">Ver Transações</span>
        </Link>
        {canManageStaff && (
          <Link
            to="/funcionarios"
            className="flex min-w-40 max-w-72 flex-1 basis-48 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl active:scale-95 sm:p-10"
          >
            <Users size={56} className="text-gray-700" />
            <span className="text-center text-xl font-medium text-gray-800 sm:text-2xl">Funcionários</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default HomePage
