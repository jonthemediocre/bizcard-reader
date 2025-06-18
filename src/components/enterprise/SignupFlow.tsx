// SignupFlow Component - THEPLAN.md Enterprise User Journey Implementation
// Implements: Free Trial Signup | Google OAuth | /api/auth/signup (POST) | Free

import React, { useState } from 'react';
import { GoogleAuth } from './GoogleAuth';

interface SignupFormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  company?: string;
  agreeToTerms: boolean;
  marketingOptIn: boolean;
}

interface SignupFlowProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    company: '',
    agreeToTerms: false,
    marketingOptIn: false
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'email' | 'verify' | 'complete'>('method');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = 'You must agree to the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          provider: 'email',
          tier: 'free',
          metadata: {
            company: formData.company,
            marketingOptIn: formData.marketingOptIn,
            signupSource: 'web'
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Store token and redirect to onboarding
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setStep('complete');
      onSuccess(data.user, data.token);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (googleData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: googleData.email,
          name: googleData.name,
          provider: 'google',
          googleId: googleData.id,
          tier: 'free',
          metadata: {
            avatar: googleData.picture,
            locale: googleData.locale,
            signupSource: 'google'
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Google signup failed');
      }

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setStep('complete');
      onSuccess(data.user, data.token);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h2>
        <p className="text-gray-600">
          Get 50 business card scans per month, forever free. No credit card required.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleAuth 
          onSuccess={handleGoogleSignup}
          onError={onError}
          text="Continue with Google"
          className="w-full"
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={() => setStep('email')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue with Email
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </div>
    </div>
  );

  const renderEmailForm = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Start scanning business cards instantly</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleEmailSignup(); }} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="john@company.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Create a strong password"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1 mr-2"
            />
            <span className={`text-sm ${errors.terms ? 'text-red-500' : 'text-gray-600'}`}>
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.marketingOptIn}
              onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
              className="mt-1 mr-2"
            />
            <span className="text-sm text-gray-600">
              Send me product updates and tips (optional)
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Account...' : 'Start Free Trial'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setStep('method')}
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          ← Back to signup options
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BizCard Enterprise!</h2>
        <p className="text-gray-600">
          Your free trial is ready. Start scanning business cards and building valuable connections.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">What's included in your free trial:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ 50 business card scans per month</li>
          <li>✓ Basic OCR and contact extraction</li>
          <li>✓ Personal dashboard</li>
          <li>✓ CSV export</li>
          <li>✓ Community support</li>
        </ul>
      </div>

      <button
        onClick={() => window.location.href = '/dashboard'}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mb-3"
      >
        Go to Dashboard
      </button>

      <p className="text-sm text-gray-500">
        Need more features?{' '}
        <a href="/pricing" className="text-blue-600 hover:text-blue-500">
          Upgrade to Pro
        </a>
      </p>
    </div>
  );

  switch (step) {
    case 'method':
      return renderMethodSelection();
    case 'email':
      return renderEmailForm();
    case 'complete':
      return renderComplete();
    default:
      return renderMethodSelection();
  }
}; 