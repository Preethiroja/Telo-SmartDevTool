import { useState, useEffect } from 'react'
import api from '../utils/api'

export function useStats() {
  const [stats, setStats] = useState({ totalProjects: 0, apisAnalyzed: 0, generatedFiles: 0, lastActivity: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analyze/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
