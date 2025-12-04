import { useEffect } from 'react'

/**
 * Componente de banner de Google AdSense
 * @param {Object} props
 * @param {string} props.slot - ID del espacio publicitario (data-ad-slot)
 * @param {string} props.format - Formato del anuncio (auto, rectangle, vertical, horizontal)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.responsive - Si el anuncio es responsive (por defecto true)
 */
const AdBanner = ({
  slot = 'XXXXXXXXXX',
  format = 'auto',
  className = '',
  responsive = true
}) => {
  useEffect(() => {
    try {
      // Verificar si AdSense está disponible
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('Error loading AdSense ad:', error)
    }
  }, [])

  // En desarrollo, mostrar un placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight: '250px' }}
      >
        <div className="text-center p-4">
          <p className="text-gray-400 text-sm font-mono">
            AdSense Placeholder
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Slot: {slot}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4039421752056808"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

export default AdBanner
