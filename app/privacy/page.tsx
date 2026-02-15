export default function PrivacyPage() {
  return (
    <main className="min-h-screen intella-page">
      <div className="max-w-4xl mx-auto px-6 py-16">

        <h1 className="text-3xl font-semibold mb-2">
          Privacy Policy
        </h1>

        <p className="text-sm text-slate-600 mb-10">
          Last Updated: 15 January 2016
        </p>

        <Section title="1. Introduction">
          This Privacy Policy explains how Intella (“Intella”, “we”, “us”, or
          “our”) collects, uses, stores, shares, and protects personal
          information when you access or use the Intella platform, including
          our website, applications, and related services (collectively, the
          “Services”).
          <br /><br />
          By accessing or using Intella, you acknowledge that you have read,
          understood, and agreed to this Privacy Policy. If you do not agree,
          you must discontinue use of the Services.
        </Section>

        <Section title="2. Platform Role & Intermediary Status">
          Intella operates solely as a technology platform that facilitates
          discovery, booking, and payment for one-to-one conversations between
          independent users (“Hosts”) and consumers (“Users”).
          <br /><br />
          Intella does not provide professional, legal, financial, medical, or
          other advice. Any guidance, opinions, or information shared during
          conversations are provided solely by Hosts in their individual
          capacity. Intella does not endorse, verify, or guarantee the accuracy
          or outcomes of such conversations.
        </Section>

        <Section title="3. Information We Collect">
          <strong>a. Personal Information You Provide</strong>
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Name, email address, phone number</li>
            <li>Account login credentials</li>
            <li>Profile information, biography, experience, and categories</li>
            <li>Booking details and communication metadata</li>
            <li>Support requests or direct communications with Intella</li>
          </ul>

          <br />

          <strong>b. Payment Information</strong>
          <br />
          Payments are processed by third-party payment gateways. Intella does
          not store full card numbers or sensitive payment credentials. We may
          retain transaction identifiers, payment status, and related metadata
          for reconciliation, refunds, compliance, and audit purposes.

          <br /><br />

          <strong>c. Information Collected Automatically</strong>
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>IP address and approximate location</li>
            <li>Browser type, device information, operating system</li>
            <li>Usage logs, timestamps, pages viewed, actions taken</li>
            <li>Error logs and diagnostic data</li>
          </ul>
        </Section>

        <Section title="4. Sensitive Personal Information">
          Intella does not intentionally collect or process sensitive personal
          data such as biometric information, health data, religious beliefs,
          caste, sexual orientation, or government-issued identifiers.
        </Section>

        <Section title="5. How We Use Your Information">
          We process personal information for the following purposes:
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Account creation, authentication, and management</li>
            <li>Facilitating bookings and payments</li>
            <li>Customer support and issue resolution</li>
            <li>Platform security, fraud detection, and abuse prevention</li>
            <li>Service improvements, analytics, and performance monitoring</li>
            <li>Legal compliance and enforcement of our Terms</li>
          </ul>
        </Section>

        <Section title="6. Legal Basis for Processing">
          We process personal data only where legally permitted, including:
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Your explicit or implied consent</li>
            <li>Performance of a contract (providing Services)</li>
            <li>Compliance with legal obligations</li>
            <li>Legitimate business interests such as platform safety</li>
          </ul>
        </Section>

        <Section title="7. Sharing of Personal Information">
          Intella does not sell personal information.
          <br /><br />
          We may share personal data with:
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Payment processors and financial service providers</li>
            <li>Cloud hosting, analytics, and infrastructure vendors</li>
            <li>Law enforcement or regulatory authorities when required</li>
            <li>Successor entities in case of merger or acquisition</li>
          </ul>
        </Section>

        <Section title="8. Cookies & Tracking Technologies">
          We use cookies and similar technologies to maintain sessions, improve
          performance, and understand platform usage. You can control cookies
          through your browser settings; however, disabling cookies may affect
          certain features.
        </Section>

        <Section title="9. Data Retention">
          Personal information is retained only as long as necessary to fulfill
          the purposes described in this policy or as required by applicable
          law. When no longer needed, data is securely deleted or anonymized.
        </Section>

        <Section title="10. Data Security">
          Intella implements reasonable administrative, technical, and
          organizational safeguards to protect personal information. However,
          no method of transmission or storage is 100% secure, and we cannot
          guarantee absolute security.
        </Section>

        <Section title="11. Refunds & Transaction Disputes">
          Refunds are governed by Intella’s Refund Policy. Intella facilitates
          refunds in accordance with platform rules but is not responsible for
          disputes arising from services delivered by Hosts.
        </Section>

        <Section title="12. Children’s Privacy">
          <>
            <p>
              Intella is primarily intended for individuals who are eighteen
              (18) years of age or older.
            </p>

            <p className="mt-3">
              Individuals under the age of eighteen (18) may use the platform
              only under the direct supervision of a parent or legal guardian
              who agrees to be bound by our Terms of Use and assumes full
              responsibility for the minor’s account, payments, communications,
              and compliance.
            </p>

            <p className="mt-3">
              Minors are not permitted to independently create accounts or
              enter into paid transactions.
            </p>

            <p className="mt-3">
              We do not knowingly collect personal information from minors
              without verified parental or guardian involvement. Where we
              become aware that personal data has been collected in violation
              of our Terms, we reserve the right to suspend or terminate the
              account and delete the associated data.
            </p>

            <p className="mt-3">
              Intella may request proof of age at any time to verify compliance
              with eligibility requirements.
            </p>
          </>
        </Section>

        <Section title="13. User Rights">
          Depending on your jurisdiction, you may have the right to:
          <ul className="list-disc ml-5 mt-2 space-y-2">
            <li>Access and review your personal data</li>
            <li>Request correction or deletion</li>
            <li>Withdraw consent</li>
            <li>Object to certain processing activities</li>
          </ul>
          Requests may be submitted via the contact details below.
        </Section>

        <Section title="14. Third-Party Links">
          The Services may contain links to third-party websites. Intella is not
          responsible for the privacy practices or content of such websites.
        </Section>

        <Section title="15. Changes to This Policy">
          We may update this Privacy Policy periodically. Changes will be posted
          on this page. Continued use of the Services constitutes acceptance of
          the updated policy.
        </Section>

        <Section title="16. Contact Information">
          For privacy-related inquiries, requests, or complaints, contact:
          <br /><br />
          <a
            href="mailto:support@intella.app"
            className="text-orange-600 underline"
          >
            contact@intella.in
          </a>
        </Section>

      </div>
    </main>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="mb-8">
      <h2 className="font-medium mb-2 text-slate-900">
        {title}
      </h2>
      <p className="text-sm text-slate-700 leading-relaxed">
        {children}
      </p>
    </div>
  )
}
