import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ContentSkeleton } from '@/components/LoadingSkeleton'
import { NotFoundError } from '@/components/ErrorBoundary'
import { usePageLoadPerformance, useMemoryMonitor } from '@/hooks/usePerformanceMonitor'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const ShowDetailPage = lazy(() => import('@/pages/ShowDetailPage').then(module => ({ default: module.ShowDetailPage })))

function App() {
  // Monitor page load and memory performance
  usePageLoadPerformance()
  useMemoryMonitor()

  return (
    <div className="App">
      <Suspense 
        fallback={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <ContentSkeleton lines={5} />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/show/:id" element={<ShowDetailPage />} />
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <NotFoundError />
              </div>
            } 
          />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App