"use client";

import React, { useState } from "react";
import OnboardingFounder from "./components/OnboardingFounder";
import OnboardingStandard from "./components/OnboardingStandard";

export default function App() {
  const [isFounder, setIsFounder] = useState<boolean | null>(null);

  const handleSelectFounder = () => setIsFounder(true);
  const handleSelectStandard = () => setIsFounder(false);

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans max-w-5xl mx-auto flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to the Explorer Frontend</h1>
      {isFounder === null && (
        <div className="space-x-4">
          <button
            onClick={handleSelectFounder}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
          >
            Founder Onboarding
          </button>
          <button
            onClick={handleSelectStandard}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
          >
            Standard Onboarding
          </button>
        </div>
      )}
      {isFounder === true && <OnboardingFounder />}
      {isFounder === false && <OnboardingStandard />}
    </div>
  );
}
