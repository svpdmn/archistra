import Link from "next/link";

export default function HomePage() {
  return (
    <main className="archistra-home">
      <section className="home-shell card-strong rounded-xl2">
        <p className="font-mono text-accent-400 text-xs tracking-widest">ENTERPRISE PLATFORM</p>
        <h1 className="home-title font-display">Fragments to Intelligence</h1>
        <p className="lead">
          AI-powered Strategy & Architecture Intelligence platform. Start with the chat experience to test
          real backend integration with OpenAI.
        </p>
        <div className="home-actions">
          <Link href="/chat" className="btn btn-primary w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold font-alt">
            Open Chat
          </Link>
          <Link href="/chat" className="btn btn-secondary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold font-alt">
            Start Conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
