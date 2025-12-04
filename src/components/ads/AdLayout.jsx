import AdBanner from './AdBanner'

/**
 * Layout que envuelve el contenido de la aplicación con anuncios
 * - En desktop: anuncios laterales (izquierda y derecha)
 * - En mobile: anuncio inferior fijo
 */
const AdLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Layout para desktop y tablet */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Anuncio izquierdo - Desktop */}
        <aside className="w-40 xl:w-48 flex-shrink-0 p-2 sticky top-0 h-screen overflow-hidden">
          <AdBanner
            slot="8887379967"
            format="vertical"
            className="h-full"
          />
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Anuncio derecho - Desktop */}
        <aside className="w-40 xl:w-48 flex-shrink-0 p-2 sticky top-0 h-screen overflow-hidden">
          <AdBanner
            slot="5411169381"
            format="vertical"
            className="h-full"
          />
        </aside>
      </div>

      {/* Layout para mobile */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Contenido principal */}
        <main className="flex-1 pb-24">
          {children}
        </main>

        {/* Anuncio inferior - Mobile (fijo) */}
        <div className="fixed bottom-0 left-0 right-0 bg-impostor-darker/95 backdrop-blur-sm border-t border-impostor-light/20 z-50">
          <AdBanner
            slot="4098087716"
            format="horizontal"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default AdLayout
