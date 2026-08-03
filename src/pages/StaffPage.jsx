import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import StaffFormModal from '../components/StaffFormModal'
import ConfirmDialog from '../components/ConfirmDialog'

const ROLE_LABELS = {
  owner: 'Owner',
  manager: 'Gerente',
  staff: 'Funcionário',
}

function StaffPage() {
  const { profile: currentProfile } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModal, setFormModal] = useState(null) // null | 'create' | <staff member>
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    loadStaff()
  }, [])

  async function loadStaff() {
    setLoading(true)
    try {
      const data = await api.get('/v1/companies/staff')
      setStaff(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(values) {
    await api.post('/v1/companies/staff', values)
    await loadStaff()
    // modal shows a success confirmation and closes itself
  }

  async function handleUpdate(id, values) {
    await api.put(`/v1/companies/staff/${id}`, values)
    await loadStaff()
    setFormModal(null)
  }

  async function confirmDeleteStaff() {
    try {
      await api.delete(`/v1/companies/staff/${confirmDelete.profileId}`)
      setConfirmDelete(null)
      await loadStaff()
    } catch (err) {
      setError(err.message)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-gray-100">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">Funcionários</h1>
        </div>
        <button
          type="button"
          onClick={() => setFormModal('create')}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white active:scale-95"
        >
          <Plus size={18} /> Adicionar Funcionário
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm text-red-600">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-medium">
            Fechar
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-8 text-center text-gray-400">A carregar…</p>
        ) : staff.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Sem funcionários</p>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white">
            {staff.map((member) => {
              const isSelf = member.profileId === currentProfile?.profileId
              return (
                <li key={member.profileId} className="flex items-center gap-3 px-6 py-4">
                  <UserCog className="shrink-0 text-gray-400" size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800">
                      {member.fullName}
                      {isSelf && <span className="ml-2 text-xs text-gray-400">(você)</span>}
                    </p>
                    <p className="truncate text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormModal(member)}
                    aria-label={`Editar ${member.fullName}`}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(member)}
                    disabled={isSelf}
                    aria-label={`Eliminar ${member.fullName}`}
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {formModal && (
        <StaffFormModal
          staff={formModal === 'create' ? null : formModal}
          onCancel={() => setFormModal(null)}
          onSubmit={(values) =>
            formModal === 'create' ? handleCreate(values) : handleUpdate(formModal.profileId, values)
          }
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar funcionário"
          message={`Eliminar a conta de "${confirmDelete.fullName}"? Esta ação não pode ser revertida.`}
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteStaff}
        />
      )}
    </div>
  )
}

export default StaffPage
