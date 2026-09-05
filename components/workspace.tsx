'use client';

import {
  useReducer,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WindowId = 'reference' | 'agent';
type Point = { x: number; y: number };
type Phase = 'ready' | 'waiting' | 'applied' | 'cancelled';
type State = {
  phase: Phase;
  positions: Record<WindowId, Point>;
  inspected: Record<WindowId, Point> | null;
  sequence: number;
  raised: WindowId;
};
type Action =
  | { type: 'move'; id: WindowId; position: Point }
  | { type: 'raise'; id: WindowId }
  | { type: 'run' }
  | { type: 'reply'; apply: boolean }
  | { type: 'reset' };

const initial: State = {
  phase: 'ready',
  positions: { reference: { x: 64, y: 78 }, agent: { x: 552, y: 172 } },
  inspected: null,
  sequence: 0,
  raised: 'agent',
};
const arranged = { reference: { x: 32, y: 78 }, agent: { x: 600, y: 78 } };
const point = (value: Point) =>
  '(' + Math.round(value.x) + ', ' + Math.round(value.y) + ')';

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initial;
    case 'raise':
      return { ...state, raised: action.id };
    case 'move':
      return {
        ...state,
        positions: { ...state.positions, [action.id]: action.position },
        raised: action.id,
      };
    case 'run':
      return state.phase === 'waiting'
        ? state
        : { ...state, inspected: state.positions, phase: 'waiting' };
    case 'reply':
      if (state.phase !== 'waiting') return state;
      return {
        ...state,
        phase: action.apply ? 'applied' : 'cancelled',
        sequence: state.sequence + 1,
        positions: action.apply ? arranged : state.positions,
      };
  }
}

function SceneWindow({
  id,
  title,
  detail,
  position,
  raised,
  move,
  raise,
  children,
}: {
  id: WindowId;
  title: string;
  detail: string;
  position: Point;
  raised: boolean;
  move: (position: Point) => void;
  raise: () => void;
  children: ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointer: number;
    x: number;
    y: number;
    start: Point;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  function bounds() {
    const element = frame.current;
    const stage = element?.closest('[data-world]')?.getBoundingClientRect();
    if (!element || !stage || stage.width <= 700) return null;
    const window = element.getBoundingClientRect();
    return {
      width: stage.width,
      height: stage.height,
      maxX: Math.max(0, 1280 - (window.width / stage.width) * 1280),
      maxY: Math.max(0, 800 - (window.height / stage.height) * 800),
    };
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const limits = bounds();
    if (!limits) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: position,
      ...limits,
    };
    setDragging(true);
    raise();
  }

  function finish() {
    drag.current = null;
    setDragging(false);
  }

  return (
    <div
      className={cn(
        'scene-window-anchor',
        id,
        raised && 'is-raised',
        dragging && 'is-dragging',
      )}
      style={{
        transform:
          'translate(' +
          (position.x / 1280) * 100 +
          '%, ' +
          (position.y / 800) * 100 +
          '%)',
      }}
    >
      <div className="scene-window" ref={frame}>
        <Button
          variant="ghost"
          className="scene-title"
          aria-label={
            'Move ' + title + '. On a wide screen, drag or use the arrow keys.'
          }
          onClick={raise}
          onPointerDown={start}
          onPointerMove={(event) => {
            const active = drag.current;
            if (!active || active.pointer !== event.pointerId) return;
            move({
              x: Math.max(
                0,
                Math.min(
                  active.maxX,
                  active.start.x +
                    ((event.clientX - active.x) / active.width) * 1280,
                ),
              ),
              y: Math.max(
                0,
                Math.min(
                  active.maxY,
                  active.start.y +
                    ((event.clientY - active.y) / active.height) * 800,
                ),
              ),
            });
          }}
          onPointerUp={finish}
          onPointerCancel={finish}
          onLostPointerCapture={finish}
          onKeyDown={(event) => {
            const directions: Record<string, Point> = {
              ArrowLeft: { x: -1, y: 0 },
              ArrowRight: { x: 1, y: 0 },
              ArrowUp: { x: 0, y: -1 },
              ArrowDown: { x: 0, y: 1 },
            };
            const direction = directions[event.key];
            const limits = bounds();
            if (!direction || !limits) return;
            event.preventDefault();
            const distance = event.shiftKey ? 40 : 12;
            move({
              x: Math.max(
                0,
                Math.min(limits.maxX, position.x + direction.x * distance),
              ),
              y: Math.max(
                0,
                Math.min(limits.maxY, position.y + direction.y * distance),
              ),
            });
          }}
        >
          <span className="scene-window-mark" aria-hidden="true" />
          <span>{title}</span>
          <span className="scene-title-detail">{detail}</span>
        </Button>
        {children}
      </div>
    </div>
  );
}

