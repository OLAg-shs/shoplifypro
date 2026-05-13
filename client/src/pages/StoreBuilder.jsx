import React, { useState } from 'react';
import { Sparkles, Palette, LayoutTemplate, Save, Edit3 } from 'lucide-react';

const StoreBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storeTheme, setStoreTheme] = useState({
    name: 'My Custom Store',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'system-ui',
    layoutStyle: 'modern'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setStoreTheme(data.theme);
      } else {
        throw new Error('API unavailable');
      }
    } catch {
      // Graceful local fallback if API is not running
      const lower = prompt.toLowerCase();
      const isDark    = lower.includes('dark') || lower.includes('gaming') || lower.includes('night');
      const isLuxury  = lower.includes('luxury') || lower.includes('elegant') || lower.includes('gold');
      const isNature  = lower.includes('organic') || lower.includes('eco') || lower.includes('green');
      const isBold    = lower.includes('sport') || lower.includes('energy') || lower.includes('fitness');

      let theme = {
        name: prompt.split(' ').slice(0, 3).join(' ') + ' Store',
        primaryColor: '#6366f1', secondaryColor: '#ec4899',
        backgroundColor: '#ffffff', textColor: '#1f2937',
        fontFamily: 'Inter, sans-serif', layoutStyle: 'modern',
      };

      if (isDark)    theme = { ...theme, primaryColor: '#8b5cf6', secondaryColor: '#06b6d4', backgroundColor: '#0f172a', textColor: '#f8fafc' };
      else if (isLuxury)  theme = { ...theme, primaryColor: '#d4af37', secondaryColor: '#92400e', backgroundColor: '#fafaf9', textColor: '#1c1917', fontFamily: 'serif' };
      else if (isNature)  theme = { ...theme, primaryColor: '#16a34a', secondaryColor: '#a3e635', backgroundColor: '#f0fdf4', textColor: '#14532d' };
      else if (isBold)    theme = { ...theme, primaryColor: '#dc2626', secondaryColor: '#ea580c' };

      setStoreTheme(theme);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleColorChange = (key, value) => {
    setStoreTheme(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="customizer-layout">
      {/* Controls Sidebar */}
      <div className="glass-panel" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Sparkles className="gradient-text" />
          <h2 style={{ margin: 0 }}>AI Store Builder</h2>
        </div>
        
        <form onSubmit={handleGenerate} className="input-group">
          <label>Describe your dream store</label>
          <textarea 
            className="input-field" 
            rows="3" 
            placeholder="E.g., A dark-themed gaming store with neon accents..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isGenerating}>
            {isGenerating ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : 'Generate Store'}
          </button>
        </form>

        <hr style={{ borderColor: 'var(--glass-border)', margin: '20px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <Palette size={20} />
          <h3 style={{ margin: 0 }}>Live Customizer</h3>
        </div>

        <div className="input-group">
          <label>Store Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={storeTheme.name}
            onChange={(e) => handleColorChange('name', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="input-group">
            <label>Primary</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={storeTheme.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              />
              <span style={{ fontSize: '0.8rem' }}>{storeTheme.primaryColor}</span>
            </div>
          </div>
          <div className="input-group">
            <label>Background</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={storeTheme.backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
          <Save size={18} /> Save Theme
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="preview-area" style={{
        backgroundColor: storeTheme.backgroundColor,
        color: storeTheme.textColor,
        fontFamily: storeTheme.fontFamily,
        transition: 'all 0.4s ease'
      }}>
        {/* Mock Store Header */}
        <header style={{ padding: '20px 40px', borderBottom: `1px solid ${storeTheme.textColor}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: storeTheme.primaryColor, margin: 0, fontWeight: 800 }}>{storeTheme.name}</h2>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span style={{ cursor: 'pointer' }}>Catalog</span>
            <span style={{ cursor: 'pointer' }}>Contact</span>
          </nav>
        </header>

        {/* Mock Hero Section */}
        <div style={{ padding: '80px 40px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Welcome to {storeTheme.name}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px', marginBottom: '40px' }}>
            This is a live preview of your generated storefront. Try changing the colors on the left to see instant updates!
          </p>
          <button style={{
            background: storeTheme.primaryColor,
            color: '#fff',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: `0 4px 15px ${storeTheme.primaryColor}50`
          }}>
            Shop Now
          </button>
        </div>

        {/* Mock Products Grid */}
        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ 
              border: `1px solid ${storeTheme.textColor}20`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ width: '100%', height: '150px', background: `${storeTheme.primaryColor}20`, borderRadius: '8px', marginBottom: '15px' }}></div>
              <h4 style={{ margin: '0 0 10px 0' }}>Product {i}</h4>
              <p style={{ fontWeight: 'bold', color: storeTheme.primaryColor }}>$99.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreBuilder;
