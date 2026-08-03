import { Plus } from 'lucide-react'
import { formatPrice } from '../utils/currency'

export function displayTableName(table) {
  return /^mesa\b/i.test(table.trim()) ? table : `Mesa ${table}`
}

function MesasListView({ tables, onSelectTable, onCreateTable }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Mesas</h2>
        <button
          type="button"
          onClick={onCreateTable}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white active:scale-95"
        >
          <Plus size={18} /> Adicionar
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        {tables.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">Sem mesas abertas</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,280px))] items-start gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => onSelectTable(table.id)}
                className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md active:scale-95"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xl font-semibold text-gray-800">
                    {displayTableName(table.table)}
                  </span>
                  <span className="shrink-0 text-lg font-bold text-emerald-700">{formatPrice(table.total)}</span>
                </div>
                {table.name && <p className="truncate text-base font-medium text-gray-600">{table.name}</p>}
                <div className="relative h-28 overflow-hidden">
                  {table.items.length === 0 ? (
                    <p className="text-sm text-gray-400">Sem itens</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 text-sm text-gray-600">
                      {table.items.map((item) => (
                        <li key={item.id} className="flex justify-between py-1">
                          <span className="truncate">
                            {item.nameSnapshot} x{item.quantity}
                          </span>
                          <span className="shrink-0 pl-2">{formatPrice(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MesasListView
