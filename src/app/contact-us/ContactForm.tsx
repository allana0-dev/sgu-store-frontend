"use client";

import { useState } from "react";
import { FiSend, FiCheckCircle } from "react-icons/fi";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-sgu-navy mb-4">
          Message Sent!
        </h3>
        <p className="text-slate-600 mb-8 max-w-sm">
          Thank you for reaching out. We have received your message and a
          representative will follow up with you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sgu-turquoise font-bold hover:text-sgu-navy transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="firstName"
            className="text-sm font-bold text-sgu-navy"
          >
            First Name <span className="text-sgu-red">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            required
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm font-bold text-sgu-navy">
            Last Name <span className="text-sgu-red">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            required
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold text-sgu-navy">
            Email <span className="text-sgu-red">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-bold text-sgu-navy">
            Phone Number <span className="text-sgu-red">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all"
          />
        </div>
      </div>

      {/* I'm A... (Radio Group) */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold text-sgu-navy">
          I&apos;m A <span className="text-sgu-red">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {["Student", "Alumni", "Faculty/Staff", "Parent/Guest", "Other"].map(
            (role) => (
              <label
                key={role}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    required
                    className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-sgu-turquoise transition-all cursor-pointer"
                  />
                  <div className="absolute w-2.5 h-2.5 bg-sgu-turquoise rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-slate-600 group-hover:text-sgu-navy transition-colors">
                  {role}
                </span>
              </label>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <label htmlFor="country" className="text-sm font-bold text-sgu-navy">
            Country <span className="text-sgu-red">*</span>
          </label>
          <select
            id="country"
            required
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all bg-white text-slate-600 appearance-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select Country
            </option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="GD">Grenada</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Order Number (Optional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="orderNum" className="text-sm font-bold text-sgu-navy">
            Order Number{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            id="orderNum"
            className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all"
          />
        </div>
      </div>

      {/* Inquiry Type */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="inquiryType"
          className="text-sm font-bold text-sgu-navy"
        >
          Inquiry Type <span className="text-sgu-red">*</span>
        </label>
        <select
          id="inquiryType"
          required
          className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all bg-white text-slate-600 appearance-none"
          defaultValue=""
        >
          <option value="" disabled>
            Select Inquiry Type
          </option>
          <option value="order">Order Status / Issue</option>
          <option value="product">Product Question</option>
          <option value="returns">Returns / Exchanges</option>
          <option value="feedback">General Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-bold text-sgu-navy">
          What is your question, comment, complaint, or feedback?{" "}
          <span className="text-sgu-red">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={5}
          className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sgu-turquoise/20 focus:border-sgu-turquoise transition-all resize-y"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-sgu-navy hover:bg-sgu-navy/90 text-white font-bold transition-all shadow-lg shadow-sgu-navy/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? (
          "Sending..."
        ) : (
          <>
            <FiSend className="w-5 h-5" />
            Submit Message
          </>
        )}
      </button>
    </form>
  );
}
