import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(error) { console.error(error) }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="container">
        <div className="empty">
          <h2>Something went wrong</h2>
          <p>An unexpected error stopped this page from loading.</p>
          <a className="btn btn-primary" href="/">Back to the shop</a>
        </div>
      </div>
    )
  }
}
