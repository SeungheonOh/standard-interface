'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const words = [
  'form',
  'structure',
  'harmony',
  'coherence',
  'pattern',
  'creation',
];

export function DisorderLine() {
  const element = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    function sync() {
      clearInterval(timer);
      if (visible && !document.hidden && !motion.matches && !paused) {
        timer = setInterval(() => setIndex((current) => current + 1), 2400);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (element.current) observer.observe(element.current);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
    };
  }, [paused]);

  return (
    <Button
      ref={element}
      variant="ghost"
      className={cn('disorder-line', index > 0 && 'has-ticked')}
      aria-pressed={paused}
      title={paused ? 'Resume word rotation' : 'Pause word rotation'}
      onClick={() => setPaused((current) => !current)}
    >
      <span className="sr-only">
        From disorder comes form, structure, harmony, coherence, pattern,
        creation. {paused ? 'Resume' : 'Pause'} word rotation.
      </span>
      <span className="disorder-line-label" aria-hidden="true">
        {[false, true].map((personal) => (
          <span
            key={String(personal)}
            className={cn('disorder-copy', personal && 'is-personal')}
          >
            From disorder comes{' '}
            {personal && (
              <>
                <span className="disorder-your disorder-ink">your</span>{' '}
              </>
            )}
            <span className="disorder-word">
              {words.map((word, position) => (
                <span
                  key={word}
                  className={cn(
                    position === index % words.length && 'is-current',
                    index > 0 &&
                      position === (index - 1) % words.length &&
                      'is-previous',
                  )}
                >
                  <span
                    className="disorder-ink"
                    style={
                      { '--character-count': word.length + 1 } as CSSProperties
                    }
                  >
                    {word}.
                  </span>
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Button>
  );
}
