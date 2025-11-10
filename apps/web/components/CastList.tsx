'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Cast {
  id: string
  content: string
  scheduledTime: string
  status: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  createdAt: string
  publishedAt?: string
  errorMessage?: string
}

export function CastList() {
  const router = useRouter()
  const [casts, setCasts] = useState<Cast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCasts = async () => {
    try {
      const response = await fetch('/api/casts')
      if (!response.ok) {
        throw new Error('Failed to fetch casts')
      }
      const data = await response.json()
      setCasts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCasts()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCasts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cast?')) {
      return
    }

    try {
      const response = await fetch(`/api/casts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete cast')
      }

      // Refresh the list
      await fetchCasts()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete cast')
    }
  }

  const getStatusBadge = (status: Cast['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}
      >
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority: Cast['priority']) => {
    const styles = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-red-100 text-red-800',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`}
      >
        {priority}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">Loading casts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    )
  }

  if (casts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">
          No scheduled casts yet. Create your first one above!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Casts</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {casts.map((cast) => (
          <div key={cast.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Content */}
                <p className="text-gray-900 mb-3 whitespace-pre-wrap">
                  {cast.content}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      {cast.status === 'PUBLISHED' ? 'Published' : 'Scheduled for'}{' '}
                      {formatDate(
                        cast.status === 'PUBLISHED' && cast.publishedAt
                          ? cast.publishedAt
                          : cast.scheduledTime
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(cast.status)}
                    {getPriorityBadge(cast.priority)}
                  </div>
                </div>

                {/* Error Message */}
                {cast.status === 'FAILED' && cast.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Error:</span> {cast.errorMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(cast.status === 'PENDING' || cast.status === 'FAILED') && (
                <button
                  onClick={() => handleDelete(cast.id)}
                  className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete cast"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
