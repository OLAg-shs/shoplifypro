import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Star, ShieldCheck, 
  Store as StoreIcon, ArrowRight, Package
} from 'lucide-react';
import { api } from '../utils/api';
import BuyerOnboarding from '../components/BuyerOnboarding';

const BuyerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    // Check onboarding status
    const hasOnboarded = localStorage.getItem(`onboarding_${user.id}`);
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
    
    fetchMarketplace();
  }, [user.id]);

  const fetchMarketplace = async () => {
    try {
      const data = await api.get('/stores');
      setStores(data || []);
    } catch (err) {
      console.error("Failed to fetch stores", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {showOnboarding && (
        <BuyerOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Hero Section */}
      <div className="animate-up" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        borderRadius: '24px', 
        padding: '4rem 3rem', 
        color: 'white',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Discover Unique Stores
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
            Explore thousands of verified sellers on Eagle Choice. Handpicked products, secure checkout, and lightning-fast delivery.
          </p>
          
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '16px', padding: '0.5rem', width: '100%', maxWidth: '450px'
          }}>
            <div style={{ padding: '0 1rem', color: '#94a3b8' }}><Search size={20} /></div>
            <input 
              type="text" 
              placeholder="Search stores, brands, or categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                background: 'transparent', border: 'none', color: 'white', 
                width: '100%', padding: '1rem 0', outline: 'none', fontSize: '1rem' 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="animate-up delay-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Top Rated Stores</h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Based on your personalized preferences</p>
          </div>
          <Link to="/orders/tracking" className="btn btn-secondary" style={{ borderRadius: '12px' }}>
            <ShoppingBag size={18} /> My Orders
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: 'var(--primary-accent)', borderRadius: '50%' }} />
            Loading stores...
          </div>
        ) : filteredStores.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed var(--border-medium)' }}>
            <StoreIcon size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No stores found</h3>
            <p style={{ color: 'var(--text-muted)' }}>We couldn't find any stores matching your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredStores.map((store, idx) => (
              <div 
                key={store.id} 
                className="hover-lift"
                onClick={() => navigate(`/store/${store.slug}`)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid var(--border-medium)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  animation: `fadeIn 0.5s ease forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(10px)'
                }}
              >
                {/* Store Cover (Mocked based on branding) */}
                <div style={{ 
                  height: '140px', 
                  background: store.branding?.primaryColor || '#2563eb',
                  position: 'relative'
                }}>
                  {store.is_verified && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#059669' }}>
                      <ShieldCheck size={14} /> VERIFIED
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div style={{ padding: '1.5rem', position: 'relative' }}>
                  {/* Store Logo */}
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '16px', background: 'white', 
                    border: '4px solid white', position: 'absolute', top: '-32px', left: '1.5rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: store.branding?.primaryColor || '#2563eb'
                  }}>
                    {store.name.charAt(0)}
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {store.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {store.description || 'Welcome to our official store on Eagle Choice.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" /> 4.9
                      </div>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem' }}>
                        <Package size={14} /> {(Math.random() * 50 + 5).toFixed(0)} Products
                      </div>
                      <div style={{ marginLeft: 'auto', color: 'var(--primary-accent)' }}>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
