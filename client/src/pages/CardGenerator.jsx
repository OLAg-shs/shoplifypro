import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Image as ImageIcon, Type, Sparkles, Trophy, Store } from 'lucide-react';

const CardGenerator = () => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardType, setCardType] = useState('milestone'); // 'product' or 'milestone'
  
  const [cardConfig, setCardConfig] = useState({
    productName: 'Premium Wireless Headphones',
    price: '$199.99',
    tagline: 'Experience pure audio fidelity',
    bgColor: 'linear-gradient(135deg, #020617, #0f172a)',
    accentColor: '#6366f1',
    textColor: '#ffffff',
    // Milestone specific config
    milestoneNumber: '100',
    milestoneTitle: 'Sellers Registered',
    milestoneSubtitle: 'We officially hit our milestone! Join the global network today.',
    websiteUrl: 'eaglechoice.com'
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution
        backgroundColor: null,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `eagle-choice-${cardType}-${Date.now()}.png`;
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
      <div className="glass-panel" style={{ overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Sparkles className="gradient-text" />
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>Ad Studio</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Generate premium, high-resolution social media graphics.
        </p>

        {/* Template Selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            className={`btn ${cardType === 'milestone' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px' }}
            onClick={() => setCardType('milestone')}
          >
            <Trophy size={16} /> Milestone
          </button>
          <button 
            className={`btn ${cardType === 'product' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px' }}
            onClick={() => setCardType('product')}
          >
            <Store size={16} /> Product
          </button>
        </div>

        {cardType === 'milestone' ? (
          <>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Milestone Number</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.milestoneNumber}
                onChange={(e) => setCardConfig({...cardConfig, milestoneNumber: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Main Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.milestoneTitle}
                onChange={(e) => setCardConfig({...cardConfig, milestoneTitle: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subtitle text</label>
              <textarea 
                className="input-field" 
                rows={3}
                value={cardConfig.milestoneSubtitle}
                onChange={(e) => setCardConfig({...cardConfig, milestoneSubtitle: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Website URL</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.websiteUrl}
                onChange={(e) => setCardConfig({...cardConfig, websiteUrl: e.target.value})}
              />
            </div>
          </>
        ) : (
          <>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.productName}
                onChange={(e) => setCardConfig({...cardConfig, productName: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.price}
                onChange={(e) => setCardConfig({...cardConfig, price: e.target.value})}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tagline</label>
              <input 
                type="text" 
                className="input-field" 
                value={cardConfig.tagline}
                onChange={(e) => setCardConfig({...cardConfig, tagline: e.target.value})}
              />
            </div>
          </>
        )}

        <div className="input-group" style={{ marginBottom: '15px', marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accent Color</label>
          <input 
            type="color" 
            style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            value={cardConfig.accentColor}
            onChange={(e) => setCardConfig({...cardConfig, accentColor: e.target.value})}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '30px', height: '50px' }}
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download size={18} /> {isGenerating ? 'Generating Ultra-HD...' : 'Download Graphic'}
        </button>
      </div>

      {/* Preview Area */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', background: 'var(--bg-dark)' }}>
        
        {/* THE RENDERED CARD */}
        <div 
          ref={cardRef}
          style={{
            width: '1080px', // True 1080x1080 social media size
            height: '1080px',
            transform: 'scale(0.5)', // Scale down for preview so it fits on screen
            transformOrigin: 'center center',
            background: cardConfig.bgColor,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff'
          }}
        >
          {/* Global Premium Background Elements */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%', width: '800px', height: '800px',
            background: `radial-gradient(circle, ${cardConfig.accentColor} 0%, transparent 70%)`,
            opacity: 0.15, filter: 'blur(80px)', zIndex: 0
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', left: '-20%', width: '1000px', height: '1000px',
            background: `radial-gradient(circle, #38bdf8 0%, transparent 70%)`,
            opacity: 0.1, filter: 'blur(100px)', zIndex: 0
          }} />

          {cardType === 'milestone' ? (
            /* --- MILESTONE TEMPLATE --- */
            <div style={{ position: 'relative', zIndex: 1, padding: '80px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', background: cardConfig.accentColor, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={30} color="#fff" />
                  </div>
                  <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px' }}>Eagle Choice</span>
                </div>
                <div style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Premium Digital Empire
                </div>
              </div>

              {/* Center Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginTop: '-50px' }}>
                <div style={{ 
                  fontSize: '24rem', 
                  fontWeight: 900, 
                  lineHeight: 0.9, 
                  letterSpacing: '-15px',
                  background: `linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, ${cardConfig.accentColor} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0px 20px 40px ${cardConfig.accentColor}40)`
                }}>
                  {cardConfig.milestoneNumber}
                </div>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 800, margin: '20px 0 0 0', letterSpacing: '-2px' }}>
                  {cardConfig.milestoneTitle}
                </h1>
                <p style={{ fontSize: '1.8rem', color: '#cbd5e1', maxWidth: '800px', margin: '30px 0 0 0', lineHeight: 1.4 }}>
                  {cardConfig.milestoneSubtitle}
                </p>
              </div>

              {/* Bottom Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '20px 60px',
                  borderRadius: '100px',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#fff',
                  boxShadow: `0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px ${cardConfig.accentColor}50`
                }}>
                  Visit {cardConfig.websiteUrl} Today <span style={{ color: cardConfig.accentColor, marginLeft: '10px' }}>→</span>
                </div>
              </div>

            </div>
          ) : (
            /* --- PRODUCT TEMPLATE --- */
            <div style={{ position: 'relative', zIndex: 1, padding: '80px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div style={{ display: 'inline-block', padding: '15px 30px', background: cardConfig.accentColor, color: '#fff', borderRadius: '100px', fontSize: '1.5rem', fontWeight: 'bold', width: 'fit-content' }}>
                 NEW ARRIVAL
               </div>
               
               <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <div style={{ width: '500px', height: '500px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: `4px solid ${cardConfig.accentColor}50`, boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                   <ImageIcon size={150} opacity={0.3} />
                 </div>
               </div>

               <div>
                 <h2 style={{ fontSize: '5rem', fontWeight: 800, margin: '0 0 20px 0', lineHeight: 1.1 }}>{cardConfig.productName}</h2>
                 <p style={{ fontSize: '2rem', color: '#94a3b8', margin: '0 0 40px 0' }}>{cardConfig.tagline}</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                   <div style={{ fontSize: '6rem', fontWeight: 900, color: cardConfig.accentColor }}>{cardConfig.price}</div>
                   <div style={{ padding: '30px', background: '#fff', borderRadius: '50%', color: '#000', display: 'flex' }}>
                     <Sparkles size={40} />
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
