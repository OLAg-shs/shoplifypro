import React, { useState } from 'react';
import { Sparkles, Palette, Save, Layout, Smartphone, Monitor, Wand2, CheckCircle2, ChevronRight } from 'lucide-react';

const StoreBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [storeTheme, setStoreTheme] = useState({
    name: 'Neo Premium Store',
    primaryColor: '#0f172a',
    backgroundColor: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    layoutStyle: 'modern'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setIsGenerating(true);
    
    // Simulate AI generation time for UX
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let newTheme = { ...storeTheme };
      
      if (lower.includes('dark')) {
        newTheme = { ...newTheme, primaryColor: '#2563eb', backgroundColor: '#0f172a', textColor: '#f8fafc' };
      } else if (lower.includes('luxury')) {
        newTheme = { ...newTheme, primaryColor: '#b45309', backgroundColor: '#fafaf9', fontFamily: 'serif' };
      }
      
      setStoreTheme(newTheme);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="customizer-layout animate-up">
      {/* Settings Panel */}
      <div className="sidebar" style={{ width: '400px', height: 'auto', minHeight: 'calc(100vh - 72px)' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1rem', border: '1px solid #ddd6fe' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} /> AI GENERATIVE ENGINE
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Store Builder</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Describe your vision and watch the AI craft your storefront.</p>
        </div>

        <form onSubmit={handleGenerate} className="form-group">
          <label>Design Prompt</label>
          <textarea 
            className="input-field" 
            rows="4" 
            placeholder="E.g. A minimalist furniture store with high-end typography and soft earth tones..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ marginBottom: '1rem' }}
          ></textarea>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px' }} disabled={isGenerating}>
            {isGenerating ? <Loader size={20} className="spinner" /> : <><Wand2 size={18} /> Generate Storefront</>}
          </button>
        </form>

        <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border-medium)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Palette size={18} style={{ color: 'var(--primary-accent)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Visual Adjustments</h3>
          </div>

          <div className="form-group">
            <label>Brand Name</label>
            <input type="text" className="input-field" value={storeTheme.name} onChange={(e) => setStoreTheme({...storeTheme, name: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Accent Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={storeTheme.primaryColor} onChange={(e) => setStoreTheme({...storeTheme, primaryColor: e.target.value})} style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{storeTheme.primaryColor}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Background</label>
              <input type="color" value={storeTheme.backgroundColor} onChange={(e) => setStoreTheme({...storeTheme, backgroundColor: e.target.value})} style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-primary" style={{ width: '100%', height: '52px' }}>
            <Save size={18} /> Publish to Live
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="preview-area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
          {/* Device Toggles */}
          <div style={{ background: 'white', padding: '6px', borderRadius: '100px', display: 'flex', gap: '4px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-subtle)' }}>
            <button onClick={() => setPreviewMode('desktop')} style={{ background: previewMode === 'desktop' ? '#f1f5f9' : 'transparent', border: 'none', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: previewMode === 'desktop' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600' }}>
              <Monitor size={16} /> Desktop
            </button>
            <button onClick={() => setPreviewMode('mobile')} style={{ background: previewMode === 'mobile' ? '#f1f5f9' : 'transparent', border: 'none', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: previewMode === 'mobile' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600' }}>
              <Smartphone size={16} /> Mobile
            </button>
          </div>

          {/* Virtual Device */}
          <div style={{ 
            width: previewMode === 'desktop' ? '100%' : '375px', 
            maxWidth: '1000px',
            height: '800px', 
            background: storeTheme.backgroundColor, 
            borderRadius: '20px', 
            boxShadow: 'var(--shadow-premium)', 
            overflowY: 'auto',
            border: '1px solid var(--border-medium)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Store UI */}
            <nav style={{ padding: '24px 40px', borderBottom: `1px solid ${storeTheme.primaryColor}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: storeTheme.primaryColor, margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>{storeTheme.name}</h2>
              <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
                <span>Collection</span>
                <span>Story</span>
                <span>Support</span>
              </div>
            </nav>

            <section style={{ padding: '120px 40px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.1', marginBottom: '24px', color: storeTheme.primaryColor }}>
                Redefining <br/> Quality.
              </h1>
              <p style={{ fontSize: '1.25rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto 40px auto' }}>
                Discover our curated collection of premium essentials designed for the modern lifestyle.
              </p>
              <button style={{ background: storeTheme.primaryColor, color: 'white', padding: '16px 40px', borderRadius: '100px', border: 'none', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer' }}>
                Explore Collection
              </button>
            </section>

            <div style={{ padding: '0 40px 80px 40px', display: 'grid', gridTemplateColumns: previewMode === 'desktop' ? 'repeat(3, 1fr)' : '1fr', gap: '32px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ textAlign: 'left' }}>
                  <div style={{ width: '100%', height: '300px', background: '#f8fafc', borderRadius: '16px', marginBottom: '16px' }}></div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Essential Item 0{i}</h4>
                  <p style={{ fontWeight: '800', fontSize: '1.2rem', color: storeTheme.primaryColor }}>$149.00</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader = ({ size, className }) => (
  <div className={className} style={{ width: size, height: size, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
);

export default StoreBuilder;
