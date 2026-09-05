'use client';

import { useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Layout = 'tiling' | 'columns' | 'orbit';
const objects = [
  { id: 28, title: 'World notes', app: 'Firefox' },
  { id: 11, title: 'Listener', app: 'foot' },
  { id: 7, title: 'Scratchpad', app: 'Slint' },
];
const layouts: {
  id: Layout;
  title: string;
  request: string;
  detail: string;
}[] = [
  {
    id: 'tiling',
    title: 'Tiling',
    request: 'Give the reference most of the screen.',
    detail:
      'Divide the output. No overlap. Select a window to give it the main pane.',
  },
  {
    id: 'columns',
    title: 'Scrolling columns',
    request: 'Put these in a strip I can move through.',
    detail:
      'Each window keeps a column. Move the viewport without rearranging the strip.',
  },
  {
    id: 'orbit',
    title: 'An orbit',
    request: 'Place the windows around me.',
    detail:
      'Place objects on a ring in depth. Turn the view to bring another one forward.',
  },
];
const initialNote =
  'Keep the applications open.\nChange the rules around them.';

export function WorldLayouts() {
  const [layout, setLayout] = useState<Layout>('tiling');
  const [active, setActive] = useState(0);
  const [note, setNote] = useState(initialNote);
  const [revision, setRevision] = useState(0);
  const selected = layouts.find((item) => item.id === layout)!;

  function changeLayout(next: Layout) {
    if (next === layout) return;
    setLayout(next);
    setRevision((current) => current + 1);
  }

  function windowStyle(index: number): CSSProperties {
    if (layout === 'tiling') {
      const side = objects
        .map((_, position) => position)
        .filter((position) => position !== active)
        .indexOf(index);
      return index === active
        ? { left: '3%', top: '5%', width: '57%', height: '90%' }
        : {
            left: '62%',
            top: side === 0 ? '5%' : '52%',
            width: '35%',
            height: '43%',
          };
    }
    if (layout === 'columns') {
      return {
        left: '50%',
        top: '10%',
        width: '72%',
        height: '80%',
        transform: `translateX(${(index - active) * 106 - 50}%)`,
      };
    }
    const angle = ((index - active) * Math.PI * 2) / objects.length;
    return {
      left: `${50 + Math.sin(angle) * 31}%`,
      top: `${48 + (1 - Math.cos(angle)) * 6}%`,
      width: '61%',
      height: '70%',
      zIndex: index === active ? 20 : 10,
      transform: `translate(-50%, -50%) translateZ(${(Math.cos(angle) - 1) * 270}px) rotateY(${-Math.sin(angle) * 16}deg)`,
    };
  }

  return (
    <div className="world-layout-demo example-demo">
      <div className="example-scene">
        <div className="layout-workbench">
          <div className={cn('layout-stage', 'layout-' + layout)}>
            {layout === 'orbit' && (
              <div className="orbit-guide" aria-hidden="true" />
            )}
            {objects.map((object, index) => (
              <section
                key={object.id}
                className={cn(
                  'layout-window',
                  index === active && 'is-current',
                )}
                style={windowStyle(index)}
                aria-label={object.title}
              >
                <Button
                  variant="ghost"
                  className="example-window-title"
                  aria-label={`Focus ${object.title}`}
                  onClick={() => setActive(index)}
                >
                  <span>{object.title}</span>
                  <span>#{object.id}</span>
                </Button>
                {object.id === 28 ? (
                  <article className="layout-reference">
                    <span>ATAXIA / WORLD</span>
                    <h4>Placement is a choice.</h4>
                    <p>
                      The application supplies a surface. The world decides
                      where it goes—and how you reach it.
                    </p>
                    <dl>
                      <div>
                        <dt>Rendering</dt>
                        <dd>World</dd>
                      </div>
                      <div>
                        <dt>Hit testing</dt>
                        <dd>World</dd>
                      </div>
                      <div>
                        <dt>Input delivery</dt>
                        <dd>Kernel</dd>
                      </div>
                    </dl>
                  </article>
                ) : object.id === 11 ? (
                  <pre className="layout-listener">
                    {'CL-USER> (agent-inspect …)\n\n#28  WAYLAND / Firefox\n#11  WAYLAND / foot\n #7  NATIVE  / Scratchpad\n\n; objects retained\n; world revision ' +
                      revision}
                  </pre>
                ) : (
                  <div className="layout-scratchpad">
                    <label htmlFor="world-scratchpad">
                      Write something, then switch worlds.
                    </label>
                    <Textarea
                      id="world-scratchpad"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                    <span>Native component · object #7</span>
                  </div>
                )}
              </section>
            ))}
          </div>
          <div className="layout-navigation">
            <Button
              variant="outline"
              aria-label="Previous window"
              onClick={() =>
                setActive(
                  (current) => (current + objects.length - 1) % objects.length,
                )
              }
            >
              ←
            </Button>
            <span>
              {objects[active].title}{' '}
              <small>
                {active + 1} / {objects.length}
              </small>
            </span>
            <Button
              variant="outline"
              aria-label="Next window"
              onClick={() =>
                setActive((current) => (current + 1) % objects.length)
              }
            >
              →
            </Button>
          </div>
        </div>
        <aside className="example-agent" aria-label="World definition harness">
          <div className="canvas-agent-title">
            <span>agent / world behavior</span>
            <span>model</span>
          </div>
          <div className="canvas-agent-body">
            <p className="canvas-agent-request">
              <span aria-hidden="true">›</span>
              {selected.request}
            </p>
            <div
              className="canvas-agent-log cue-done"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>↳ change world behavior</strong>
              <pre>{`objects   #28 · #11 · #7\nworld     ${layout}\nrevision  ${revision}\n\nSame applications. Same contents.`}</pre>
            </div>
            <div
              className="canvas-agent-actions"
              aria-label="World representations"
            >
              {layouts.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  aria-pressed={layout === item.id}
                  onClick={() => changeLayout(item.id)}
                >
                  {item.title}
                  <span aria-hidden="true">
                    {layout === item.id ? '●' : '↗'}
                  </span>
                </Button>
              ))}
            </div>
            <p className="example-explanation">{selected.detail}</p>
          </div>
        </aside>
      </div>
      <div className="world-caption">
        <Button
          variant="ghost"
          className="world-reset"
          onClick={() => {
            setLayout('tiling');
            setActive(0);
            setNote(initialNote);
            setRevision(0);
          }}
        >
          Reset example ↺
        </Button>
      </div>
    </div>
  );
}
