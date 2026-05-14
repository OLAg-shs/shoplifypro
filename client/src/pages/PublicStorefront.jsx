import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, Star, ArrowLeft, Package, Loader, AlertCircle, Store, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, branding }) => {
  const [hovered, setHovered] = useState(false);
  const primary = branding?.primaryColor || '#2563eb';
  const bg = branding?.backgroundColor || '#ffffff';
  const text = branding?.textColor || '#0f172a';
  const font = branding?.fontFamily || 'Inter, sans-serif';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg === '#ffffff' ? 'white' : bg,
        border: `1px solid ${primary}20`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px ${primary}20` : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        fontFamily: font,
      }}
    >
      {/* Product Image */}
      <div style={{ width: '100%', height: '240px', background: `${primary}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {product.images && product.images[0] ? (
          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        ) : (
          <Package size={48} style={{ color: `${primary}40` }} />
        )}
        {product.is_featured && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '100px', background: primary, color: 'white', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Featured
          </div>
        )}
        {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '100px', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: '800' }}>
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '1.25rem' }}>
        {product.category && (
          <div style={{ fontSize: '0.72rem', color: primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{product.category}</div>
        )}
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: text, marginBottom: '4px', lineHeight: 1.3, fontFamily: font }}>{product.name}</h3>
        {product.description && (
          <p style={{ fontSize: '0.82rem', color: `${text}80`, marginBottom: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: primary }}>${parseFloat(product.price).toFixed(2)}</div>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through' }}>${parseFloat(product.compare_price).toFixed(2)}</div>
            )}
          </div>
          {product.stock > 0 ? (
            <button style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: primary, color: 'white', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s ease', opacity: hovered ? 1 : 0.85 }}>
              <ShoppingCart size={13} /> Add
            </button>
          ) : (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Public Storefront ─────────────────────────────────────────────────────────
const PublicStorefront = () => {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/stores/slug/${slug}`);
        setStore(data);
        setProducts(data.products?.filter(p => p.is_active) || []);
      } catch (err) {
        setError(err.message || 'Store not found');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#94a3b8' }}>
        <Loader size={32} className="spinner" />
        <p style={{ margin: 0 }}>Loading store…</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={48} style={{ color: '#e2e8f0' }} />
        <h2 style={{ margin: 0, color: '#374151' }}>Store not found</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>This store may not exist or is not yet published.</p>
        <Link to="/" style={{ padding: '10px 24px', borderRadius: '100px', background: '#0f172a', color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
          ← Back to Eagle Choice
        </Link>
      </div>
    );
  }

  const branding = store.branding || {};
  const primary = branding.primaryColor || '#2563eb';
  const bg = branding.backgroundColor || '#ffffff';
  const textColor = branding.textColor || '#0f172a';
  const font = branding.fontFamily || 'Inter, sans-serif';

  // Categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtered products
  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: font, color: textColor }}>

      {/* ── Navigation ── */}
      <nav style={{
        padding: '0 5%', height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: `${bg}ee`, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: `1px solid ${primary}15`, transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={18} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: textColor, letterSpacing: '-0.02em', fontFamily: font }}>{store.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
            <a href="#products" style={{ color: `${textColor}70`, textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = primary}
              onMouseLeave={e => e.currentTarget.style.color = `${textColor}70`}>
              Products
            </a>
            <a href="#about" style={{ color: `${textColor}70`, textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = primary}
              onMouseLeave={e => e.currentTarget.style.color = `${textColor}70`}>
              About
            </a>
          </div>
          <button style={{
            position: 'relative', background: `${primary}15`, border: 'none', color: primary,
            width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', borderRadius: '50%', background: primary, color: 'white', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</div>
            )}
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ padding: '100px 5% 80px', textAlign: 'center', background: `linear-gradient(180deg, ${primary}06 0%, transparent 100%)` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '100px', background: `${primary}15`, color: primary, fontSize: '0.8rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '0.04em' }}>
          <span>✦</span> Now Open
        </div>
        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '20px', color: textColor, fontFamily: font }}>
          {store.name}
        </h2>
        {store.description && (
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: `${textColor}60`, maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            {store.description}
          </p>
        )}
        <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', borderRadius: '100px', background: primary, color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s ease', fontFamily: font }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${primary}40`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
          Shop Now <ChevronRight size={16} />
        </a>
      </section>

      {/* ── Products Section ── */}
      <section id="products" style={{ padding: '0 5% 80px' }}>
        {/* Filters Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '8px 18px', borderRadius: '100px', border: `1.5px solid ${activeCategory === cat ? primary : `${textColor}20`}`,
                background: activeCategory === cat ? primary : 'transparent',
                color: activeCategory === cat ? 'white' : `${textColor}70`,
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: font
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: `${textColor}06`, border: `1px solid ${textColor}15`, borderRadius: '12px', padding: '8px 14px' }}>
            <Search size={16} style={{ color: `${textColor}40` }} />
            <input
              type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', color: textColor, fontFamily: font, width: '200px' }}
            />
          </div>
        </div>

        {/* Product Count */}
        <div style={{ marginBottom: '1.5rem', color: `${textColor}50`, fontSize: '0.875rem', fontWeight: '600' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && ` in ${activeCategory}`}
          {search && ` matching "${search}"`}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: `${textColor}40` }}>
            <Package size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>No products found</p>
            {search && <p style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>Try a different search term or category</p>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} branding={branding} />
            ))}
          </div>
        )}
      </section>

      {/* ── About Section ── */}
      <section id="about" style={{ padding: '80px 5%', background: `${primary}06`, borderTop: `1px solid ${primary}10` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Store size={26} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px', color: textColor, fontFamily: font }}>{store.name}</h2>
          <p style={{ color: `${textColor}70`, fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
            {store.description || `Welcome to ${store.name}. Browse our curated selection of products.`}
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 5%', borderTop: `1px solid ${primary}10`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: `${textColor}40`, fontWeight: '600' }}>
          © {new Date().getFullYear()} {store.name} · Powered by Eagle Choice
        </div>
        <Link to="/" style={{ fontSize: '0.8rem', color: primary, textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={12} /> Eagle Choice Marketplace
        </Link>
      </footer>
    </div>
  );
};

export default PublicStorefront;
