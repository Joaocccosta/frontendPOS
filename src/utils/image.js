const THUMBNAIL_SIZE = 350
const THUMBNAIL_QUALITY = 0.85

function drawResizedCanvas(file, maxSize) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(objectUrl)
      resolve(canvas)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível processar a imagem'))
    }

    img.src = objectUrl
  })
}

export async function resizeImageToBlob(file, maxSize = THUMBNAIL_SIZE) {
  const canvas = await drawResizedCanvas(file, maxSize)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível processar a imagem'))),
      'image/jpeg',
      THUMBNAIL_QUALITY,
    )
  })
}
