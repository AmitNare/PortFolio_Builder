// src/pages/TermsAndConditions.jsx

import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Terms and Conditions
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Use of the Platform</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Use the platform legally and ethically.</li>
          <li>You are responsible for your account’s security.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. User Content</h2>
        <p>
          You retain rights to your uploaded content. By uploading, you allow us
          to host and display it publicly in your portfolio.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Prohibited Activities</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>No spamming, malware, or illegal content.</li>
          <li>No impersonation or false information.</li>
          <li>No reverse-engineering or copying platform features.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
        <p>
          All non-user content (logo, code, design) is owned by Portify and may
          not be reused without permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Account Termination</h2>
        <p>
          We may remove accounts that break these terms. You can also request
          deletion by contacting support.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Limitation of Liability
        </h2>
        <p>
          Portify is provided "as is". We are not responsible for outages, data
          loss, or any damage caused by using the platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Modifications</h2>
        <p>
          We may update these terms. Continued use means you accept the changes.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
