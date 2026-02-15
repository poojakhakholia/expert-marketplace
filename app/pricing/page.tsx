export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Platform Pricing
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Clear, simple fees for hosting conversations on Intella.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-10 text-center">
          <div className="text-5xl font-bold text-orange-600">
            5%
          </div>
          <p className="mt-3 text-lg text-slate-700">
            per successfully completed paid conversation
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Minimum platform fee: ₹20 per paid session
          </p>

          <div className="mt-6 text-sm text-slate-600">
            ₹0 for free sessions · No monthly fee · No listing fee
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            How deductions work
          </h2>

          <div className="space-y-6">

            <ExampleCard
              title="Example 1: ₹1,000 Conversation"
              content={
                <>
                  If you charge <strong>₹1,000</strong>:
                  <br />
                  Platform fee (5%) = ₹50
                  <br />
                  Remaining after platform fee = ₹950
                  <br /><br />
                  Payment gateway / processor charges will be deducted separately.
                  <br />
                  <strong>Final payout will be lower depending on payment processor fees.</strong>
                </>
              }
            />

            <ExampleCard
              title="Example 2: ₹300 Conversation"
              content={
                <>
                  If you charge <strong>₹300</strong>:
                  <br />
                  5% = ₹15
                  <br />
                  Since minimum fee is ₹20,
                  <br />
                  Platform fee = ₹20
                  <br />
                  Remaining after platform fee = ₹280
                  <br /><br />
                  Payment processor charges will apply separately.
                </>
              }
            />

            <ExampleCard
              title="Example 3: Free Session"
              content={
                <>
                  If you charge <strong>₹0</strong>:
                  <br />
                  Platform fee = ₹0
                  <br />
                  No payment processor charges apply.
                </>
              }
            />

          </div>
        </div>

        {/* Payment Processor Disclosure */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Payment Processing Fees
          </h2>

          <p className="text-slate-700 leading-relaxed">
            Payments on Intella are processed through third-party payment
            gateways and financial service providers. These providers charge
            transaction processing fees, which are deducted from the total
            payment amount before payout.
          </p>

          <p className="mt-4 text-slate-700 leading-relaxed">
            Such charges are determined by the respective payment provider and
            are outside Intella’s control. Actual payout amounts may therefore
            vary depending on payment method, card network, bank, or applicable
            processing fees.
          </p>
        </div>

        {/* When Fee Applies */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            When platform fees apply
          </h2>

          <p className="text-slate-700 leading-relaxed">
            Platform fees are deducted only from successfully completed paid
            conversations. If a session is cancelled and refunded in accordance
            with Intella’s policies, the corresponding platform fee will not be
            retained.
          </p>
        </div>

        {/* What's Included */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            What your platform fee supports
          </h2>

          <ul className="space-y-3 text-slate-700 list-disc pl-6">
            <li>Secure booking infrastructure</li>
            <li>Integrated payment collection</li>
            <li>Scheduling & reminders</li>
            <li>Public profile hosting</li>
            <li>Review & credibility system</li>
            <li>Earnings dashboard & tracking</li>
            <li>Platform maintenance and support</li>
          </ul>
        </div>

        {/* Important Notes */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Important information
          </h2>

          <ul className="space-y-3 text-slate-700 list-disc pl-6">
            <li>
              Hosts are independent service providers and are solely responsible
              for their own tax reporting and regulatory compliance.
            </li>
            <li>
              Intella does not guarantee bookings, income, or minimum earnings.
            </li>
            <li>
              Platform fees, pricing structures, and payout mechanics may be
              modified at Intella’s discretion.
            </li>
          </ul>
        </div>

        {/* Closing */}
        <div className="mt-20 text-center">
          <p className="text-slate-600">
            Transparent fees. No hidden surprises.
          </p>
          <p className="mt-2 font-medium text-slate-900">
            You focus on meaningful conversations — Intella provides the infrastructure.
          </p>
        </div>

      </div>
    </div>
  )
}

/* ---------- Reusable Example Card ---------- */

function ExampleCard({
  title,
  content,
}: {
  title: string
  content: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-medium text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-700 leading-relaxed">
        {content}
      </p>
    </div>
  )
}
