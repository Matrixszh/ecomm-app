'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler?: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'));
    if (window.Razorpay) return resolve();
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { mongoUser } = useAuthStore();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [deliveryOption, setDeliveryOption] = useState<'concierge' | 'standard' | 'express'>('standard');

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode.trim(), orderAmount: totalPrice() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || 'Invalid promo code');
        setDiscount(0);
        setPromoApplied(false);
      } else {
        setDiscount(data.discountAmount);
        setPromoApplied(true);
      }
    } catch {
      setPromoError('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const nameParts = (mongoUser?.name || '').split(' ').filter(Boolean);
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [line1, setLine1] = useState('123 Main St');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('MH');
  const [pincode, setPincode] = useState('400001');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-playfair text-(--luxe-text) mb-4">Your Bag is Empty</h1>
        <Link href="/shop" className="text-xs tracking-[0.24em] uppercase text-(--luxe-text) underline underline-offset-8 decoration-(--luxe-gold)">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!mongoUser) {
      alert('Please log in to place an order');
      return;
    }
    
    setLoading(true);
    let openedRazorpay = false;
    try {
      const shippingAddress = {
        name: `${firstName} ${lastName}`.trim() || mongoUser.name || mongoUser.email,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        country: country.trim() || 'India',
        phone: phone.trim(),
      };

      if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
        alert('Please fill all required shipping fields (address, city, state, pincode, phone).');
        setLoading(false);
        return;
      }

      const subtotal = totalPrice();
      const shippingCost = 0;
      const totalAmount = subtotal + shippingCost - discount;

      const orderPayload = {
        items: items.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image || '',
          price: item.price,
          quantity: item.quantity,
          variant: item.selectedVariants,
          vendor: item.vendor,
        })),
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        discount,
        totalAmount,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error ? JSON.stringify(data.error) : 'Failed to place order';
        throw new Error(msg);
      }

      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderNumber)}`);
        return;
      }

      const razorpay = data?.razorpay;
      const orderNumber = data?.orderNumber;
      if (!orderNumber || !razorpay?.keyId || !razorpay?.orderId) {
        throw new Error('Missing Razorpay order details');
      }

      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay failed to initialize');

      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'Checkout',
        description: `Order ${orderNumber}`,
        order_id: razorpay.orderId,
        prefill: {
          name: shippingAddress.name,
          email: mongoUser.email,
          contact: shippingAddress.phone,
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const confirmRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...orderPayload,
                orderNumber,
                ...response,
              }),
            });
            const confirmData = await confirmRes.json();
            if (!confirmRes.ok) {
              const msg = confirmData?.error ? JSON.stringify(confirmData.error) : 'Order confirmation failed';
              throw new Error(msg);
            }
            clearCart();
            router.push(`/checkout/success?orderId=${encodeURIComponent(confirmData.orderNumber || orderNumber)}`);
          } catch (e) {
            console.error(e);
            alert('Payment succeeded but order creation failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#785460' },
      });

      rzp.open();
      openedRazorpay = true;
    } catch (error) {
      console.error(error);
      alert('Failed to place order');
    } finally {
      if (!openedRazorpay) setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 w-full">
      <div className="flex items-end justify-between gap-8">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-outline)">Secure Checkout</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-playfair text-(--luxe-text)">Checkout</h1>
        </div>
      </div>

      <div className="mt-10 flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-(--luxe-outline-light) pb-6">
            {[
              { n: 1, label: 'Shipping' },
              { n: 2, label: 'Delivery' },
              { n: 3, label: 'Payment' },
            ].map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n)}
                className={`text-xs tracking-[0.24em] uppercase pb-2 border-b-2 transition-colors ${
                  step === s.n ? 'text-(--luxe-primary) border-(--luxe-primary)' : 'text-(--luxe-outline) border-transparent hover:text-(--luxe-text)'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {step === 1 && (
              <div className="space-y-10">
                <div className="border border-(--luxe-outline-light) bg-(--luxe-white) p-8">
                  <div className="flex items-center justify-between gap-6">
                    <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text)">Account</h2>
                    {mongoUser ? <CheckCircle className="w-5 h-5 text-(--luxe-primary)" /> : null}
                  </div>
                  <div className="mt-6">
                    {mongoUser ? (
                      <p className="text-sm text-(--luxe-text-muted)">
                        Signed in as <span className="text-(--luxe-text)">{mongoUser.email}</span>
                      </p>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <p className="text-sm text-(--luxe-text-muted)">Please sign in to continue.</p>
                        <Link
                          href="/auth/login?redirect=/checkout"
                          className="inline-flex items-center justify-center bg-(--luxe-cta) text-(--luxe-white) px-6 py-3 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-(--luxe-outline-light) bg-(--luxe-white) p-8">
                  <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text)">Shipping</h2>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">First Name</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Last Name</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Address</label>
                      <input value={line1} onChange={(e) => setLine1(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Address (Optional)</label>
                      <input value={line2} onChange={(e) => setLine2(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">City</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">State</label>
                      <input value={stateName} onChange={(e) => setStateName(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">PIN</label>
                      <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Country</label>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-3 w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)" />
                    </div>
                  </div>

                  <div className="mt-10">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-(--luxe-cta) text-(--luxe-white) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors"
                    >
                      Continue to Delivery
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="border border-(--luxe-outline-light) bg-(--luxe-white) p-8">
                <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text)">Delivery</h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'concierge', title: 'Boutique Concierge', meta: 'White-glove delivery' },
                    { id: 'standard', title: 'Standard', meta: '3–5 business days' },
                    { id: 'express', title: 'Express', meta: '1–2 business days' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDeliveryOption(opt.id as typeof deliveryOption)}
                      className={`text-left border p-6 transition-colors ${
                        deliveryOption === opt.id ? 'border-(--luxe-primary) bg-(--luxe-primary-container)' : 'border-(--luxe-outline-light) hover:bg-(--luxe-surface)'
                      }`}
                    >
                      <p className="text-sm font-playfair text-(--luxe-text)">{opt.title}</p>
                      <p className="mt-2 text-xs tracking-[0.18em] uppercase text-(--luxe-outline)">{opt.meta}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-(--luxe-outline-light) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-surface) transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-(--luxe-cta) text-(--luxe-white) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="border border-(--luxe-outline-light) bg-(--luxe-white) p-8">
                <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text)">Payment</h2>
                <div className="mt-8 space-y-4">
                  <label className="flex items-center justify-between gap-4 border border-(--luxe-outline-light) p-5 cursor-pointer hover:bg-(--luxe-surface) transition-colors">
                    <div>
                      <p className="text-sm text-(--luxe-text)">Cash on Delivery</p>
                      <p className="mt-1 text-xs tracking-[0.18em] uppercase text-(--luxe-outline)">Pay at delivery</p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                      className="accent-(--luxe-primary)"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 border border-(--luxe-outline-light) p-5 cursor-pointer hover:bg-(--luxe-surface) transition-colors">
                    <div>
                      <p className="text-sm text-(--luxe-text)">Pay Online</p>
                      <p className="mt-1 text-xs tracking-[0.18em] uppercase text-(--luxe-outline)">Razorpay</p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'razorpay')}
                      className="accent-(--luxe-primary)"
                    />
                  </label>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-(--luxe-outline-light) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-surface) transition-colors"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-(--luxe-cta) text-(--luxe-white) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors disabled:opacity-70"
                  >
                    {loading ? 'Processing' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[360px] flex-shrink-0">
          <details className="lg:hidden border border-(--luxe-outline-light) bg-(--luxe-white)">
            <summary className="cursor-pointer px-6 py-5 text-xs tracking-[0.24em] uppercase text-(--luxe-text)">
              Order Summary
            </summary>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-6 text-sm">
                    <span className="text-(--luxe-text-muted) line-clamp-1">{item.quantity} × {item.name}</span>
                    <span className="text-(--luxe-text)">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-(--luxe-outline-light) pt-5 space-y-2 text-sm">
                <div className="flex justify-between text-(--luxe-text-muted)">
                  <span>Subtotal</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-(--luxe-text-muted)">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)"
                  />
                  <button
                    onClick={promoApplied ? () => { setPromoApplied(false); setDiscount(0); setPromoCode(''); } : handleApplyPromo}
                    disabled={promoLoading}
                    className="bg-(--luxe-cta) text-(--luxe-white) px-4 py-3 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors disabled:opacity-70"
                  >
                    {promoLoading ? 'Applying...' : promoApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {promoError && <p className="mt-2 text-xs text-(--luxe-error)">{promoError}</p>}
                {promoApplied && <p className="mt-2 text-xs text-(--luxe-secondary)">−₹{discount.toFixed(2)} discount applied</p>}
              </div>

              <div className="mt-5 border-t border-(--luxe-outline-light) pt-5 flex justify-between items-center">
                <span className="text-xs tracking-[0.24em] uppercase text-(--luxe-text-muted)">Total</span>
                <span className="text-lg font-playfair text-(--luxe-text)">₹{(totalPrice() - discount).toFixed(2)}</span>
              </div>
            </div>
          </details>

          <div className="hidden lg:block border border-(--luxe-outline-light) bg-(--luxe-white) p-8 sticky top-24">
            <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text)">Order Summary</h2>
            <div className="mt-6 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between gap-6 text-sm">
                  <span className="text-(--luxe-text-muted) line-clamp-1">{item.quantity} × {item.name}</span>
                  <span className="text-(--luxe-text)">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-(--luxe-outline-light) pt-5 space-y-2 text-sm">
              <div className="flex justify-between text-(--luxe-text-muted)">
                <span>Subtotal</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-(--luxe-text-muted)">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm focus:outline-none focus:border-(--luxe-primary)"
                />
                <button
                  onClick={promoApplied ? () => { setPromoApplied(false); setDiscount(0); setPromoCode(''); } : handleApplyPromo}
                  disabled={promoLoading}
                  className="bg-(--luxe-cta) text-(--luxe-white) px-4 py-3 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) transition-colors disabled:opacity-70"
                >
                  {promoLoading ? 'Applying...' : promoApplied ? 'Remove' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="mt-2 text-xs text-(--luxe-error)">{promoError}</p>}
              {promoApplied && <p className="mt-2 text-xs text-(--luxe-secondary)">−₹{discount.toFixed(2)} discount applied</p>}
            </div>

            <div className="mt-5 border-t border-(--luxe-outline-light) pt-5 flex justify-between items-center">
              <span className="text-xs tracking-[0.24em] uppercase text-(--luxe-text-muted)">Total</span>
              <span className="text-lg font-playfair text-(--luxe-text)">₹{(totalPrice() - discount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
