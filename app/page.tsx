import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="company-home">
      <div className="company-intro">
        <Image
          src="/brand/standard-interface-mark.svg"
          width={84}
          height={84}
          alt="Standard Interface"
          unoptimized
        />
        <h1>
          Building a standard interface
          <br />
          for humans and AI.
        </h1>
        <Link className="company-project" href="/ataxia">
          Ataxia <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
