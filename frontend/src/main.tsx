import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean; error: Error | null}> {
  state = {hasError: false, error: null as Error | null};
  static getDerivedStateFromError(error: Error) { return {hasError: true, error}; }
  render() {
    if (this.state.hasError) return (
      <div style={{padding:24,textAlign:'center',background:'#0d0d12',minHeight:'100vh',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <p style={{fontSize:48,marginBottom:16}}>♈</p>
        <h2 style={{marginBottom:12}}>$OVEN AI Horoscope</h2>
        <p style={{color:'#888',fontSize:14,marginBottom:20}}>Что-то пошло не так. Обнови страницу.</p>
        <button onClick={()=>this.setState({hasError:false,error:null})} style={{padding:'12px 24px',background:'#d4a017',border:'none',borderRadius:8,cursor:'pointer',fontSize:16,fontWeight:'bold'}}>🔄 Попробовать снова</button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
