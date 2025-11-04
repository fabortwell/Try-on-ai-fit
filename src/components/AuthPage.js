import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, CheckCircle, Sparkles } from 'lucide-react';
import signOnImage from '../images/sign_on.webp';

const AuthPage = ({ onSignIn }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isSignIn && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const endpoint = isSignIn ? 'signin' : 'signup';
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isSignIn ? 'sign in' : 'sign up'}`);
      }

      const userData = await response.json();
      
      // Store user data with token
      const user = {
        id: userData.user.id,
        email: userData.user.email,
        username: userData.user.email.split('@')[0], // Generate username from email
        token: userData.token,
        createdAt: userData.user.createdAt
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      setSuccess(userData.message || `Successfully ${isSignIn ? 'signed in' : 'signed up'}!`);
      
      setTimeout(() => {
        onSignIn(user);
      }, 1000);

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({ email: '', password: '', confirmPassword: '' });
    setErrors({});
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <img
          src={signOnImage}
          alt="Fashion Model"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-darkBg/50 to-accent/40">
          <div className="absolute inset-0 bg-gradient-to-t from-darkBg/80 via-transparent to-darkBg/70" />
          
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <h2 className="text-6xl font-black tracking-tight bg-gradient-to-r from-white to-brand2 bg-clip-text text-transparent leading-tight">
                STYLE<br/>REIMAGINED
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:w-3/5 flex items-center justify-center px-4 py-6 bg-gradient-to-br from-lightBg via-white to-gray-50/80">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-xl">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div className="absolute -inset-2 bg-primary/20 rounded-xl blur-md animate-pulse"></div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                  TryFit AI
                </h1>
                <p className="text-grayText text-xs font-medium mt-1">
                  AI-Powered Virtual Try-On
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-bold text-darkText mb-2">
                {isSignIn ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-grayText text-sm">
                {isSignIn 
                  ? 'Sign in to continue your fashion journey' 
                  : 'Join us and revolutionize your style'
                }
              </p>
            </div>
          </div>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl mb-4 animate-fade-in">
              <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
              <span className="text-green-700 text-sm font-medium">{success}</span>
            </div>
          )}

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl mb-4 animate-fade-in">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-red-700 text-sm font-medium">{errors.submit}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm bg-white/95">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-darkText">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Mail className="text-grayText group-focus-within:text-primary" size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all duration-200 text-base text-darkText placeholder-gray-400 ${
                      errors.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs font-medium animate-fade-in mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-darkText">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                    <Lock className="text-grayText group-focus-within:text-primary" size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all duration-200 text-base text-darkText placeholder-gray-400 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="text-grayText hover:text-primary" size={18} />
                    ) : (
                      <Eye className="text-grayText hover:text-primary" size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs font-medium animate-fade-in mt-1">{errors.password}</p>
                )}
              </div>
              {!isSignIn && (
                <div className="space-y-2 animate-fade-in">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-darkText">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                      <Lock className="text-grayText group-focus-within:text-primary" size={18} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all duration-200 text-base text-darkText placeholder-gray-400 ${
                        errors.confirmPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-xs font-medium animate-fade-in mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-bold text-white focus:outline-none focus:ring-2 transition-all duration-300 text-base mt-4 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed shadow-inner'
                    : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">{isSignIn ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    <span className="text-sm">{isSignIn ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </button>
            </form>
            <div className="mt-6 text-center border-t border-gray-100 pt-6">
              <p className="text-grayText text-sm">
                {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={switchMode}
                  className="text-primary hover:text-accent font-bold transition-colors duration-200 hover:underline text-sm"
                >
                  {isSignIn ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
            {!isSignIn && (
              <div className="mt-4 p-3 bg-gradient-to-r from-lightBg to-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-grayText text-center">
                  By creating an account, you agree to our{' '}
                  <button className="text-primary hover:text-accent font-semibold underline">Terms</button>{' '}
                  and{' '}
                  <button className="text-primary hover:text-accent font-semibold underline">Privacy</button>
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-grayText">
              &copy; 2024 TryFit AI. The future of fashion is here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;