'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Action = 'arrange' | 'widget' | 'edit';

function WindowTitle({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div className={cn('window-title', active && 'active-title')}>
      <span className="window-square" aria-hidden="true" />
      <span>{children}</span>
      <span className="window-hatch" aria-hidden="true" />
    </div>
  );
}

export function Workspace() {
  const [tiled, setTiled] = useState(false);
  const [widget, setWidget] = useState(false);
  const [largeType, setLargeType] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  function perform(nextAction: Action) {
    setAction(nextAction);
    setReply(null);
    setRevision((value) => value + 1);
    if (nextAction === 'arrange') setTiled((value) => !value);
    if (nextAction === 'widget') setWidget((value) => !value);
    if (nextAction === 'edit') setLargeType((value) => !value);
  }

  function reset() {
    setTiled(false);
    setWidget(false);
    setLargeType(false);
    setAction(null);
    setReply(null);
    setRevision(0);
  }

  const status =
    reply ??
    (action === 'arrange'
      ? tiled
        ? 'Windows arranged. Same applications, a different view.'
        : 'Back on the canvas. Nothing closed.'
      : action === 'widget'
        ? widget
          ? 'A small interface, made for the next decision.'
          : 'Widget removed. The workspace stays.'
        : action === 'edit'
          ? largeType
            ? 'Text size updated in the running workspace.'
            : 'Original text size restored.'
          : 'A few windows. A live system. You decide what happens next.');

  return (
    <div className="workspace-frame">
      <div className="desktop-menubar">
        <span className="desktop-name">
          <span aria-hidden="true">▧</span> Ataxia
        </span>
        <span className="desktop-path">
          World / {tiled ? 'Tiled' : 'Infinite canvas'}
        </span>
        <Button variant="ghost" className="reset-button" onClick={reset}>
          Reset <span aria-hidden="true">↺</span>
        </Button>
      </div>
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
          <WindowTitle>Field notes</WindowTitle>
          <div className="notes-content">
            <div className="document-meta">UNTITLED / 01</div>
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
              PERSONAL COMPUTING <span aria-hidden="true">↗</span>
            </div>
          </div>
        </div>

        <div className="demo-window code-demo-window">
          <WindowTitle>world.lisp</WindowTitle>
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
            COMMON LISP <span>Image: running</span>
          </div>
        </div>

        <div className="demo-window inspector-window">
          <WindowTitle>Inspector</WindowTitle>
          <dl>
            <div>
              <dt>world</dt>
              <dd>{tiled ? 'tiled' : 'infinite'}</dd>
            </div>
            <div>
              <dt>applications</dt>
              <dd>2</dd>
            </div>
            <div>
              <dt>type</dt>
              <dd>{largeType ? 'larger' : 'original'}</dd>
            </div>
            <div>
              <dt>revision</dt>
              <dd>{String(revision).padStart(2, '0')}</dd>
            </div>
          </dl>
        </div>

        <div className="demo-window agent-window">
          <WindowTitle active>Agent → workspace</WindowTitle>
          <div className="agent-content">
            <span className="agent-label">DIRECT ACCESS. SMALL ACTIONS.</span>
            <p>What would you like to change?</p>
            <div className="agent-actions">
              <Button
                className="system-button"
                variant="outline"
                onClick={() => perform('arrange')}
                aria-pressed={tiled}
              >
                <span>01</span>
                {tiled ? 'Return to canvas' : 'Arrange my windows'}
                <span aria-hidden="true">↵</span>
              </Button>
              <Button
                className="system-button"
                variant="outline"
                onClick={() => perform('widget')}
                aria-pressed={widget}
              >
                <span>02</span>
                {widget ? 'Remove the widget' : 'Make me a widget'}
                <span aria-hidden="true">↵</span>
              </Button>
              <Button
                className="system-button"
                variant="outline"
                onClick={() => perform('edit')}
                aria-pressed={largeType}
              >
                <span>03</span>
                {largeType ? 'Restore the type' : 'Make the type larger'}
                <span aria-hidden="true">↵</span>
              </Button>
            </div>
          </div>
        </div>

        {widget && (
          <div
            className="demo-window choice-window"
            aria-label="Agent-created layout choice"
          >
            <WindowTitle active>A quick question</WindowTitle>
            <div className="choice-content">
              <p>Keep this arrangement?</p>
              <div className="choice-actions">
                <Button
                  className="system-button primary-button"
                  onClick={() => {
                    setReply(
                      'You chose “Keep it.” The agent received your answer.',
                    );
                    setWidget(false);
                  }}
                >
                  Keep it
                </Button>
                <Button
                  variant="outline"
                  className="system-button"
                  onClick={() => {
                    setReply(
                      'You chose “Not yet.” The agent received your answer.',
                    );
                    setWidget(false);
                  }}
                >
                  Not yet
                </Button>
              </div>
              <span>WIDGET → USER → AGENT</span>
            </div>
          </div>
        )}
        <div className="stage-coordinate" aria-hidden="true">
          {tiled ? '[ TILE ]' : '[ ∞ ]'}
          <span>REV. {String(revision).padStart(2, '0')}</span>
        </div>
      </div>
      <output className="desktop-status" aria-live="polite" aria-atomic="true">
        <span className="status-square" aria-hidden="true" />
        <span>{status}</span>
        <span className="status-end">
          {revision === 0 ? 'READY' : 'APPLIED'}
        </span>
      </output>
    </div>
  );
}
