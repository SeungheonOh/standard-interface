'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const notes = [
  {
    title: 'Surface damage',
    body: 'Repaint only the parts of a surface that changed.',
    tag: 'Rendering',
  },
  {
    title: 'Camera motion',
    body: 'Move the viewport without changing window positions.',
    tag: 'World',
  },
  {
    title: 'Cursor damage',
    body: 'Invalidate both the old and new cursor bounds.',
    tag: 'Input',
  },
  {
    title: 'Native widgets',
    body: 'Render a component and deliver its interaction events.',
    tag: 'UI',
  },
];
type Entry = { call: string; result: string };
type State = {
  term: string;
  query: string;
  submitted: string | null;
  step: number;
  running: boolean;
  interrupted: boolean;
  trace: Entry[];
  cursor: { x: number; y: number } | null;
};
type Action =
  | { type: 'inspect'; width: number; height: number }
  | { type: 'pointer'; x: number; y: number }
  | { type: 'text' }
  | { type: 'submit'; agent: boolean }
  | { type: 'query'; value: string }
  | { type: 'term'; value: string }
  | { type: 'run' | 'pause' | 'reset' };
const initial: State = {
  term: 'damage',
  query: '',
  submitted: null,
  step: 0,
  running: false,
  interrupted: false,
  trace: [],
  cursor: null,
};
const search = (query: string) =>
  notes.filter((note) =>
    `${note.title} ${note.body} ${note.tag}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

function reduce(state: State, action: Action): State {
  const append = (entry: Entry) => [...state.trace, entry];
  switch (action.type) {
    case 'reset':
      return initial;
    case 'term':
      return {
        ...state,
        term: action.value,
        step: 0,
        trace: [],
        running: false,
        interrupted: false,
        cursor: null,
      };
    case 'query':
      return {
        ...state,
        query: action.value,
        running: false,
        interrupted: state.running || state.step > 0,
        step: 0,
        trace: [],
        cursor: null,
      };
    case 'run':
      return {
        ...state,
        running: true,
        interrupted: false,
        ...(state.step === 4 ? { step: 0, trace: [], cursor: null } : {}),
      };
    case 'pause':
      return { ...state, running: false };
    case 'inspect':
      return {
        ...state,
        step: 1,
        interrupted: false,
        trace: append({
          call: 'agent-inspect',
          result: `#28  Firefox / mapped\nbounds  ${action.width} × ${action.height}\nsurfaces  1   seat  agent-0`,
        }),
      };
    case 'pointer':
      return {
        ...state,
        step: 2,
        cursor: { x: action.x, y: action.y },
        trace: append({
          call: 'interactable-pointer-motion / button',
          result: `#28  local (${action.x}, ${action.y})\nleft button  pressed → released`,
        }),
      };
    case 'text':
      return {
        ...state,
        step: 3,
        query: state.term,
        trace: append({
          call: 'interactable-key-event',
          result: `Ctrl+A · replace the current query\nType ${JSON.stringify(state.term)}\nKey presses + releases`,
        }),
      };
    case 'submit':
      return {
        ...state,
        step: action.agent ? 4 : 0,
        submitted: state.query,
        running: false,
        cursor: action.agent ? state.cursor : null,
        trace: action.agent
          ? append({
              call: 'interactable-key-event / Enter',
              result:
                'Enter  pressed → released\nDelivered to #28. Application repainted.',
            })
          : [],
        interrupted: !action.agent && state.running,
      };
  }
}

