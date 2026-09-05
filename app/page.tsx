import Image from 'next/image';
import Link from 'next/link';

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
              Building a standard interface
              <br />
              for humans and AI.
            </h1>
            <p>
              We make interfaces you can take apart and change. Not just colors
              and settings: the layout, the tools, and the way you interact with
              applications. Agents have that same access.
            </p>
          </div>
          <Link className="company-project" href="/ataxia">
            Ataxia <span aria-hidden="true">→</span>
          </Link>
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
