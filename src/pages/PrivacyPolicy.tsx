import React from "react";

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "info-we-collect", title: "Information we collect" },
  { id: "how-we-use", title: "How we use information" },
  { id: "sharing", title: "Sharing and disclosure" },
  { id: "cookies", title: "Cookies and tracking" },
  { id: "security", title: "Security" },
  { id: "retention", title: "Data retention" },
  { id: "rights", title: "Your rights" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              NewsFlash respects your privacy. This document explains what data we collect and how we handle it.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Print
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-100"
            >
              Back to home
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of contents */}
          <nav className="lg:col-span-1 sticky top-24 self-start hidden lg:block">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">On this page</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Last updated October 21, 2025
              </p>
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <section id="intro" className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Vision71 Technologies operates the NewsFlash platform. This Privacy Policy explains what personal data we collect, why we collect it, how we use it and how you can control your information.
                </p>
              </section>

              <section id="info-we-collect" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Information we collect</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We collect information you provide directly, and data collected automatically when you use the service.
                </p>

                <ul>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-100">Account data</strong>
                    <div className="text-gray-600 dark:text-gray-300">Name, email address and password when you register.</div>
                  </li>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-100">Content and entries</strong>
                    <div className="text-gray-600 dark:text-gray-300">News items, notes, tags and any media you upload or save in NewsFlash.</div>
                  </li>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-100">Usage and device data</strong>
                    <div className="text-gray-600 dark:text-gray-300">IP address, browser type, operating system and activity logs to help improve the service.</div>
                  </li>
                </ul>
              </section>

              <section id="how-we-use" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How we use information</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We use data to provide, secure and improve NewsFlash and to customize your experience.
                </p>

                <ul>
                  <li className="text-gray-600 dark:text-gray-300">To operate and maintain the platform</li>
                  <li className="text-gray-600 dark:text-gray-300">To respond to support requests</li>
                  <li className="text-gray-600 dark:text-gray-300">To detect abuse and protect user safety</li>
                  <li className="text-gray-600 dark:text-gray-300">To send important account emails such as security alerts</li>
                </ul>
              </section>

              <section id="sharing" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sharing and disclosure</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We will not sell your personal information. We may share information in limited circumstances such as:
                </p>

                <ul>
                  <li className="text-gray-600 dark:text-gray-300">With service providers who perform functions on our behalf under contract</li>
                  <li className="text-gray-600 dark:text-gray-300">To comply with legal obligations or law enforcement requests</li>
                  <li className="text-gray-600 dark:text-gray-300">To protect the rights, property or safety of NewsFlash or others</li>
                </ul>
              </section>

              <section id="cookies" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Cookies and tracking</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We use cookies and similar technologies for essential site functionality, analytics and to remember your preferences.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  You can control cookies via your browser settings. Blocking certain cookies may limit features of the service.
                </p>
              </section>

              <section id="security" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We employ industry standard technical and administrative safeguards to protect your data. No system is perfect, so please contact us immediately if you suspect unauthorized access.
                </p>
              </section>

              <section id="retention" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Data retention</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We retain personal data as long as needed to provide the service, or as required by law. You can request deletion of your account and associated data using the contact details below.
                </p>
              </section>

              <section id="rights" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your rights</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Depending on your jurisdiction you may have rights to access, correct, port or delete your personal data and to object to certain processing. To exercise these rights contact us.
                </p>
              </section>

              <section id="children" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Children</h3>
                <p className="text-gray-700 dark:text-gray-300">NewsFlash is not directed to children under 13. We do not knowingly collect data from children under 13. If you believe we have, contact us and we will take steps to remove the information.</p>
              </section>

              <section id="changes" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Changes to this policy</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update this policy from time to time. Substantive changes will be highlighted on the site and the last updated date will change.
                </p>
              </section>

              <section id="contact" className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Contact us</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  For privacy questions or data requests contact us at
                </p>

                <div className="mt-4">
                  <a
                    href="mailto:zaidbinasim2197@gmail.com"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Email privacy team
                  </a>
                </div>
              </section>
            </article>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>
                This policy is provided for general information only and does not create a contract. If you need legal advice, consult a qualified attorney.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smooth scroll CSS */}
      <style>
        {`html { scroll-behavior: smooth; } 
          .prose a { text-decoration: underline; }
        `}
      </style>
    </div>
  );
}
export default PrivacyPolicy;