export function DirectInput() {
  const [state, dispatch] = useReducer(reduce, initial);
  const windowRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const advance = useCallback(() => {
    const frame = windowRef.current?.getBoundingClientRect();
    const field = searchRef.current?.getBoundingClientRect();
    if (!frame || !field) return;
    switch (state.step) {
      case 0:
        dispatch({
          type: 'inspect',
          width: Math.round(frame.width),
          height: Math.round(frame.height),
        });
        break;
      case 1:
        dispatch({
          type: 'pointer',
          x: Math.round(field.left - frame.left + 22),
          y: Math.round(field.top - frame.top + field.height / 2),
        });
        searchRef.current?.focus({ preventScroll: true });
        break;
      case 2:
        searchRef.current?.select();
        dispatch({ type: 'text' });
        break;
      case 3:
        dispatch({ type: 'submit', agent: true });
        break;
    }
  }, [state.step]);

  useEffect(() => {
    if (!state.running) return;
    const timer = setTimeout(advance, 650);
    return () => clearTimeout(timer);
  }, [state.running, advance]);

  const results = state.submitted === null ? notes : search(state.submitted);
  const next = [
    'Inspect objects',
    'Click the search field',
    'Type the query',
    'Press Enter',
  ][state.step];

  return (
    <div className="direct-input-demo example-demo">
      <div className="example-scene">
        <div className="input-workbench">
          <section
            ref={windowRef}
            className="input-application"
            aria-label="Example Firefox window"
          >
            <div className="example-window-title">
              <span>Workspace notes</span>
              <span>Firefox / #28</span>
            </div>
            <div className="input-location">notes.local / workspace</div>
            <div className="input-document">
              <span className="input-document-label">ATAXIA / ENGINEERING</span>
              <h4>Workspace notes.</h4>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  dispatch({ type: 'submit', agent: false });
                }}
              >
                <label htmlFor="notes-query">Search notes</label>
                <div className="input-search-row">
                  <Input
                    ref={searchRef}
                    id="notes-query"
                    value={state.query}
                    onChange={(event) =>
                      dispatch({ type: 'query', value: event.target.value })
                    }
                    placeholder="Search this notebook"
                    autoComplete="off"
                  />
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </div>
              </form>
              <div className="input-results" aria-live="polite">
                <p>
                  {state.submitted === null
                    ? '4 notes'
                    : `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${state.submitted}”`}
                </p>
                {results.length === 0 ? (
                  <div className="input-empty">
                    No matching notes. Try “damage”, “camera”, or “widgets”.
                  </div>
                ) : (
                  results.map((note) => (
                    <article key={note.title}>
                      <span>{note.tag}</span>
                      <h5>{note.title}</h5>
                      <p>{note.body}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
            {state.cursor && (
              <span
                className="injected-cursor"
                aria-hidden="true"
                style={{ left: state.cursor.x, top: state.cursor.y }}
              >
                <svg width="15" height="22" viewBox="0 0 15 22">
                  <path
                    d="M1 1v17l4-4 3 7 3-1-3-7h6Z"
                    fill="#111"
                    stroke="white"
                  />
                </svg>
                <span>agent-0</span>
              </span>
            )}
          </section>
        </div>
        <aside
          className="example-agent"
          aria-label="Direct Agentic Control harness"
        >
          <div className="canvas-agent-title">
            <span>agent / object + input access</span>
            <span>model</span>
          </div>
          <div className="canvas-agent-body">
            <label className="input-request-label" htmlFor="agent-query">
              Find notes about
            </label>
            <Input
              id="agent-query"
              value={state.term}
              onChange={(event) =>
                dispatch({ type: 'term', value: event.target.value })
              }
              maxLength={80}
              autoComplete="off"
            />
            <div className="input-trace" aria-live="polite" aria-atomic="true">
              {state.trace.length === 0 ? (
                <p>
                  {state.interrupted
                    ? 'You took over. The agent stopped.'
                    : 'Inspect the window, focus its surface, then send pointer and keyboard events.'}
                </p>
              ) : (
                state.trace.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      'harness-call',
                      index === 3 && 'input-complete',
                    )}
                  >
                    <strong>↳ {entry.call}</strong>
                    <pre>{entry.result}</pre>
                  </div>
                ))
              )}
            </div>
            <div className="input-run-controls">
              <Button
                onClick={() =>
                  dispatch({ type: state.running ? 'pause' : 'run' })
                }
                disabled={!state.term.trim()}
              >
                {state.running
                  ? 'Pause'
                  : state.step === 4
                    ? 'Run again ↵'
                    : 'Run request ↵'}
              </Button>
              <Button
                variant="outline"
                disabled={
                  state.running || state.step === 4 || !state.term.trim()
                }
                onClick={advance}
              >
                Step →
              </Button>
            </div>
            <p className="input-next">
              {state.step === 4
                ? 'Complete. The application handled the input.'
                : `Next: ${next}`}
            </p>
            <p className="example-explanation">
              Inspect windows, surfaces, seats, and world state. Send normal
              pointer and keyboard input to applications.
            </p>
          </div>
        </aside>
      </div>
      <div className="world-caption">
        <Button
          variant="ghost"
          className="world-reset"
          onClick={() => dispatch({ type: 'reset' })}
        >
          Reset example ↺
        </Button>
      </div>
    </div>
  );
}
