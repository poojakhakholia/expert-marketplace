import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div>
            <img
              src="/branding/intella-logo.png"
              alt="Intella"
              className="h-8 w-auto"
            />

            <p className="mt-4 text-sm text-slate-600">
              Everyone knows something worth sharing. Intella is a place for
              meaningful one-to-one conversations built around lived experience.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-slate-800">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-800">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/faq" className="hover:text-slate-800">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Legal
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/terms" className="hover:text-slate-800">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-800">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Intella. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
