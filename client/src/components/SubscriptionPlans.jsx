// client/src/components/SubscriptionPlans.jsx

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Rocket,
  ArrowRight,
  Users,
  Clock,
  Shield,
  BarChart3,
  Smartphone,
  Mail
} from 'lucide-react';
import api from '../api/api';

const SubscriptionPlans = ({ currentPlan, onClose, onUpgrade }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'trial',
      name: 'Trial',
      icon: Clock,
      color: 'gray',
      price: 0,
      period: '14 days',
      description: 'Try out all features',
      maxEmployees: 10,
      features: [
        { name: 'Up to 10 employees', included: true },
        { name: 'Basic attendance tracking', included: true },
        { name: 'Leave management', included: true },
        { name: 'Basic reports', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Payroll processing', included: false },
        { name: 'Custom branding', included: false },
        { name: 'API access', included: false },
        { name: 'Priority support', included: false },
      ],
      recommended: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      icon: Zap,
      color: 'blue',
      price: 499,
      period: 'per month',
      description: 'Perfect for small teams',
      maxEmployees: 25,
      features: [
        { name: 'Up to 25 employees', included: true },
        { name: 'Advanced attendance tracking', included: true },
        { name: 'Leave management', included: true },
        { name: 'Basic reports', included: true },
        { name: 'Email support', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Payroll processing', included: false },
        { name: 'Custom branding', included: false },
        { name: 'API access', included: false },
        { name: 'Priority support', included: false },
      ],
      recommended: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Crown,
      color: 'indigo',
      price: 999,
      period: 'per month',
      description: 'For growing businesses',
      maxEmployees: 100,
      features: [
        { name: 'Up to 100 employees', included: true },
        { name: 'Advanced attendance tracking', included: true },
        { name: 'Leave management', included: true },
        { name: 'Advanced reports & analytics', included: true },
        { name: 'Email & SMS support', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Payroll processing', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Assessment system', included: true },
        { name: 'API access', included: false },
        { name: 'Priority support', included: true },
      ],
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Rocket,
      color: 'purple',
      price: null, // Custom pricing
      period: 'custom',
      description: 'For large organizations',
      maxEmployees: 'Unlimited',
      features: [
        { name: 'Unlimited employees', included: true },
        { name: 'Advanced attendance tracking', included: true },
        { name: 'Leave management', included: true },
        { name: 'Custom reports & analytics', included: true },
        { name: '24/7 priority support', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Payroll processing', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Assessment system', included: true },
        { name: 'Full API access', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'White-label option', included: true },
      ],
      recommended: false,
    },
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.id === currentPlan) {
      return; // Already on this plan
    }

    setSelectedPlan(plan.id);
    setLoading(true);

    try {
      // For trial, just show contact message
      if (plan.id === 'trial') {
        alert('Trial plan is only available for new signups. Contact support for assistance.');
        setLoading(false);
        return;
      }

      // For enterprise, show contact form
      if (plan.id === 'enterprise') {
        alert('Please contact our sales team at sales@yourapp.com for enterprise pricing.');
        setLoading(false);
        return;
      }

      // For basic/professional, proceed with upgrade
      const response = await api.post('/subscriptions/upgrade', {
        planId: plan.id
      });

      if (response.data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.paymentUrl;
      } else {
        // Upgrade successful
        if (onUpgrade) {
          onUpgrade(plan);
        }
        alert(`Successfully upgraded to ${plan.name} plan!`);
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(error.response?.data?.error || 'Failed to upgrade plan. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700',
        icon: 'text-gray-600',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
        icon: 'text-blue-600',
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-800',
        button: 'bg-indigo-600 hover:bg-indigo-700',
        icon: 'text-indigo-600',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        icon: 'text-purple-600',
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-600 mt-1">
                Select the perfect plan for your organization
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && (
          <div className="px-8 py-4 bg-indigo-50 border-b border-indigo-100">
            <p className="text-sm text-indigo-800">
              <strong>Current Plan:</strong>{' '}
              <span className="capitalize font-semibold">{currentPlan}</span>
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const colors = getColorClasses(plan.color);
              const isCurrentPlan = plan.id === currentPlan;
              const isUpgrade = plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 ${
                    plan.recommended
                      ? 'border-indigo-500 shadow-xl scale-105'
                      : isCurrentPlan
                      ? 'border-green-500'
                      : 'border-gray-200'
                  } bg-white overflow-hidden transition-all hover:shadow-lg`}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      RECOMMENDED
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      CURRENT PLAN
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl ${colors.bg} mb-4`}>
                      <Icon className={`w-8 h-8 ${colors.icon}`} />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.price === null ? (
                        <div>
                          <p className="text-3xl font-bold text-gray-900">
                            Custom
                          </p>
                          <p className="text-sm text-gray-600">Contact sales</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-4xl font-bold text-gray-900">
                            R{plan.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">{plan.period}</p>
                        </div>
                      )}
                    </div>

                    {/* Max Employees */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.badge} mb-6`}>
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {typeof plan.maxEmployees === 'number' 
                          ? `Up to ${plan.maxEmployees} employees` 
                          : plan.maxEmployees}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrentPlan || loading}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : loading && selectedPlan === plan.id
                          ? 'bg-gray-400 text-white cursor-wait'
                          : `${colors.button} text-white`
                      }`}
                    >
                      {loading && selectedPlan === plan.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <Check className="w-5 h-5" />
                          Current Plan
                        </>
                      ) : (
                        <>
                          {plan.id === 'enterprise' ? 'Contact Sales' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">
                14-Day Money-Back Guarantee
              </h4>
              <p className="text-sm text-gray-600">
                Not satisfied? Get a full refund within 14 days.
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">
                No Setup Fees
              </h4>
              <p className="text-sm text-gray-600">
                Start using all features immediately after upgrade.
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">
                24/7 Support
              </h4>
              <p className="text-sm text-gray-600">
                Our team is here to help you succeed.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I change plans anytime?
                </h4>
                <p className="text-sm text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-sm text-gray-600">
                  We accept all major credit cards, debit cards, and bank transfers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Is my data safe?
                </h4>
                <p className="text-sm text-gray-600">
                  Absolutely! We use bank-level encryption and regular backups to keep your data secure.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Do you offer discounts for annual plans?
                </h4>
                <p className="text-sm text-gray-600">
                  Yes! Save 20% when you pay annually. Contact sales for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;