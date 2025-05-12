// src/pages/PrivacyPolicy.jsx

import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Personal Information like name, email, and profile data.</li>
          <li>Login and authentication details.</li>
          <li>User-generated content such as portfolio info and images.</li>
          <li>Anonymized technical and analytics data.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To create and display your portfolio.</li>
          <li>To communicate updates or provide support.</li>
          <li>To enhance performance and security.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. Sharing of Information
        </h2>
        <p>
          We do not sell or share your data. Only trusted services may access
          data under strict terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
        <p>
          Your data is stored securely and protected using modern security
          practices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Access or update your information.</li>
          <li>
            Request deletion by contacting us by filling out the{" "}
            <Link to="/#Feedback" className="text-blue-600 underline">
              Feedback Form
            </Link>
            .
          </li>

          <li>Withdraw your consent at any time.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Third-Party Links</h2>
        <p>External links in portfolios are not covered by this policy.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Changes to This Policy
        </h2>
        <p>We may update this policy. Changes will be reflected here.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
