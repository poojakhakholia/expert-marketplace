export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Terms & Conditions</h1>

      <Section title="1. About Intella">
        Intella is a platform for meaningful one-to-one conversations. Hosts share
        lived experience; Intella facilitates discovery, booking, and payments.
      </Section>

      <Section title="2. Profile Approval">
        All host profiles are reviewed before going live. Intella may request edits
        or decline profiles at its discretion.
      </Section>

      <Section title="3. Conversations & Bookings">
        All conversation requests require host approval. Once accepted, hosts are
        expected to honor the booking.
      </Section>

      <Section title="4. Payments & Refunds">
        Payments are processed in INR. Free conversations are allowed. Refunds are
        handled as per Intella’s refund policy.
      </Section>

      <Section title="5. Host Responsibilities">
        Hosts must be respectful, punctual, and professional. Harassment, spam,
        solicitation, or illegal advice is not permitted.
      </Section>

      <Section title="6. Platform Conduct">
        Intella maintains zero tolerance for abuse. Violations may result in account
        suspension or removal.
      </Section>

      <Section title="7. Liability">
        Intella is a facilitator and is not responsible for the outcome of
        conversations.
      </Section>

      <Section title="8. Contact">
        For questions, contact us at support@intella.app
      </Section>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="mb-6">
      <h2 className="font-medium mb-2">{title}</h2>
      <p className="text-sm text-gray-700">{children}</p>
    </div>
  )
}
