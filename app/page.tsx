import Link from "next/link";

const features = [
  { title: "Unlimited Projects", description: "Build and deploy as many projects as you need." },
  { title: "Priority Support", description: "Get help from our team within 2 hours, any time." },
  { title: "Advanced Analytics", description: "Deep insights into usage, performance, and trends." },
  { title: "Custom Domains", description: "Use your own domain with SSL included." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Stripe Payment Demo
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Pro Plan — Everything You Need
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          One simple price. All the tools to ship faster, scale smarter, and grow your business.
        </p>

        <div className="inline-flex items-end gap-1 mb-8">
          <span className="text-5xl font-extrabold text-indigo-600">$49</span>
          <span className="text-2xl font-semibold text-indigo-400">.99</span>
          <span className="text-gray-400 mb-1 ml-1">/ month</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg py-3 px-10 rounded-xl transition-colors shadow-md"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="border border-gray-300 hover:border-indigo-400 text-gray-700 font-semibold text-lg py-3 px-10 rounded-xl transition-colors"
          >
            See Features
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/checkout"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg py-3 px-12 rounded-xl transition-colors shadow-md"
          >
            Subscribe Now — $49.99/mo
          </Link>
          <p className="mt-3 text-sm text-gray-400">Cancel anytime. No hidden fees.</p>
        </div>
      </section>
    </main>
  );
}
