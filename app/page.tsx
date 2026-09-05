import { Demos } from '@/components/demos';
import Link from 'next/link';

const source = 'https://github.com/SeungheonOh/ataxia';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '↘'}</span>;
}

export default function Home() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Standard Interfaces home">
          <span className="brand-mark" aria-hidden="true">
            s<span>i</span>
          </span>
          <span>
            Standard
            <br />
            Interfaces
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#system">The system</a>
          <a href="#approach">The approach</a>
          <a href={source}>
            Source <Arrow diagonal />
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="product-name">
          <div className="hero-index">
            <span>A programmable interface</span>
            <span>In development</span>
          </div>
          <div className="hero-title-row">
            <h1 id="product-name">
              Ataxia<span className="wordmark-period">.</span>
            </h1>
            <div className="hero-statement">
              <p>
                An interface for you.
                <br />
                And your agents.
              </p>
            </div>
          </div>
          <div className="hero-bottom">
            <p>
              A live, programmable interface. Let agents work with your windows,
              <br className="desktop-break" /> build your tools, and change the
              interface while you use it.
            </p>
            <a className="action-link" href="#system">
              See it in use <Arrow />
            </a>
          </div>
        </section>

        <section
          id="system"
          className="system-section"
          aria-label="An interactive model of an agent working in Ataxia"
        >
          <Demos />
          <div className="figure-caption">
            <span>Inspect the world. Ask in the world. Change the world.</span>
            <span>Interactive model. No live agent or VM connection.</span>
          </div>
        </section>

        <section
          className="approach"
          id="approach"
          aria-labelledby="approach-title"
        >
          <div className="section-intro">
            <span className="eyebrow">The approach</span>
            <h2 id="approach-title">
              The interface is yours
              <br />
              to define.
            </h2>
            <p>
              Not another app to work inside.
              <br />
              An interface that works with your applications.
            </p>
          </div>
          <div className="principles">
            <article className="principle">
              <span className="number">01</span>
              <div>
                <h3>Agentic from the start.</h3>
                <p>
                  Agents can inspect the workspace, arrange windows, and create
                  interfaces that ask for your input. They work with the
                  desktop, not just pictures of it.
                </p>
              </div>
            </article>
            <article className="principle">
              <span className="number">02</span>
              <div>
                <h3>Your world, your rules.</h3>
                <p>
                  Tiling, scrolling columns, an infinite plane, or a different
                  geometry. Define how applications are placed, rendered, and
                  interacted with—not just how the desktop looks.
                </p>
              </div>
            </article>
            <article className="principle">
              <span className="number">03</span>
              <div>
                <h3>Always open to change.</h3>
                <p>
                  Inspect state and redefine behavior in a running Common Lisp
                  image. Keep your applications open while you change the world
                  around them.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="under-the-hood" aria-labelledby="under-title">
          <div className="technical-copy">
            <span className="eyebrow">More than configuration</span>
            <h2 id="under-title">
              A running system.
              <br />
              An open conversation.
            </h2>
            <p>
              Connect through SLY. Read the current state. Call a function. The
              same live image is available to you and your agents.
            </p>
            <a
              className="text-link"
              href={`${source}/blob/main/docs/AGENT_OPERATIONS.md`}
            >
              Read the agent interface <Arrow diagonal />
            </a>
          </div>
          <div className="code-window">
            <div className="window-title">
              <span className="window-square" aria-hidden="true" />
              <span>Listener</span>
              <span className="window-detail">Live image</span>
            </div>
            <div className="code-meta">
              Common Lisp <span>SLY / localhost:4005</span>
            </div>
            <pre aria-label="Common Lisp notification example">
              <code>
                <span className="code-muted">
                  ;; A message, in the running desktop.
                </span>
                {'\n\n'}(ataxia.sly-control:agent-apply{'\n'} (lambda (kernel
                world){'\n'} (declare (ignore kernel)){'\n'}{' '}
                (ataxia.infinite-world:show-notification{'\n'} world{' '}
                <span className="code-string">
                  {'"Your workspace is ready."'}
                </span>
                {'\n'} :title <span className="code-string">{'"AGENT"'}</span>
                )))
                {'\n\n'}
                <span className="code-muted">;; No restart.</span>
              </code>
            </pre>
          </div>
        </section>

        <section className="project-strip" aria-label="Project details">
          <p>
            A Common Lisp Wayland compositor.
            <br />
            <span>
              Built on wlroots. Native UI with Slint. Still taking shape.
            </span>
          </p>
          <a className="action-link inverse" href={source}>
            Explore the source <Arrow diagonal />
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-statement">
          Interfaces should be
          <br />
          <em>personal</em> again.
        </div>
        <div className="footer-end">
          <span>© {new Date().getFullYear()} Standard Interfaces</span>
          <a href={source}>
            Built in the open <Arrow diagonal />
          </a>
        </div>
      </footer>
    </div>
  );
}
