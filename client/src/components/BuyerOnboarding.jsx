import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, PackageSearch } from 'lucide-react';
import { api } from '../utils/api';

const questions = [
  {
    id: 'categories',
    question: "What are you primarily looking to buy?",
    options: ["Electronics & Gadgets", "Fashion & Apparel", "Home & Furniture", "Beauty & Health", "Everything!"]
  },
  {
    id: 'frequency',
    question: "How often do you usually shop online?",
    options: ["Weekly", "Monthly", "A few times a year"]
  },
  {
    id: 'priorities',
    question: "What matters most to you when shopping?",
    options: ["Fast Delivery", "Best Prices", "Premium Quality", "Brand Authenticity"]
  }
];

const BuyerOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is welcome screen
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: option }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      // We save preferences to the user profile
      const currentAnswers = { ...answers };
      await api.put(`/auth/preferences`, currentAnswers); // We will create this endpoint
      
      // Update local storage so we don't show it again
      localStorage.setItem(`onboarding_${user.id}`, 'true');
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      console.error("Failed to save preferences", err);
      // Fallback
      localStorage.setItem(`onboarding_${user.id}`, 'true');
      onComplete();
    }
  };

  if (currentStep === -1) {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card animate-up">
          <div style={{ width: '60px', height: '60px', background: '#f5f3ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
             <Sparkles size={30} color="#7c3aed" />
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Welcome to Eagle Choice, {user.name?.split(' ')[0]}!</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            I'm your AI Shopping Assistant. To give you the best personalized marketplace experience, let's set up your profile.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', borderRadius: '100px', height: '54px', fontSize: '1.1rem' }} onClick={() => setCurrentStep(0)}>
            Let's Get Started <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card animate-up" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
           <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '50px', height: '50px', borderRadius: '50%', border: '4px solid #f3f4f6', borderTopColor: '#7c3aed' }} />
           <h3 style={{ fontSize: '1.5rem' }}>Personalizing your dashboard...</h3>
           <p style={{ color: 'var(--text-muted)' }}>Analyzing thousands of stores for you.</p>
        </div>
      </div>
    );
  }

  const q = questions[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card animate-up">
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem' }}>
          {questions.map((_, idx) => (
            <div key={idx} style={{ flex: 1, height: '4px', borderRadius: '4px', background: idx <= currentStep ? '#7c3aed' : '#e5e7eb', transition: 'background 0.3s ease' }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <PackageSearch size={18} /> Question {currentStep + 1} of {questions.length}
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', lineHeight: 1.3 }}>{q.question}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {q.options.map((opt) => (
            <button 
              key={opt}
              onClick={() => handleSelect(opt)}
              className="onboarding-option"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .onboarding-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .onboarding-card {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .onboarding-option {
          width: 100%;
          padding: 1.25rem 1.5rem;
          text-align: left;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 1.05rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .onboarding-option:hover {
          border-color: #7c3aed;
          background: #f5f3ff;
          color: #7c3aed;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default BuyerOnboarding;
