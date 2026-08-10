import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 24, textAlign: 'center', background: '#0d0d12', minHeight: '100vh', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>♈</p>
        <h2 style={{ marginBottom: 12 }}>$OVEN AI Horoscope</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Что-то пошло не так. Обнови страницу.</p>
        <button onClick={() => this.setState({ hasError: false, error: null })}
          style={{ padding: '12px 24px', background: '#d4a017', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>
          🔄 Попробовать снова
        </button>
        <p style={{ color: '#555', fontSize: 12, marginTop: 16 }}>{this.state.error?.message}</p>
      </div>
    );
    return this.props.children;
  }
}
