import { useCallback, useEffect, useRef, useState } from 'react'

// runs an async task and tracks data / loading / error; `retry()` runs it again
export function useFetch(task, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)
  const taskRef = useRef(task)
  taskRef.current = task

  useEffect(() => {
    let alive = true
    setState((previous) => ({ data: previous.data, error: null, loading: true }))
    taskRef.current().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error) => alive && setState({ data: null, error, loading: false }),
    )
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry, setData: (data) => setState((previous) => ({ ...previous, data })) }
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useTitle(title) {
  useEffect(() => { document.title = title ? `${title} | Shopora` : 'Shopora' }, [title])
}

// true once the element has come near the viewport
export function useInView(margin = '200px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || seen) return undefined
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect() } }, { rootMargin: margin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [margin, seen])
  return [ref, seen]
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
  }, [theme])
  return [theme, () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))]
}
