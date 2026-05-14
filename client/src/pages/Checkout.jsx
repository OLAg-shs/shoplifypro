import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePaystackPayment } from 'react-paystack';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Lock, Package } from 'lucide-react';
import { api } from '../utils/api';

const Checkout = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [processing, setProcessing] = useState(false);

  // Note: For production, this should be an env variable!
  const config = {
    reference: (new Date()).getTime().toString(),
    email: user.email || 'customer@eaglechoice.com',
    amount: Math.round(cartTotal * 100), // Paystack expects amount in kobo/cents
    publicKey: 'pk_test_samplekeyhere', // This is a placeholder! The user must replace this.
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = async (reference) => {
    setProcessing(true);
    try {
      // Create order in backend
      const orderPayload = {
        items: cartItems,
        total_amount: cartTotal,
        shipping_address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        payment_reference: reference.reference
      };

      await api.post('/orders/checkout', orderPayload);
      clearCart();
      navigate('/orders/tracking');
    } catch (err) {
      console.error("Failed to create order:", err);
      alert("Payment successful but order creation failed. Please contact support.");
      setProcessing(false);
    }
  };

  const handleClose = () => {
    console.log('Payment closed');
  };

  const checkout = (e) => {
    e.preventDefault();
    if (!address.street || !address.city) {
      alert("Please enter a valid shipping address.");
      return;
    }
    initializePayment(handleSuccess, handleClose);
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Package size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Browse Stores</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ArrowLeft size={16} /> Back to Shopping
      </button>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Secure Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        {/* Left Col: Cart & Address */}
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-medium)' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={24} color="#94a3b8" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h3>
                      <div style={{ fontWeight: 800 }}>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>${item.price} each</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Shipping Address</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Street Address</label>
                <input type="text" className="input-field" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="123 Main St" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>City</label>
                  <input type="text" className="input-field" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="New York" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>State/Province</label>
                  <input type="text" className="input-field" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="NY" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>ZIP / Postal Code</label>
                <input type="text" className="input-field" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="10001" required />
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div>
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1.5rem' }}>
              <span>Taxes</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>$0.00</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={checkout}
              disabled={processing}
              className="btn btn-primary" 
              style={{ width: '100%', height: '54px', fontSize: '1.05rem', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}
            >
              {processing ? 'Processing...' : (
                <><CreditCard size={18} /> Pay ${cartTotal.toFixed(2)} with Paystack</>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Lock size={12} /> Payments are secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
