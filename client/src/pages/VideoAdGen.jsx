import React, { useState } from 'react';
import { Video, Zap, Sparkles, Loader2, Download, ShieldCheck, Lock, CheckCircle, Play } from 'lucide-react';

const VideoAdGen = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isPro = user.subscription_tier === 'pro';
  const [credits, setCredits] = useState(user.ai_credits || 0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/generate-video`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Video generation failed');
      
      const predictionId = data.prediction_id;
      
      // Start polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/generate-video/status/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!statusRes.ok) {
            clearInterval(pollInterval);
            throw new Error('Failed to retrieve video generation status.');
          }
          
          const statusData = await statusRes.json();
          
          if (statusData.status === 'succeeded') {
            clearInterval(pollInterval);
            setVideoUrl(statusData.video_url);
            setIsGenerating(false);
            
            // Deduct locally for instant UI update
            const newCredits = Math.max(0, credits - 5);
            setCredits(newCredits);
            const updatedUser = { ...user, ai_credits: newCredits };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setError(statusData.error || 'Video generation failed.');
            setIsGenerating(false);
          } else {
            console.log(`[Video Gen Status]: ${statusData.status}`);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setError(pollErr.message);
          setIsGenerating(false);
        }
      }, 3000); // Check every 3 seconds

    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleCheckout = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/billing/create-checkout', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (data.authorization_url) window.location.href = data.authorization_url;
      else { alert(data.message); setIsGenerating(false); }
    } catch { setIsGenerating(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          <Video size={13} /> AI VIDEO AD GENERATOR
        </div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>Create Scroll-Stopping<br/>Video Ads in Seconds</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Type a prompt — the AI generates a professional product video ad for TikTok, Instagram Reels, or YouTube Shorts.</p>
      </div>

      {!isPro ? (
        /* ── PRO PAYWALL ── */
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.06))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '28px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(124,58,237,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock size={32} color="#a78bfa" />
          </div>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Pro Feature</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            AI Video Ad Generation is exclusive to Eagle Choice Pro members. Upgrade to get 100 monthly AI credits — each video costs 5 credits.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {['5 Credits per Video', '1080p MP4 Output', 'TikTok Ready Format', 'Early Access'].map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle size={16} style={{ color: '#34d399' }} /> {f}
              </span>
            ))}
          </div>
          <button onClick={handleCheckout} disabled={isGenerating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '1rem 2.5rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(236,72,153,0.5)' }}>
            {isGenerating ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={20} />}
            Upgrade to Pro — $10/Month
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>🔒 Secured by Paystack · Cancel anytime</p>
        </div>
      ) : (
        /* ── PRO USER INTERFACE ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Credit display */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
              ⚡ {credits} credits remaining (5 per video)
            </span>
          </div>

          {/* Prompt box */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />Describe your video ad
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A pair of white sneakers spinning on a neon-lit city street at night, cinematic slow-motion, logo appears at the end"
              rows={4}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: 'white', fontSize: '1rem', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {['Product on a marble surface with soft gold lighting', 'Lifestyle shot in a modern apartment', 'Outdoor adventure with dramatic mountains'].map(ex => (
                <button key={ex} onClick={() => setPrompt(ex)}
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || credits < 5}
            style={{ padding: '1rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isGenerating ? 0.7 : 1 }}>
            {isGenerating ? <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> : <Video size={22} />}
            {isGenerating ? 'Generating your video ad...' : 'Generate Video Ad (5 Credits)'}
          </button>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem', color: '#ef4444', fontSize: '0.9rem' }}>⚠️ {error}</div>}

          {videoUrl && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
              <video src={videoUrl} controls autoPlay style={{ width: '100%', borderRadius: '14px', maxHeight: '500px' }} />
              <a href={videoUrl} download="eagle-choice-video-ad.mp4"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                <Download size={18} /> Download MP4
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VideoAdGen;
