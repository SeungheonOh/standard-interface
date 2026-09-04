'use client';

import { useEffect, useReducer, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Action = 'arrange' | 'widget' | 'edit';
type Phase = 'idle' | 'reading' | 'applying' | 'waiting' | 'done';
type Run = {
  action: Action;
  target: boolean;
  prompt: string;
  steps: [string, string];
  result: string;
};
type WorkspaceState = {
  tiled: boolean;
  widget: boolean;
  largeType: boolean;
  revision: number;
  phase: Phase;
  run: Run | null;
  result: string | null;
};
type Event =
  | { type: 'request'; action: Action }
  | { type: 'advance' }
  | { type: 'complete' }
  | { type: 'reply'; tiled: boolean }
  | { type: 'reset' };

const initialState: WorkspaceState = {
  tiled: false,
  widget: false,
  largeType: false,
  revision: 0,
  phase: 'idle',
  run: null,
  result: null,
};

function makeRun(action: Action, state: WorkspaceState): Run {
  if (action === 'arrange') {
    return {
      action,
      target: !state.tiled,
      prompt: state.tiled
        ? 'Give me room to spread things out.'
        : 'Give my notes and code their own space.',
      steps: [
        'Inspect 2 open applications',
        state.tiled
          ? 'Restore the open canvas'
          : 'Tile the application windows',
      ],
      result: state.tiled
        ? 'Back on the canvas. Both applications are still open.'
        : 'Both windows have their own space now. Nothing closed.',
    };
  }
  if (action === 'widget') {
    return {
      action,
      target: true,
      prompt: 'Help me choose how to arrange this.',
      steps: [
        'Read the current layout',
        'Create a choice widget in the workspace',
      ],
      result: 'I added a small interface. Choose a layout and I’ll apply it.',
    };
  }
  return {
    action,
    target: !state.largeType,
    prompt: state.largeType
      ? 'Restore the original text size.'
      : 'Make the notes and code easier to read.',
    steps: [
      'Inspect the current text settings',
      state.largeType
        ? 'Restore the text size'
        : 'Increase text size in both windows',
    ],
    result: state.largeType
      ? 'Original text size restored. No restart.'
      : 'Larger text in both windows. The interface changed in place.',
  };
}

function updateWorkspace(state: WorkspaceState, event: Event): WorkspaceState {
  switch (event.type) {
    case 'reset':
      return initialState;
    case 'request':
      if (['reading', 'applying', 'waiting'].includes(state.phase))
        return state;
      return {
        ...state,
        phase: 'reading',
        run: makeRun(event.action, state),
        result: null,
      };
    case 'advance':
      return state.phase === 'reading'
        ? { ...state, phase: 'applying' }
        : state;
    case 'complete': {
      if (state.phase !== 'applying' || !state.run) return state;
      const { action, target, result } = state.run;
      return {
        ...state,
        tiled: action === 'arrange' ? target : state.tiled,
        widget: action === 'widget' ? target : state.widget,
        largeType: action === 'edit' ? target : state.largeType,
        revision: state.revision + 1,
        phase: action === 'widget' ? 'waiting' : 'done',
        result,
      };
    }
    case 'reply':
      if (state.phase !== 'waiting') return state;
      return {
        ...state,
        tiled: event.tiled,
        widget: false,
        phase: 'done',
        revision: state.revision + 1,
        result: event.tiled
          ? 'You chose a tiled layout. I arranged both windows.'
          : 'You chose open canvas. I spread the windows out.',
      };
  }
}

function WindowTitle({
  children,
  detail,
}: {
  children: ReactNode;
  detail?: string;
}) {
  return (
    <div className="window-title">
      <span className="window-square" aria-hidden="true" />
      <span>{children}</span>
      {detail && <span className="window-detail">{detail}</span>}
    </div>
  );
}

export function Workspace() {
  const [state, dispatch] = useReducer(updateWorkspace, initialState);
  const { tiled, widget, largeType, revision, phase, run, result } = state;
  const busy = phase === 'reading' || phase === 'applying';

  // These short, cancellable steps illustrate a workflow; no LLM is connected.
  useEffect(() => {
    if (phase !== 'reading' && phase !== 'applying') return;
    const timer = window.setTimeout(
      () => dispatch({ type: phase === 'reading' ? 'advance' : 'complete' }),
      650,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  const activity = {
    idle: 'Ready',
    reading: 'Inspecting',
    applying: 'Applying',
    waiting: 'Your turn',
    done: 'Done',
  }[phase];
  const status =
    phase === 'reading'
      ? 'Reading the workspace…'
      : phase === 'applying'
        ? run?.steps[1] + '…'
        : (result ?? 'Choose a request to see the interface change.');

  return (
    <div className="workspace-frame">
      <div className="desktop-menubar">
        <span className="desktop-name">Ataxia</span>
        <span className="desktop-path">
          {tiled ? 'Tiled layout' : 'Infinite canvas'}
        </span>
        <Button
          variant="ghost"
          className="reset-button"
          onClick={() => dispatch({ type: 'reset' })}
        >
          Reset demo <span aria-hidden="true">↺</span>
        </Button>
      </div>

      <div className="workspace-body">
        <aside className="agent-panel" aria-labelledby="agent-title">
          <div className="agent-heading">
            <span className="agent-monogram" aria-hidden="true">
              ↗
            </span>
            <h3 id="agent-title">Workspace agent</h3>
            <span className="demo-badge">Demo</span>
          </div>
          <div className="agent-presence">
            <span
              className={cn('presence-dot', busy && 'is-working')}
              aria-hidden="true"
            />
            <span>{activity}</span>
            <span className="agent-context">2 applications in view</span>
          </div>

          <div className="agent-task" aria-busy={busy}>
            {run ? (
              <>
                <div className="user-request">
                  <span>You</span>
                  <p>{run.prompt}</p>
                </div>
                <ol className="agent-steps" aria-label="Agent actions">
                  {run.steps.map((step, index) => {
                    const completed = index === 0 ? phase !== 'reading' : !busy;
                    const current =
                      index === 0 ? phase === 'reading' : phase === 'applying';
                    return (
                      <li
                        key={step}
                        className={cn(
                          current && 'current-step',
                          completed && 'completed-step',
                        )}
                      >
                        <span className="step-mark" aria-hidden="true">
                          {completed ? '✓' : current ? '·' : '—'}
                        </span>
                        <span>{step}</span>
                        <span className="sr-only">
                          {completed
                            ? ', complete'
                            : current
                              ? ', in progress'
                              : ', pending'}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {result && (
                  <div className="agent-result">
                    <span>Agent</span>
                    <p>{result}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="agent-intro">
                <p>What would make this workspace work better for you?</p>
                <span>Try a request below.</span>
              </div>
            )}
          </div>

          <div className="agent-suggestions">
            <span className="suggestion-label">
              {phase === 'waiting'
                ? 'Choose in the workspace to continue'
                : 'Try a request'}
            </span>
            <div className="agent-actions">
              <Button
                className="request-button"
                variant="ghost"
                disabled={busy || phase === 'waiting'}
                onClick={() => dispatch({ type: 'request', action: 'arrange' })}
              >
                {tiled ? 'Spread things out' : 'Arrange my windows'}
                <span aria-hidden="true">↗</span>
              </Button>
              <Button
                className="request-button"
                variant="ghost"
                disabled={busy || phase === 'waiting'}
                onClick={() => dispatch({ type: 'request', action: 'widget' })}
              >
                Give me a choice <span aria-hidden="true">↗</span>
              </Button>
              <Button
                className="request-button"
                variant="ghost"
                disabled={busy || phase === 'waiting'}
                onClick={() => dispatch({ type: 'request', action: 'edit' })}
              >
                {largeType
                  ? 'Restore the text size'
                  : 'Make this easier to read'}
                <span aria-hidden="true">↗</span>
              </Button>
            </div>
          </div>
        </aside>

        <div
          className={cn(
            'workspace-stage',
            tiled && 'is-tiled',
            largeType && 'large-type',
          )}
        >
          <div className="canvas-origin" aria-hidden="true">
            <span>+</span> 0, 0
          </div>
          <div className="demo-window notes-window">
            <WindowTitle detail="notes">Field notes</WindowTitle>
            <div className="notes-content">
              <div className="document-meta">Untitled / 01</div>
              <h3>A place to think.</h3>
              <p>The notes, the code, the things still in progress.</p>
              <div className="notes-rule" />
              <p className="document-item">
                <span>01.</span> Keep the context.
              </p>
              <p className="document-item">
                <span>02.</span> Make your own tools.
              </p>
              <p className="document-item">
                <span>03.</span> Leave room to change.
              </p>
              <div className="document-footer">
                Your workspace <span aria-hidden="true">↗</span>
              </div>
            </div>
          </div>

          <div className="demo-window code-demo-window">
            <WindowTitle detail="Lisp">world.lisp</WindowTitle>
            <div className="editor-content">
              <div className="editor-line">
                <span>01</span>
                <code>(defun my-workspace ()</code>
              </div>
              <div className="editor-line">
                <span>02</span>
                <code> (make-infinite-world))</code>
              </div>
              <div className="editor-line">
                <span>03</span>
                <code>&nbsp;</code>
              </div>
              <div className="editor-line">
                <span>04</span>
                <code className="code-muted">;; Start where you are.</code>
              </div>
              <div className="editor-line">
                <span>05</span>
                <code className="code-muted">;; Change what you need.</code>
              </div>
              <div className="editor-line">
                <span>06</span>
                <code>&nbsp;</code>
              </div>
              <div className="editor-line">
                <span>07</span>
                <code>
                  <span className="editor-caret" aria-hidden="true">
                    {' '}
                  </span>
                </code>
              </div>
            </div>
            <div className="editor-status">
              Common Lisp <span>Image running</span>
            </div>
          </div>

          <div className="demo-window inspector-window">
            <WindowTitle>World state</WindowTitle>
            <dl>
              <div>
                <dt>layout</dt>
                <dd>{tiled ? 'tiled' : 'infinite'}</dd>
              </div>
              <div>
                <dt>text</dt>
                <dd>{largeType ? 'larger' : 'original'}</dd>
              </div>
              <div>
                <dt>revision</dt>
                <dd>{String(revision).padStart(2, '0')}</dd>
              </div>
            </dl>
          </div>

          {widget && (
            <div
              className="demo-window choice-window"
              aria-label="Agent-created layout choice"
            >
              <WindowTitle detail="from your agent">A quick choice</WindowTitle>
              <div className="choice-content">
                <p>How do you want to work?</p>
                <div className="choice-actions">
                  <Button
                    className="system-button primary-button"
                    onClick={() => dispatch({ type: 'reply', tiled: true })}
                  >
                    Tiled layout
                  </Button>
                  <Button
                    variant="outline"
                    className="system-button"
                    onClick={() => dispatch({ type: 'reply', tiled: false })}
                  >
                    Open canvas
                  </Button>
                </div>
                <span>Your answer changes the workspace.</span>
              </div>
            </div>
          )}
          <div className="stage-coordinate" aria-hidden="true">
            <span>{tiled ? 'Tiled world' : 'Infinite world'}</span>
            <span>rev. {String(revision).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
      <output className="desktop-status" aria-live="polite" aria-atomic="true">
        <span className="status-square" aria-hidden="true" />
        <span>{status}</span>
        <span className="status-end">{activity}</span>
      </output>
    </div>
  );
}
