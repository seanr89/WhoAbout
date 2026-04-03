import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'annually'>('monthly');

  const pricingTiers = [
    {
      name: 'Starter',
      monthlyPrice: '$9',
      annualPrice: '$89',
      description: 'Perfect for small teams getting started.',
      features: ['Find available desks', 'Standard booking', 'Basic support'],
      buttonText: 'Get Started',
      buttonBg: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50',
    },
    {
      name: 'Pro',
      monthlyPrice: '$29',
      annualPrice: '$290',
      description: 'Ideal for growing companies needing coordination.',
      features: ['Find & book any desk', 'Priority booking', 'Team coordination', 'Advanced analytics'],
      buttonText: 'Start Free Trial',
      buttonBg: 'bg-indigo-600 text-white hover:bg-indigo-700',
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: '$99',
      annualPrice: '$990',
      description: 'For large organizations with complex needs.',
      features: ['All Pro features', 'Custom integrations', '24/7 dedicated support', 'SSO'],
      buttonText: 'Contact Sales',
      buttonBg: 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full text-center space-y-12">
        <div className="pt-10">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl">
            Welcome to WhoAbout
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            The modern office desk booking system designed to streamline your hybrid work experience.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 sm:p-12 text-left mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Why WhoAbout?
          </h2>
          <ul className="space-y-4 text-slate-600 mb-8">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Easily find and book available desks in your office locations.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Manage your bookings efficiently with a user-friendly dashboard.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Coordinate with colleagues and view shared resources in real-time.</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <Link
              to="/login"
              className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex justify-center py-3 px-8 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your team's hybrid work needs. No hidden fees.
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="relative flex bg-slate-200 rounded-full p-1">
              <button
                className={`relative w-32 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('monthly')}
              >
                Monthly
              </button>
              <button
                className={`relative w-32 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === 'annually' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('annually')}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col bg-white rounded-2xl shadow-xl p-8 text-left relative ${
                  tier.popular ? 'border-2 border-indigo-500 transform md:-translate-y-4' : 'border border-slate-200'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 mb-6 flex-1">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {activeTab === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                  </span>
                  <span className="text-slate-500">/{activeTab === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-6 w-6 text-indigo-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-md font-medium text-center transition-colors mt-auto ${tier.buttonBg}`}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 pb-12">
          WhoAbout - Making office coordination seamless.
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
