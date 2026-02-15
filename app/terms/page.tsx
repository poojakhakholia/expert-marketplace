export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">
        Terms & Conditions
      </h1>

      <p className="text-sm text-gray-600 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* 1 */}
      <Section title="1. About Intella">
        Intella is an online technology platform that enables discovery,
        scheduling, and payment for one-to-one conversations between users
        (“Users”) and independent hosts (“Hosts”). Intella acts solely as a
        neutral intermediary and marketplace facilitator. Intella does not
        provide professional, legal, financial, medical, psychological,
        educational, or career advice, and does not employ, certify, or
        endorse any Host.
      </Section>

      {/* 2 */}
      <Section title="2. Acceptance of Terms">
        By accessing or using Intella, you acknowledge that you have read,
        understood, and agreed to be legally bound by these Terms. If you do
        not agree to these Terms, you must discontinue use of the Platform
        immediately. Continued use after updates constitutes acceptance of
        revised Terms.
      </Section>

      {/* 3 */}
      <Section title="3. Eligibility">
        <strong>Age Requirement:</strong> You must be at least eighteen (18)
        years old and capable of entering into a legally binding contract
        under applicable law.

        <br /><br />

        If you are under eighteen (18), you may use Intella only under the
        direct supervision of a parent or legal guardian who agrees to be
        bound by these Terms and assumes full legal responsibility for your
        account, payments, communications, and compliance. Minors may not
        independently enter into paid transactions.

        <br /><br />

        Intella reserves the right to request proof of age at any time and
        may suspend or terminate accounts for age misrepresentation.

        <br /><br />

        If using Intella on behalf of an organization, you represent that you
        have authority to bind that organization to these Terms.
      </Section>

      {/* 4 */}
      <Section title="4. Intermediary Status">
        Intella functions solely as a technology intermediary under
        applicable Indian laws, including the Information Technology Act,
        2000. Intella does not control, supervise, or guarantee the quality,
        legality, accuracy, or outcomes of conversations conducted on the
        Platform. Hosts are independent individuals and not employees,
        agents, or representatives of Intella.
      </Section>

      {/* 5 */}
      <Section title="5. No Professional Relationship">
        Use of the Platform does not create any employer-employee,
        advisor-client, doctor-patient, lawyer-client, therapist-client,
        fiduciary, partnership, or joint venture relationship between Intella
        and any User or Host.
      </Section>

      {/* 6 */}
      <Section title="6. Host Responsibilities">
        Hosts are solely responsible for:
        <ul className="list-disc ml-6 mt-3 space-y-2">
          <li>Accuracy of profile information;</li>
          <li>Truthfulness of qualifications and experience;</li>
          <li>Lawful conduct during conversations;</li>
          <li>Compliance with applicable regulations.</li>
        </ul>

        Hosts must not provide illegal, misleading, defamatory, harmful,
        discriminatory, or regulated professional advice without proper
        licensing where required by law.
      </Section>

      {/* 7 */}
      <Section title="7. User Responsibilities">
        Users agree to:
        <ul className="list-disc ml-6 mt-3 space-y-2">
          <li>Exercise independent judgment;</li>
          <li>Not misuse the Platform;</li>
          <li>Not harass, threaten, or solicit Hosts;</li>
          <li>Not attempt off-platform circumvention of payments;</li>
          <li>Comply with applicable laws.</li>
        </ul>
      </Section>

      {/* 8 */}
      <Section title="8. Payments">
        Payments are processed in Indian Rupees (INR) via third-party
        payment gateways. Intella does not store payment card details.
        Applicable taxes may be included. Payment gateway charges may be
        non-refundable.
      </Section>

      {/* 9 */}
      <Section title="9. Refund & Cancellation Policy">
        <ul className="list-disc ml-6 space-y-2">
          <li>
            If a Host cancels a confirmed booking, the User will receive
            a refund excluding payment gateway charges.
          </li>
          <li>
            Users may not cancel or request refunds for confirmed sessions
            unless expressly approved by the Host or required by law.
          </li>
          <li>
            No refunds are provided for completed conversations.
          </li>
          <li>
            Refund processing timelines depend on payment providers and
            may take 5–7 business days.
          </li>
        </ul>
      </Section>

      {/* 10 */}
      <Section title="10. Disclaimer of Warranties">
        The Platform is provided on an “as-is” and “as-available” basis.
        Intella disclaims all warranties, express or implied, including
        fitness for a particular purpose, non-infringement, uninterrupted
        service, or error-free operation.

        <br /><br />

        Intella does not guarantee results, outcomes, career advancement,
        financial gain, educational success, or any specific benefit from
        conversations conducted on the Platform.
      </Section>

      {/* 11 */}
      <Section title="11. Limitation of Liability">
        To the maximum extent permitted by law, Intella shall not be liable
        for indirect, incidental, consequential, punitive, or special
        damages, including loss of income, reputation, goodwill, data, or
        business opportunity.

        <br /><br />

        Intella’s total aggregate liability shall not exceed the greater of:
        <ul className="list-disc ml-6 mt-3 space-y-2">
          <li>The total fees paid by you in the preceding 12 months; or</li>
          <li>INR 1,000.</li>
        </ul>
      </Section>

      {/* 12 */}
      <Section title="12. Indemnification">
        You agree to indemnify and hold harmless Intella, its founders,
        directors, employees, and affiliates from any claims, losses,
        liabilities, penalties, or legal expenses arising from:
        <ul className="list-disc ml-6 mt-3 space-y-2">
          <li>Your use of the Platform;</li>
          <li>Your violation of these Terms;</li>
          <li>Your content or advice;</li>
          <li>Any dispute between Users and Hosts.</li>
        </ul>
      </Section>

      {/* 13 */}
      <Section title="13. Intellectual Property">
        All Platform content, trademarks, branding, design, and software
        are the exclusive property of Intella. Users may not copy,
        reproduce, reverse-engineer, distribute, or exploit any Platform
        material without written permission.
      </Section>

      {/* 14 */}
      <Section title="14. Suspension & Termination">
        Intella reserves the right to suspend or terminate accounts at its
        discretion for violations of these Terms, fraud, legal compliance
        requirements, security concerns, or reputational risk.
      </Section>

      {/* 15 */}
      <Section title="15. Dispute Resolution">
        Any dispute shall first be resolved through good-faith negotiation.
        If unresolved, disputes shall be subject to the exclusive
        jurisdiction of courts located in Bengaluru, Karnataka, India.
      </Section>

      {/* 16 */}
      <Section title="16. Force Majeure">
        Intella shall not be liable for failure or delay caused by events
        beyond reasonable control, including natural disasters, government
        actions, internet outages, or force majeure events.
      </Section>

      {/* 17 */}
      <Section title="17. Severability & Entire Agreement">
        If any provision is deemed invalid, remaining provisions shall
        continue in full force. These Terms constitute the entire agreement
        between you and Intella.
      </Section>

      {/* 18 */}
      <Section title="18. Changes to Terms">
        Intella may update these Terms at any time. Continued use after
        updates constitutes acceptance of the revised Terms.
      </Section>

      {/* 19 */}
      <Section title="19. Contact">
        For questions, contact us at{" "}
        <a
          href="mailto:contact@intella.in"
          className="text-orange-600 underline"
        >
          contact@intella.in
        </a>
      </Section>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="mb-8">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
