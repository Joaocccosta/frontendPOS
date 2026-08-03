import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import SortableRow from './SortableRow'

function ConfigCategoryList({
  categories,
  selectedCategoryId,
  onSelect,
  onReorder,
  onToggleActive,
  onEdit,
  onCreate,
  onDelete,
  canManage,
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    onReorder(arrayMove(categories, oldIndex, newIndex))
  }

  function renderRow(category) {
    return (
      <div
        onClick={() => onSelect(category.id)}
        className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-3 ${
          category.id === selectedCategoryId ? 'font-semibold text-emerald-700' : 'text-gray-700'
        } ${category.active ? '' : 'opacity-40'}`}
      >
        <span className="truncate">{category.name}</span>
        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(category)
              }}
              aria-label={`Editar ${category.name}`}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive(category)
              }}
              aria-label={category.active ? `Desativar ${category.name}` : `Ativar ${category.name}`}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              {category.active ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(category)
              }}
              aria-label={`Eliminar ${category.name}`}
              className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Categorias</h2>
        {canManage && (
          <button
            type="button"
            onClick={onCreate}
            aria-label="Nova categoria"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white active:scale-95"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      {categories.length === 0 && <p className="p-8 text-center text-gray-400">Sem categorias</p>}
      {canManage ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex-1 overflow-y-auto">
              {categories.map((category) => (
                <SortableRow key={category.id} id={category.id}>
                  {renderRow(category)}
                </SortableRow>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <li key={category.id} className="border-b border-gray-100">
              {renderRow(category)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ConfigCategoryList
