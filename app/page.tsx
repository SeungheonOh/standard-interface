import Image from 'next/image';

export default function Home() {
  return (
    <div className="company-page">
      <main className="company-home">
        <div className="company-intro">
          <Image
            src="/brand/standard-interface-mark.svg"
            width={84}
            height={84}
            alt="Standard Interface"
            unoptimized
          />
          <div className="company-copy">
            <h1>
              <strong>Standard Interface</strong>
              <br />
              for human and AI.
            </h1>
            <p>
              An interface you can take apart and change, directly or through an
              agent. Not just colors and settings: the layout, the tools, and
              the way you interact with applications.
            </p>
          </div>
          {/* oxlint-disable-next-line next/no-html-link-for-pages -- Use browser navigation rather than the client router. */}
          <a className="company-project" href="/ataxia">
            Ataxia <span aria-hidden="true">→</span>
          </a>
        </div>
      </main>
      <footer className="company-footer">
        <span>© {new Date().getFullYear()} Standard Interface</span>
        <nav aria-label="Company links">
          <a href="https://github.com/std-Interface">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