export function Workspace() {
  const [state, dispatch] = useReducer(reduce, initial);
  const { phase, inspected, sequence } = state;
  const waiting = phase === 'waiting';
  const source =
    'https://github.com/SeungheonOh/ataxia/blob/main/docs/AGENT_OPERATIONS.md';
  const windowProps = (id: WindowId) => ({
    id,
    position: state.positions[id],
    raised: state.raised === id,
    move: (position: Point) => dispatch({ type: 'move', id, position }),
    raise: () => dispatch({ type: 'raise', id }),
  });

  return (
    <div className="workspace-demo">
      <div
        className={cn('world-scene', phase === 'applied' && 'is-arranged')}
        data-world
      >
        <span className="world-label">ataxia / infinite-world</span>

        <SceneWindow
          {...windowProps('agent')}
          title="foot"
          detail="agent / local session"
        >
          <div className="harness">
            <div className="harness-command">
              <span>$</span> ataxia-eval{' '}
              <span className="harness-target">ataxia · SLY :4005</span>
            </div>
            <div className="harness-request">
              <span aria-hidden="true">›</span>
              <p>
                Put the reference beside my terminal.
                <br />
                Ask me before moving anything.
              </p>
            </div>
            <div className="harness-log" aria-live="polite" aria-atomic="true">
              {!inspected ? (
                <div className="harness-ready">
                  <p>World access</p>
                  <dl>
                    <div>
                      <dt>world</dt>
                      <dd>infinite-world</dd>
                    </div>
                    <div>
                      <dt>objects</dt>
                      <dd>2 available</dd>
                    </div>
                    <div>
                      <dt>tools</dt>
                      <dd>inspect · apply · events</dd>
                    </div>
                  </dl>
                  <span>Run the request to see the agent work.</span>
                </div>
              ) : (
                <>
                  <div className="harness-call">
                    <strong>
                      <span>↳</span> agent-inspect
                    </strong>
                    <pre>
                      {'#28  firefox  ' +
                        point(inspected.reference) +
                        '\n#11  foot     ' +
                        point(inspected.agent)}
                    </pre>
                  </div>
                  <div className="harness-call">
                    <strong>
                      <span>↳</span> agent-apply
                    </strong>
                    <pre>make-agent-widget → #3 LayoutChoice</pre>
                  </div>
                  <div className="harness-call cue-input">
                    <strong>
                      <span>↳</span> wait-for-agent-events
                    </strong>
                    <pre>
                      {waiting
                        ? 'Waiting for your choice in the world.'
                        : '(:source 3 :name "' +
                          (phase === 'applied' ? 'arrange' : 'cancel') +
                          '"\n :sequence ' +
                          sequence +
                          ')'}
                    </pre>
                  </div>
                  {phase === 'applied' && (
                    <div className="harness-call">
                      <strong>
                        <span>↳</span> agent-apply
                      </strong>
                      <pre>
                        {'set-window-position\n#28 → ' +
                          point(arranged.reference) +
                          '\n#11 → ' +
                          point(arranged.agent)}
                      </pre>
                    </div>
                  )}
                  {phase === 'applied' && (
                    <div className="harness-outcome">
                      <span aria-hidden="true">✓</span>
                      <p>Layout applied. Both windows stay open.</p>
                    </div>
                  )}
                  {phase === 'cancelled' && (
                    <div className="harness-outcome">
                      <span aria-hidden="true">—</span>
                      <p>Nothing moved. Your layout is unchanged.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="harness-footer">
              <span
                className={cn(
                  'harness-status',
                  waiting
                    ? 'cue-waiting'
                    : phase === 'ready'
                      ? 'cue-ready'
                      : 'cue-done',
                )}
              >
                {waiting
                  ? 'Waiting for input'
                  : phase === 'ready'
                    ? 'Ready'
                    : 'Request complete'}
              </span>
              <Button
                className="harness-run"
                aria-disabled={waiting}
                onClick={() => dispatch({ type: 'run' })}
              >
                {waiting
                  ? 'Choose in the widget'
                  : phase === 'ready'
                    ? 'Run request ↵'
                    : 'Run again ↵'}
              </Button>
            </div>
          </div>
        </SceneWindow>

        {waiting && (
          <section className="native-choice" aria-labelledby="choice-title">
            <div className="native-choice-title">
              <span>AGENT / LAYOUT</span>
              <span>Slint widget</span>
            </div>
            <div className="native-choice-body">
              <h3 id="choice-title">Give both windows their own space?</h3>
              <p>Same workspace. Nothing closes.</p>
              <div className="native-choice-actions">
                <Button
                  className="native-apply"
                  onClick={() => dispatch({ type: 'reply', apply: true })}
                >
                  Apply layout <span aria-hidden="true">↗</span>
                </Button>
                <Button
                  variant="outline"
                  className="native-cancel"
                  onClick={() => dispatch({ type: 'reply', apply: false })}
                >
                  Not now
                </Button>
              </div>
            </div>
          </section>
        )}

        <SceneWindow
          {...windowProps('reference')}
          title="Agent operations"
          detail="Firefox"
        >
          <div className="reference-location">
            <span aria-hidden="true">↶</span>
            <span>ataxia / docs / AGENT_OPERATIONS.md</span>
          </div>
          <article className="reference-document">
            <div className="reference-eyebrow">ATAXIA / REFERENCE</div>
            <h3>
              The world is
              <br />
              programmable.
            </h3>
            <p>
              Read the running state. Move a window. Put a new interface around
              the task.
            </p>
            <div className="reference-rule" />
            <div className="reference-api">
              <span>01</span>
              <div>
                <strong>Inspect</strong>
                <p>Applications, surfaces, coordinates.</p>
              </div>
            </div>
            <div className="reference-api">
              <span>02</span>
              <div>
                <strong>Apply</strong>
                <p>Change the world in the live image.</p>
              </div>
            </div>
            <div className="reference-api">
              <span>03</span>
              <div>
                <strong>Listen</strong>
                <p>Receive input from native widgets.</p>
              </div>
            </div>
            <a href={source} target="_blank" rel="noreferrer">
              Read the interface <span aria-hidden="true">↗</span>
            </a>
          </article>
        </SceneWindow>

        <div className="world-bottom">
          <span>1280 × 800 · world coordinates</span>
        </div>
      </div>
      <div className="world-caption">
        <Button
          variant="ghost"
          className="world-reset"
          onClick={() => dispatch({ type: 'reset' })}
        >
          Reset workspace <span aria-hidden="true">↺</span>
        </Button>
      </div>
    </div>
  );
}
