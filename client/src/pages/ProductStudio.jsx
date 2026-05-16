import React, { useState, useRef } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

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
    return (
      <div className="paywall-container">
        <div className="paywall-hero">
          <div className="paywall-badge"><Sparkles size={16} /> EAGLE CHOICE PRO</div>
          <h1>Unlock the Ultimate <br/>AI Video & Photo Studio</h1>
          <p>Stop paying thousands for professional photoshoots. Generate studio-quality backgrounds, upscaled images, and soon, dynamic video ads—all in one click.</p>
          
          <button className="upgrade-btn" onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? <Loader2 size={24} className="spinner" /> : <ShieldCheck size={24} />}
            {isProcessing ? 'Connecting to Secure Checkout...' : 'Upgrade Now - $10 / Month'}
          </button>
          <span className="secure-text">Secure payment via Paystack. Cancel anytime.</span>
        </div>

        <div className="feature-showcase-grid">
          <div className="showcase-card">
            <div className="showcase-icon"><ImageIcon size={32} /></div>
            <h3>Infinite Backgrounds</h3>
            <p>Place your raw products into any scene imaginable. Marble podiums, sunny beaches, minimalist studios—just type what you want.</p>
          </div>
          <div className="showcase-card">
            <div className="showcase-icon"><Maximize size={32} /></div>
            <h3>Smart Upscaling</h3>
            <p>Turn blurry smartphone photos into razor-sharp 4K assets that command premium prices from buyers.</p>
          </div>
          <div className="showcase-card" style={{ borderColor: 'var(--primary)' }}>
            <div className="showcase-icon" style={{ color: 'var(--primary)' }}><Sparkles size={32} /></div>
            <h3>Coming Soon: Video Ads</h3>
            <p>Pro members will get early access to our Text-to-Video engine, generating scroll-stopping TikTok and Instagram ads instantly.</p>
          </div>
        </div>

        <style>{`
          .paywall-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .paywall-hero {
            text-align: center;
            max-width: 700px;
            margin-top: 4rem;
            margin-bottom: 4rem;
          }
          .paywall-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1));
            color: var(--primary);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(124, 58, 237, 0.2);
          }
          .paywall-hero h1 {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(to right, white, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .paywall-hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 2.5rem;
          }
          .upgrade-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            padding: 1.2rem;
            background: linear-gradient(135deg, #7c3aed, #ec4899);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.2rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px -10px rgba(236, 72, 153, 0.5);
          }
          .upgrade-btn:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -10px rgba(236, 72, 153, 0.7);
          }
          .secure-text {
            display: block;
            margin-top: 1rem;
            font-size: 0.85rem;
            color: var(--text-muted);
          }
          .feature-showcase-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            width: 100%;
          }
          .showcase-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            padding: 2.5rem;
            border-radius: 24px;
            transition: all 0.3s ease;
          }
          .showcase-card:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-5px);
          }
          .showcase-icon {
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 1.5rem;
          }
          .showcase-card h3 {
            color: white;
            font-size: 1.3rem;
            margin-bottom: 1rem;
          }
          .showcase-card p {
            color: var(--text-muted);
            line-height: 1.6;
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
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
