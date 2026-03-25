'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-[#fcf9f3]">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-[#4d4635] hover:text-[#1c1c18] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        
        {submitted ? (
          <div className="bg-[#ffffff] border border-[#d0c5af] p-10 text-center">
            <CheckCircle className="w-14 h-14 text-[#2f6f44] mx-auto mb-6" />
            <h2 className="text-2xl font-playfair text-[#1c1c18] mb-3">Check your email</h2>
            <p className="text-sm text-[#4d4635] mb-10">
              We have sent a reset link to <span className="text-[#1c1c18]">{email}</span>.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
            >
              Try another email
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Reset</p>
            <h2 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-3">Reset Password</h2>
            <p className="text-sm text-[#4d4635] mb-10">Enter your email and we will send you a link.</p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors mt-8"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
