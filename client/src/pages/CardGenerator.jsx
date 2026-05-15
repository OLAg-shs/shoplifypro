import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Image as ImageIcon, Type, Sparkles } from 'lucide-react';

const CardGenerator = () => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardConfig, setCardConfig] = useState({
    productName: 'Premium Wireless Headphones',
    price: '$199.99',
    tagline: 'Experience pure audio fidelity',
    bgColor: 'linear-gradient(135deg, #1e293b, #0f172a)',
    accentColor: '#6366f1',
    textColor: '#ffffff',
    layout: 'standard'
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `branded-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="customizer-layout">
      {/* Editor Sidebar */}
      <div className="glass-panel" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Sparkles className="gradient-text" />
          <h2 style={{ margin: 0 }}>Ad Card Generator</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Customize your unique branded product cards for social media advertising.
        </p>

        <div className="input-group">
          <label><Type size={14} style={{ display: 'inline', marginRight: '5px' }}/> Product Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={cardConfig.productName}
            onChange={(e) => setCardConfig({...cardConfig, productName: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>Price</label>
          <input 
            type="text" 
            className="input-field" 
            value={cardConfig.price}
            onChange={(e) => setCardConfig({...cardConfig, price: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>Tagline</label>
          <input 
            type="text" 
            className="input-field" 
            value={cardConfig.tagline}
            onChange={(e) => setCardConfig({...cardConfig, tagline: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>Background Style</label>
          <select 
            className="input-field" 
            onChange={(e) => setCardConfig({...cardConfig, bgColor: e.target.value})}
          >
            <option value="linear-gradient(135deg, #1e293b, #0f172a)">Dark Slate</option>
            <option value="linear-gradient(135deg, #4f46e5, #ec4899)">Brand Gradient</option>
            <option value="linear-gradient(135deg, #111827, #000000)">Pitch Black</option>
            <option value="linear-gradient(135deg, #ffffff, #f3f4f6)">Clean White</option>
          </select>
        </div>

        <div className="input-group">
          <label>Accent Color</label>
          <input 
            type="color" 
            value={cardConfig.accentColor}
            onChange={(e) => setCardConfig({...cardConfig, accentColor: e.target.value})}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '20px' }}
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download size={18} /> {isGenerating ? 'Generating...' : 'Download High-Res Card'}
        </button>
      </div>

      {/* Preview Area */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        
        {/* THE CARD ITSELF */}
        <div 
          ref={cardRef}
          style={{
            width: '400px',
            height: '500px',
            background: cardConfig.bgColor,
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px',
            color: cardConfig.bgColor.includes('ffffff') ? '#111' : '#fff'
          }}
        >
          {/* Decorative background shapes */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: cardConfig.accentColor,
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.5,
            zIndex: 0
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '6px 12px', 
              background: cardConfig.accentColor, 
              color: '#fff', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              NEW ARRIVAL
            </div>
            <h2 style={{ fontSize: '2rem', lineHeight: '1.2', margin: '0 0 10px 0', fontFamily: "'Outfit', sans-serif" }}>
              {cardConfig.productName}
            </h2>
            <p style={{ opacity: 0.8, fontSize: '1.1rem', margin: 0 }}>
              {cardConfig.tagline}
            </p>
          </div>

          {/* Product Image Placeholder (White background processed) */}
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `2px solid ${cardConfig.accentColor}50`
            }}>
              <ImageIcon size={64} opacity={0.5} />
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
              {cardConfig.price}
            </div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              background: cardConfig.accentColor, 
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff'
            }}>
              →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardGenerator;
