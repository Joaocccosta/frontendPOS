import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Eye, EyeOff, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import SortableRow from './SortableRow'
import { formatPrice } from '../utils/currency'

function ConfigProductList({ products, onReorder, onToggleActive, onEdit, onCreate, onDelete, canManage }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    onReorder(arrayMove(products, oldIndex, newIndex))
  }

  function renderRow(product) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 ${product.active ? '' : 'opacity-40'}`}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package className="text-gray-400" size={20} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-800">{product.name}</p>
          <p className="text-sm text-emerald-700">{formatPrice(product.price)}</p>
        </div>
        {canManage && (
          <>
            <button
              type="button"
              onClick={() => onEdit(product)}
              aria-label={`Editar ${product.name}`}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(product)}
              aria-label={product.active ? `Desativar ${product.name}` : `Ativar ${product.name}`}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              aria-label={`Eliminar ${product.name}`}
              className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-800">Produtos</h2>
        {canManage && (
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white active:scale-95"
          >
            <Plus size={18} /> Novo Produto
          </button>
        )}
      </div>
      {products.length === 0 && <p className="p-8 text-center text-gray-400">Sem produtos nesta categoria</p>}
      {canManage ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex-1 overflow-y-auto bg-white">
              {products.map((product) => (
                <SortableRow key={product.id} id={product.id}>
                  {renderRow(product)}
                </SortableRow>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="flex-1 overflow-y-auto bg-white">
          {products.map((product) => (
            <li key={product.id} className="border-b border-gray-100">
              {renderRow(product)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ConfigProductList
