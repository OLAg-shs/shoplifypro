import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, TrendingUp, ShieldCheck, ArrowRight, Search, Globe, 
  Zap, Users, Sparkles, Layout, BarChart3, Wand2, ChevronRight,
  MousePointer2, Layers, Cpu, Smartphone
} from 'lucide-react';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#020617', color: '#f8fafc', overflowX: 'hidden' }}>
      {/* ── HERO SECTION ── */}
      <section style={{ 
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 4rem',
        background: 'radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
      }}>
        {/* Animated Background Blobs */}
        <div className="animate-float" style={{ position: 'absolute', top: '10%', right: '15%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-slide-right">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 20px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '100px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#38bdf8',
              marginBottom: '2rem'
            }}>
              <Sparkles size={16} /> 
              <span className="shimmer-text">Next-Gen Multi-Vendor Infrastructure</span>
            </div>

            <h1 style={{ 
              fontSize: '5.5rem', 
              fontWeight: '900', 
              lineHeight: '0.95',
              letterSpacing: '-0.06em',
              marginBottom: '2.5rem',
              color: 'white'
            }}>
              Build your <br/>
              <span style={{ 
                background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Digital Empire.</span>
            </h1>

            <p style={{ 
              fontSize: '1.35rem', 
              color: '#94a3b8', 
              lineHeight: '1.7', 
              marginBottom: '3.5rem',
              maxWidth: '600px'
            }}>
              The definitive platform for high-performance e-commerce. Scale globally with AI-driven store building, instant background removal, and unified vendor management.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Launch Store <ArrowRight size={20} />
              </Link>
              <Link to="/login/buyer" className="btn btn-secondary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '14px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                Explore Marketplace
              </Link>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>150k+</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Active Sellers</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>$2.4B+</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Gross Volume</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>99.9%</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Uptime SLA</div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in" style={{ position: 'relative' }}>
            <div style={{ 
              position: 'relative', 
              zIndex: 2, 
              borderRadius: '30px', 
              overflow: 'hidden', 
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2074&auto=format&fit=crop" 
                alt="Digital Commerce" 
                style={{ width: '100%', display: 'block' }} 
              />
              {/* Overlay Glass Panel */}
              <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                left: '20px', 
                right: '20px', 
                padding: '20px', 
                background: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(10px)', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Live Analytics</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>+24% Growth this week</div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '100px', height: '100px', background: '#2563eb', borderRadius: '20px', opacity: 0.2, transform: 'rotate(-15deg)', zIndex: 1 }}></div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section style={{ padding: '10rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Everything you need to dominate.</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            We've built the most powerful suite of e-commerce tools ever assembled. 
            Automated, intelligent, and blazing fast.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gridAutoRows: 'minmax(300px, auto)',
          gap: '2rem'
        }}>
          {/* Feature 1: AI Builder */}
          <div className="bento-card" style={{ gridColumn: 'span 8', padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#38bdf8', marginBottom: '1.5rem' }}><Layout size={40} /></div>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' }}>AI Store Builder</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '500px', lineHeight: '1.7' }}>
                Our proprietary AI analyzes your brand identity and products to generate a high-converting storefront in under 60 seconds. No coding, no headaches.
              </p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>DYNAMIC LAYOUTS</span>
              <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>AUTO-BRANDING</span>
            </div>
          </div>

          {/* Feature 2: Speed */}
          <div className="bento-card" style={{ gridColumn: 'span 4', padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: '#f59e0b', marginBottom: '1.5rem' }}><Zap size={40} /></div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Instant Load</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
              Optimized at the edge. Your storefront loads in under 500ms globally, ensuring zero drop-off from eager customers.
            </p>
          </div>

          {/* Feature 3: Visual Intelligence */}
          <div className="bento-card" style={{ gridColumn: 'span 4', padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: '#10b981', marginBottom: '1.5rem' }}><Wand2 size={40} /></div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Visual AI</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
              Automatically remove backgrounds and enhance lighting for every product image you upload. Professional studio quality, instantly.
            </p>
          </div>

          {/* Feature 4: Unified Dashboard */}
          <div className="bento-card" style={{ gridColumn: 'span 8', padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}><Cpu size={40} /></div>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' }}>Unified Operations</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.15rem', lineHeight: '1.7' }}>
                One dashboard to rule them all. Manage inventory, orders, payments, and multi-vendor logistics without ever switching tabs.
              </p>
            </div>
            <div style={{ flex: 1, padding: '2rem', background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                 <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}></div>
                 <div style={{ width: '20%', height: '10px', background: '#8b5cf6', borderRadius: '5px' }}></div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                 <div style={{ width: '40%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}></div>
                 <div style={{ width: '30%', height: '10px', background: '#8b5cf6', borderRadius: '5px' }}></div>
               </div>
               <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section style={{ 
        padding: '12rem 4rem', 
        textAlign: 'center', 
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="hero-gradient" style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: 0 }}></div>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.05em' }}>Ready to build your empire?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.5rem', marginBottom: '4rem', lineHeight: '1.6' }}>
            Join the elite network of sellers building the future of commerce. 
            Launch your vision today.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', borderRadius: '16px', background: 'white', color: '#020617', fontWeight: 800 }}>
              Get Started Now
            </Link>
            <Link to="/login/buyer" className="btn btn-secondary" style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              Browse Stores
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;