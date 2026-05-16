import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Wand2, 
  Maximize, 
  Download, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  Play,
  CheckCircle,
  Zap,
  Star,
  ArrowRight,
  Lock
} from 'lucide-react';
import { api } from '../utils/api';

// ── Draggable Before/After Slider Component ───────────────────────────────────
const BeforeAfterSlider = ({ beforeSrc, afterSrc }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 2), 98));
  };

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e) => { if (isDragging.current) handleMove(e.clientX); };
  const onTouchMove = (e) => { handleMove(e.touches[0].clientX); };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      style={{
        position: 'relative', width: '100%', height: '420px',
        borderRadius: '24px', overflow: 'hidden', cursor: 'ew-resize',
        userSelect: 'none', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)'
      }}
    >
      {/* AFTER (right side - full image) */}
      <img src={afterSrc} alt="After" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* BEFORE (left side - clipped) */}
      <div style={{ position: 'absolute', inset: 0, width: `${sliderPos}%`, overflow: 'hidden' }}>
        <img src={beforeSrc} alt="Before" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>BEFORE</div>
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>AFTER</div>
      {/* Divider line */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: '3px', background: 'white', transform: 'translateX(-50%)', boxShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
        <div 
          onMouseDown={onMouseDown}
          onTouchStart={() => {}}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ew-resize', zIndex: 10 }}
        >
          <span style={{ fontSize: '1.2rem', color: '#7c3aed', fontWeight: 900 }}>⇔</span>
        </div>
      </div>
    </div>
  );
};

