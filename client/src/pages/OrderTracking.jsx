import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { api } from '../utils/api';

const STATUS_STYLES = {
  pending:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   icon: Clock },
  processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   icon: Package },
  shipped:    { color: '#818cf8', bg: 'rgba(129,140,248,0.12)',  icon: Truck },
  out_for_delivery: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Truck },
  delivered:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',   icon: CheckCircle },
  cancelled:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: XCircle },
};

const TRACKING_STEPS = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user.role === 'seller';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const endpoint = isSeller ? '/orders/store' : '/orders/myorders';
        const data = await api.get(endpoint);
        
        // Format API response to match UI needs
        const formattedOrders = data.map(o => ({
          id: o.id,
          product: o.order_items?.[0]?.products?.name || 'Multiple Items',
          customer: o.users?.name || user.name,
          date: new Date(o.created_at).toLocaleDateString(),
          total: parseFloat(o.total_amount),
          status: o.order_status,
          items: o.order_items?.length || 0,
          address: o.shipping_address,
          image: o.order_items?.[0]?.products?.images?.[0] || null
        }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isSeller, user.name]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Could not update order status.");
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getStepIndex = (status) => TRACKING_STEPS.indexOf(status);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <Truck size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ margin: 0 }}>Order Tracking</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Track and manage all your customer orders in real-time
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(STATUS_STYLES).map(([status, { color, bg, icon: Icon }]) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              style={{
                background: filter === status ? bg : 'rgba(15,23,42,0.4)',
                border: `1px solid ${filter === status ? color + '50' : 'var(--glass-border)'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={20} style={{ color, marginBottom: '6px' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status}</div>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>
            {filter === 'all' ? `All Orders (${filteredOrders.length})` : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders (${filteredOrders.length})`}
          </h2>
          {filter !== 'all' && (
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setFilter('all')}>
              Show All
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={32} className="spinner" style={{ margin: '0 auto 1rem', display: 'block' }} />
            Fetching orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ color: 'var(--glass-border)', margin: '0 auto 1rem', display: 'block' }} />
            No orders found.
          </div>
        ) : (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map(order => {
            const { color, bg, icon: Icon } = STATUS_STYLES[order.status];
            const isExpanded = selectedOrder === order.id;
            const stepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                style={{
                  background: 'rgba(15,23,42,0.4)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Order Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      #{order.id.substring(0,8).toUpperCase()}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>· {order.items} item{order.items !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.product} · {order.customer}</div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {order.date}
                  </div>

                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ${order.total.toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      background: bg,
                      color,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: `1px solid ${color}30`,
                      textTransform: 'capitalize',
                    }}>
                      <Icon size={13} />
                      {order.status}
                    </div>
                    {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.25rem 1.25rem',
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '1.25rem',
                    animation: 'fadeIn 0.2s ease-out',
                  }}>
                    {/* Progress Bar (only for non-cancelled) */}
                    {order.status !== 'cancelled' && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          {TRACKING_STEPS.map((step, i) => (
                            <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: i <= stepIdx ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.1)',
                                border: `2px solid ${i <= stepIdx ? 'var(--primary)' : 'var(--glass-border)'}`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto 6px',
                                transition: 'all 0.3s ease',
                              }}>
                                {i <= stepIdx && <CheckCircle size={14} color="white" />}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: i <= stepIdx ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'capitalize', fontWeight: i === stepIdx ? 600 : 400 }}>
                                {step}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Progress Line */}
                        <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '0 14px', marginTop: '-32px', zIndex: 0 }}>
                          <div style={{
                            height: '100%',
                            width: `${(stepIdx / (TRACKING_STEPS.length - 1)) * 100}%`,
                            background: 'var(--gradient-brand)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SHIPPING ADDRESS</div>
                        <div style={{ fontSize: '0.9rem' }}>{order.address}</div>
                        
                        {isSeller && (
                          <div style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>UPDATE STATUS</div>
                            <select 
                              className="input-field" 
                              value={order.status} 
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              style={{ width: '100%', maxWidth: '200px', fontSize: '0.9rem', padding: '8px' }}
                            >
                              {TRACKING_STEPS.map(step => (
                                <option key={step} value={step}>{step.toUpperCase()}</option>
                              ))}
                              <option value="cancelled">CANCELLED</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER TOTAL</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>${order.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
