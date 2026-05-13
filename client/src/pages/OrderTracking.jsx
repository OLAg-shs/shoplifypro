import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_STYLES = {
  pending:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   icon: Clock },
  processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   icon: Package },
  shipped:    { color: '#818cf8', bg: 'rgba(129,140,248,0.12)',  icon: Truck },
  delivered:  { color: '#34d399', bg: 'rgba(52,211,153,0.12)',   icon: CheckCircle },
  cancelled:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: XCircle },
};

const MOCK_ORDERS = [
  {
    id: 'ORD-2024-001',
    product: 'Wireless Headphones Pro',
    customer: 'Alex Johnson',
    date: '2024-05-10',
    total: 199.99,
    status: 'delivered',
    items: 1,
    address: '123 Main St, New York, NY 10001',
  },
  {
    id: 'ORD-2024-002',
    product: 'Leather Minimalist Wallet',
    customer: 'Sarah Williams',
    date: '2024-05-11',
    total: 49.99,
    status: 'shipped',
    items: 2,
    address: '456 Oak Ave, Los Angeles, CA 90001',
  },
  {
    id: 'ORD-2024-003',
    product: 'Sport Running Shoes',
    customer: 'Mike Chen',
    date: '2024-05-12',
    total: 129.99,
    status: 'processing',
    items: 1,
    address: '789 Pine Rd, Chicago, IL 60601',
  },
  {
    id: 'ORD-2024-004',
    product: 'Smart Watch Ultra',
    customer: 'Emily Davis',
    date: '2024-05-12',
    total: 349.99,
    status: 'pending',
    items: 1,
    address: '321 Elm St, Houston, TX 77001',
  },
  {
    id: 'ORD-2024-005',
    product: 'Laptop Stand Pro',
    customer: 'Chris Brown',
    date: '2024-05-09',
    total: 79.99,
    status: 'cancelled',
    items: 1,
    address: '654 Maple Dr, Phoenix, AZ 85001',
  },
];

const TRACKING_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderTracking = () => {
  const [orders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

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
                      {order.id}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>· {order.items} item{order.items > 1 ? 's' : ''}</span>
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
      </div>
    </div>
  );
};

export default OrderTracking;
