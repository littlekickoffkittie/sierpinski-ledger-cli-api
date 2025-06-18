"use client";

import React, { useState } from "react";

export default function OnboardingStandard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStandardOnboarding = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/standard-onboarding", {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to complete standard onboarding");
      }
      const data = await response.json();
      setResult(`Standard onboarding completed. Wallet: ${data.wallet}, Initial balance: ${data.initial_balance}`);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md text-black">
      <h2 className="text-2xl font-bold mb-4">Standard Onboarding</h2>
      <p className="mb-4">
        This is the quickstart onboarding for new users. It will create a new wallet with an initial balance.
      </p>
      <button
        onClick={handleStandardOnboarding}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Start Standard Onboarding"}
      </button>
      {result && <p className="mt-4 text-green-600">{result}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
