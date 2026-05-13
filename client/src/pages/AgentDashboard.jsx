import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Link as LinkIcon, 
  Copy, CheckCircle, ArrowRight, BarChart3, 
  Briefcase, Award, Zap
} from 'lucide-react';
import { api } from '../utils/api';

const AgentDashboard = () => {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalSales: 0,
    earnings: 0,
    commissionRate: 5
  });
  const [copied, setCopied] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const referralLink = `https://eaglechoice.com/ref/${user.id?.substring(0, 8)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div className="animate-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem', border: '1px solid #fde68a' }}>
            PRO AGENT NETWORK
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Partner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your referral network and track your growing commissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={20} color="#f59e0b" />
            <span style={{ fontWeight: 700 }}>Gold Tier Partner</span>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="card animate-up delay-1" style={{ marginBottom: '3rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.75rem', marginBottom: '1rem' }}>Your Partnership Engine</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Share your unique referral link to start earning commissions on every sale made through your network.
            </p>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, padding: '0 1rem', outline: 'none', fontSize: '0.95rem' }} 
              />
              <button 
                onClick={copyToClipboard}
                style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
               <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={64} color="rgba(255,255,255,0.4)" />
               </div>
               <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <Zap size={24} color="white" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="animate-up delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card hover-lift" style={{ padding: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase' }}>Commission Earned</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-accent)' }}>$0.00</div>
          <div style={{ marginTop: '1rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>PAID MONTHLY</div>
        </div>
        
        <div className="card hover-lift" style={{ padding: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase' }}>Network Size</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>0</div>
          <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active referrals</div>
        </div>

        <div className="card hover-lift" style={{ padding: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase' }}>Conversion Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>0.0%</div>
          <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Across all links</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No referral activity recorded yet.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Program Features</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--primary-accent)' }}><DollarSign size={24} /></div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Base 5% Commission</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Earn on every product purchased through your link.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: '#10b981' }}><BarChart3 size={24} /></div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Real-time Analytics</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track clicks and conversions as they happen.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: '#f59e0b' }}><Briefcase size={24} /></div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Store Partnerships</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Apply for exclusive brand ambassadorships.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
