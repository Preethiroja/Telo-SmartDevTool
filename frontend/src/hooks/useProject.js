import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!projectId) return

    const fetch = async () => {
      try {
        const res = await api.get(`/analyze/${projectId}`)
        setProject(res.data.project)
        setLoading(false)
        // Stop polling when done
        if (res.data.project.status === 'complete' || res.data.project.status === 'failed') {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project')
        setLoading(false)
        clearInterval(intervalRef.current)
      }
    }

    fetch()
    intervalRef.current = setInterval(fetch, 3000) // poll every 3s
    return () => clearInterval(intervalRef.current)
  }, [projectId])

  return { project, loading, error }
}