const ProductStudio = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('process'); // 'process' or 'ad-gen'
  const [adPrompt, setAdPrompt] = useState('');
  
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  const processImage = async (action) => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('action', action);

      const response = await fetch('/api/ai/process-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAd = async () => {
    if (!adPrompt.trim()) {
      setError('Please enter a description for the ad background.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: adPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }

      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `ai-product-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setProcessedImage(null);
    setError(null);
    setAdPrompt('');
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Payment initialization failed: ' + data.message);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to payment gateway.');
      setIsProcessing(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPro = user.subscription_tier === 'pro';

  // ── PAYWALL UI ─────────────────────────────────────────────────────────────
  if (!isPro) {
    const steps = [
      { num: '01', icon: <Upload size={28} />, title: 'Upload Your Product', desc: 'Take any photo with your phone. Messy background, bad lighting—it doesn\'t matter. Upload it raw.' },
      { num: '02', icon: <Wand2 size={28} />, title: 'Choose Your AI Action', desc: 'Remove the background instantly, or describe any scene and the AI generates a professional studio backdrop for you.' },
      { num: '03', icon: <Download size={28} />, title: 'Download & Sell', desc: 'Export your studio-quality image in seconds and upload it to your store. Watch your conversion rate climb.' },
    ];

    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', padding: '8px 18px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '2rem' }}>
            <Sparkles size={14} /> EAGLE CHOICE PRO — AI STUDIO
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 1.5rem', background: 'linear-gradient(135deg, #fff 30%, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Turn Any Phone Photo Into<br/>a $5,000 Studio Shot
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Your competitors are paying agencies thousands. You won't have to. The Eagle Choice AI Studio does it in seconds.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Background Removal', 'AI Scene Generator', 'Smart Upscaling', 'Video Ads (Soon)'].map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle size={16} style={{ color: '#34d399' }} /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── BEFORE / AFTER SLIDER ── */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            👇 Drag the slider to see the transformation
          </p>
          <BeforeAfterSlider
            beforeSrc="/demo-before-after.png"
            afterSrc="/demo-perfume.png"
          />
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ margin: '5rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Three steps. Less than 60 seconds. Professional results every time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(124,58,237,0.08)', position: 'absolute', top: '-0.5rem', right: '1.5rem', lineHeight: 1, fontFamily: 'monospace' }}>{s.num}</div>
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.5rem' }}>
                  {s.icon}
                </div>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRICING / CTA ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '32px', padding: '3.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <Zap size={14} /> LIMITED OFFER — Only $10/month
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Get Unlimited AI Generations<br/>for Less Than a Coffee a Week
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            100 AI credits every 30 days. Background removal, scene generation, upscaling, and early access to video ad creation.
          </p>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { label: '100', sub: 'AI Credits/Month' },
              { label: '30s', sub: 'Average Processing Time' },
              { label: '∞', sub: 'Store Backgrounds' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '1.2rem 3rem', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 10px 40px -10px rgba(236,72,153,0.6)', opacity: isProcessing ? 0.7 : 1 }}
            onMouseEnter={e => { if (!isProcessing) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px -10px rgba(236,72,153,0.8)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(236,72,153,0.6)'; }}
          >
            {isProcessing ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={24} />}
            {isProcessing ? 'Connecting to Secure Checkout...' : 'Unlock AI Studio — $10/Month'}
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🔒 Secured by Paystack', '✓ Cancel Anytime', '✓ Instant Access After Payment'].map(t => (
              <span key={t} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t}</span>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ── STUDIO UI (FOR PRO USERS) ──────────────────────────────────────────────
  return (
    <div className="studio-container">
      <div className="studio-header">
        <div className="studio-badge">
          <Sparkles size={14} /> AI POWERED
        </div>
        <h1>Product AI Studio</h1>
        <p>Transform your product photography into professional-grade assets in seconds. Tokens left: <strong>{user.ai_credits}</strong></p>
      </div>

      <div className="studio-tabs">
        <button 
          className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveTab('process')}
        >
          <Wand2 size={18} /> Image Enhancement
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ad-gen' ? 'active' : ''}`}
          onClick={() => setActiveTab('ad-gen')}
        >
          <ImageIcon size={18} /> Ad Background Generator
        </button>
      </div>

      <div className="studio-content glass-card">
        {activeTab === 'process' ? (
          <div className="studio-grid">
            {/* Left side: Upload/Preview */}
            <div className="studio-upload-section">
              <div className="section-title">Step 1: Upload Product</div>
              {!imagePreview ? (
                <div 
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={48} className="upload-icon" />
                  <p>Click or drag to upload product image</p>
                  <span>Supports PNG, JPG, WEBP (Max 10MB)</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={handleImageSelect}
                    accept="image/*"
                  />
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Original" className="preview-img" />
                  <button className="clear-btn" onClick={clearAll}>
                    <Trash2 size={16} /> Change Image
                  </button>
                </div>
              )}
            </div>

            {/* Middle: Actions */}
            <div className="studio-actions-section">
              <div className="section-title">Step 2: Choose Action</div>
              <div className="action-buttons">
                <button 
                  className="action-btn" 
                  disabled={!selectedImage || isProcessing}
                  onClick={() => processImage('remove-bg')}
                >
                  <div className="action-icon"><Wand2 size={24} /></div>
                  <div className="action-text">
                    <strong>Remove Background</strong>
                    <span>Makes background transparent</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button 
                  className="action-btn"
                  disabled={!selectedImage || isProcessing}
                  onClick={() => processImage('upscale')}
                >
                  <div className="action-icon"><Maximize size={24} /></div>
                  <div className="action-text">
                    <strong>Smart Upscale</strong>
                    <span>Increase resolution & quality</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>

              {error && (
                <div className="error-box">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
            </div>

            {/* Right side: Result */}
            <div className="studio-result-section">
              <div className="section-title">Step 3: Export Result</div>
              <div className="result-display glass-card">
                {isProcessing ? (
                  <div className="processing-state">
                    <Loader2 size={40} className="spinner" />
                    <p>AI is working its magic...</p>
                    <span>This usually takes 5-10 seconds</span>
                  </div>
                ) : processedImage ? (
                  <div className="result-preview">
                    <img src={processedImage} alt="Processed" className="result-img" />
                    <button className="btn btn-primary download-btn" onClick={downloadImage}>
                      <Download size={18} /> Download Asset
                    </button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShieldCheck size={40} style={{ opacity: 0.2 }} />
                    <p>Processed image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="ad-gen-container">
             <div className="ad-gen-grid">
                <div className="ad-gen-input">
                   <div className="section-title">Describe your Ad Setting</div>
                   <textarea 
                    placeholder="e.g. A luxurious wooden table in a sunlit modern living room with soft bokeh background..."
                    value={adPrompt}
                    onChange={(e) => setAdPrompt(e.target.value)}
                    rows={5}
                    className="studio-textarea"
                   />
                   <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', height: '54px' }}
                    onClick={generateAd}
                    disabled={isProcessing}
                   >
                     {isProcessing ? <Loader2 className="spinner" /> : <Sparkles size={18} />}
                     {isProcessing ? 'Generating Background...' : 'Generate Ad Background'}
                   </button>
                   <p className="hint-text">
                     <AlertCircle size={14} /> You can use the generated background to place your product on it using our Store Builder.
                   </p>
                </div>
                <div className="ad-gen-result">
                  <div className="result-display glass-card" style={{ height: '100%', minHeight: '300px' }}>
                    {isProcessing ? (
                      <div className="processing-state">
                        <Loader2 size={40} className="spinner" />
                        <p>Painting your unique ad...</p>
                      </div>
                    ) : processedImage ? (
                      <div className="result-preview">
                        <img src={processedImage} alt="Generated Ad" className="result-img" />
                        <button className="btn btn-primary download-btn" onClick={downloadImage}>
                          <Download size={18} /> Download Background
                        </button>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <ImageIcon size={40} style={{ opacity: 0.2 }} />
                        <p>Generated ad background will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <style>{`
        .studio-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .studio-header {
          margin-bottom: 2.5rem;
          text-align: center;
        }
        .studio-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        .studio-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary), #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .studio-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .studio-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1rem 2rem;
          border-radius: 16px;
          border: 1px solid var(--border-medium);
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }
        .tab-btn.active {
          background: white;
          color: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.1);
        }
        .studio-content {
          padding: 2.5rem;
          border-radius: 30px;
          min-height: 600px;
        }
        .studio-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          gap: 2.5rem;
        }
        .section-title {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .upload-dropzone {
          height: 350px;
          border: 2px dashed var(--border-medium);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 2rem;
          background: rgba(248, 250, 252, 0.5);
        }
        .upload-dropzone:hover {
          border-color: var(--primary);
          background: rgba(124, 58, 237, 0.05);
          transform: translateY(-4px);
        }
        .upload-icon {
          color: var(--primary);
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }
        .upload-dropzone p {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .upload-dropzone span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .image-preview-container {
          position: relative;
          height: 350px;
          border-radius: 24px;
          overflow: hidden;
          background: #f1f5f9;
        }
        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .clear-btn {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.75);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid var(--border-medium);
          border-radius: 20px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        .action-btn:hover:not(:disabled) {
          border-color: var(--primary);
          transform: translateX(8px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-icon {
          width: 48px;
          height: 48px;
          background: var(--surface-light);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .action-text {
          flex: 1;
        }
        .action-text strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .action-text span {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .result-display {
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                            linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                            linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .processing-state {
          text-align: center;
        }
        .processing-state p {
          font-weight: 700;
          margin: 1rem 0 0.25rem;
        }
        .processing-state span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .result-preview {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .result-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .download-btn {
          position: absolute;
          bottom: 1.5rem;
          width: 80%;
          border-radius: 100px;
          height: 48px;
        }
        .empty-state {
          text-align: center;
          color: var(--text-muted);
        }
        .ad-gen-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }
        .studio-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--border-medium);
          border-radius: 20px;
          padding: 1.25rem;
          font-size: 1rem;
          font-family: inherit;
          resize: none;
          transition: all 0.3s ease;
        }
        .studio-textarea:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
        .hint-text {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 1.5rem;
          line-height: 1.4;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .error-box {
          margin-top: 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ProductStudio;
