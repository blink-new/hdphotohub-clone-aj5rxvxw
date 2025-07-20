import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import MediaUpload from './pages/MediaUpload'
import PropertyTour from './pages/PropertyTour'
import { Toaster } from './components/ui/toaster'

type Page = 'landing' | 'dashboard' | 'upload' | 'kit' | 'tour'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Auto-navigate to dashboard if user is logged in
      if (state.user && currentPage === 'landing') {
        setCurrentPage('dashboard')
      }
    })
    return unsubscribe
  }, [currentPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PropertyKit...</p>
        </div>
      </div>
    )
  }

  const handleNavigate = (page: Page, propertyId?: string) => {
    setCurrentPage(page)
    if (propertyId) {
      setSelectedPropertyId(propertyId)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />
      case 'upload':
        return <MediaUpload user={user} onNavigate={handleNavigate} />
      case 'tour':
        return <PropertyTour propertyId={selectedPropertyId} onNavigate={handleNavigate} />
      default:
        return <LandingPage onNavigate={handleNavigate} />
    }
  }

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  )
}

export default App