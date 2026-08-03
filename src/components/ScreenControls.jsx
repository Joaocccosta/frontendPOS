import { ArrowLeft, Maximize, Minimize } from 'lucide-react'
import { useFullscreen } from '../hooks/useFullscreen'

function ScreenControls({ onBack, backLabel = 'Voltar ao início', floating = false }) {
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const containerClassName = floating
    ? 'absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-gray-900 p-2 shadow-lg'
    : 'flex items-center justify-center gap-2 border-t border-gray-800 p-3'

  return (
    <div className={containerClassName}>
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
      >
        <ArrowLeft size={20} />
      </button>
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
        className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  )
}

export default ScreenControls
