'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type Project = 'Compositor' | 'Interface' | 'Reading';
type Surface = {
  id: string;
  title: string;
  app: string;
  project: Project;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'document' | 'code' | 'terminal' | 'ui' | 'tasks';
  content: string[];
};
type Camera = { x: number; y: number; zoom: number };
type Rect = { x: number; y: number; width: number; height: number };
type Activity = {
  request: string;
  tool: string;
  result: string;
  status: 'ready' | 'done' | 'waiting' | 'event';
};

const original: Surface[] = [
  {
    id: 'protocol',
    title: 'Protocol notes',
    app: 'Firefox',
    project: 'Compositor',
    x: -360,
    y: -130,
    width: 330,
    height: 245,
    kind: 'document',
    content: [
      'Keep the boundaries clear.',
      'Runtime bridges wlroots.',
      'Kernel owns seats and outputs.',
      'World defines the experience.',
    ],
  },
  {
    id: 'world',
    title: 'world.lisp',
    app: 'editor',
    project: 'Compositor',
    x: 125,
    y: 50,
    width: 390,
    height: 285,
    kind: 'code',
    content: [
      '(ataxia.sly-control:agent-apply',
      ' (lambda (kernel world)',
      '   (declare (ignore kernel))',
      '   (set-window-position',
      '    world window 40d0 80d0))',
      ' :refresh :world-managed)',
    ],
  },
  {
    id: 'listener',
    title: 'Listener',
    app: 'foot',
    project: 'Compositor',
    x: -90,
    y: 445,
    width: 355,
    height: 220,
    kind: 'terminal',
    content: [
      '$ ./scripts/ataxia-eval',
      '',
      '(:world INFINITE-WORLD',
      ' :status :running',
      ' :generation 0)',
      '',
      'CL-USER>',
    ],
  },
  {
    id: 'slint',
    title: 'launcher.slint',
    app: 'editor',
    project: 'Interface',
    x: 890,
    y: -70,
    width: 340,
    height: 250,
    kind: 'code',
    content: [
      'export component Launcher',
      'inherits Window {',
      '  callback launch(string);',
      '  in property <string> query;',
      '',
      '  Text { text: root.query; }',
      '}',
    ],
  },
  {
    id: 'launcher',
    title: 'Application launcher',
    app: 'Slint',
    project: 'Interface',
    x: 1210,
    y: 360,
    width: 320,
    height: 240,
    kind: 'ui',
    content: ['Open something.', 'Firefox', 'Terminal', 'Editor'],
  },
  {
    id: 'reading',
    title: 'Reading list',
    app: 'notes',
    project: 'Reading',
    x: -800,
    y: 550,
    width: 320,
    height: 225,
    kind: 'document',
    content: [
      'Keep these within reach.',
      'Wayland event loops',
      'The live Lisp image',
      'Programmable interfaces',
    ],
  },
];
const initialCamera: Camera = { x: 100, y: 180, zoom: 0.76 };
const initialActivity: Activity = {
  request: 'Work with the world, not a fixed desktop.',
  tool: 'world access',
  result: '6 objects · 3 projects\nChoose a request below.',
  status: 'ready',
};
const tasks = [
  'Inspect the surface tree',
  'Adjust the viewport',
  'Reload world behavior',
];
const projects: Project[] = ['Compositor', 'Interface', 'Reading'];

function extent(surfaces: Surface[]): Rect {
  const x = Math.min(...surfaces.map((surface) => surface.x));
  const y = Math.min(...surfaces.map((surface) => surface.y));
  return {
    x,
    y,
    width:
      Math.max(...surfaces.map((surface) => surface.x + surface.width)) - x,
    height:
      Math.max(...surfaces.map((surface) => surface.y + surface.height)) - y,
  };
}

export function InfiniteCanvas() {
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointer: number;
    x: number;
    y: number;
    camera: Camera;
  } | null>(null);
  const surfaceDrag = useRef<{
    id: string;
    pointer: number;
    x: number;
    y: number;
    origin: { x: number; y: number };
    zoom: number;
    moved: boolean;
  } | null>(null);
  const suppressSurfaceClick = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 1100, height: 680 });
  const [camera, setCamera] = useState(initialCamera);
  const [surfaces, setSurfaces] = useState(original);
  const [activity, setActivity] = useState(initialActivity);
  const [selected, setSelected] = useState<string[]>([]);
  const [grouped, setGrouped] = useState(false);
  const [panning, setPanning] = useState(false);
  const [draggingSurface, setDraggingSurface] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [sequence, setSequence] = useState(0);
  const compact = size.width <= 760;
  const usable = {
    width: compact ? size.width - 36 : size.width - 390,
    height: compact ? size.height - 480 : size.height - 100,
  };
  const anchor = { x: usable.width / 2 + 18, y: usable.height / 2 + 50 };
  const offset = {
    x: anchor.x - camera.x * camera.zoom,
    y: anchor.y - camera.y * camera.zoom,
  };
  const hasWidget = surfaces.some((surface) => surface.kind === 'tasks');

  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  function fit(items: Surface[]) {
    const box = extent(items);
    setCamera({
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
      zoom: Math.max(
        0.08,
        Math.min(
          1.12,
          usable.width / (box.width + 80),
          usable.height / (box.height + 80),
        ),
      ),
    });
  }

  function findProject(project: Project) {
    const found = surfaces.filter((surface) => surface.project === project);
    setSelected(found.map((surface) => surface.id));
    fit(found);
    setActivity({
      request: 'Find my ' + project.toLowerCase() + ' work.',
      tool: 'agent-inspect → set-output-camera',
      status: 'done',
      result:
        found.length +
        ' matching objects\n' +
        found.map((surface) => surface.title).join(' · ') +
        '\n\nViewport moved. Windows unchanged.',
    });
  }

  function groupProjects() {
    const packed = surfaces.map((surface) => {
      const peers = surfaces.filter((item) => item.project === surface.project);
      const index = peers.findIndex((item) => item.id === surface.id);
      const origin = projects.indexOf(surface.project) * 930 - 400;
      return {
        ...surface,
        x:
          origin +
          (index % 2) * (Math.max(...peers.map((item) => item.width)) + 32),
        y:
          -180 +
          Math.floor(index / 2) *
            (Math.max(...peers.map((item) => item.height)) + 32),
      };
    });
    setSurfaces(packed);
    setGrouped(true);
    setSelected([]);
    fit(packed);
    setActivity({
      request: 'Group the windows by project.',
      tool: 'agent-apply / set-window-position',
      status: 'done',
      result:
        projects
          .map(
            (project) =>
              project +
              '  ' +
              packed.filter((item) => item.project === project).length +
              ' objects',
          )
          .join('\n') + '\n\nSame objects. New world coordinates.',
    });
  }

  function makeWidget() {
    const existing = surfaces.find((surface) => surface.kind === 'tasks');
    if (existing) {
      fit([existing]);
      setSelected([existing.id]);
      setActivity({
        request: 'Find the task widget.',
        tool: 'agent-inspect → set-output-camera',
        result:
          'Found the existing task widget.\nViewport moved. No duplicate created.',
        status: 'done',
      });
      return;
    }
    const group = extent(
      surfaces.filter((surface) => surface.project === 'Compositor'),
    );
    const widget: Surface = {
      id: 'tasks',
      title: 'Compositor / next steps',
      app: 'Slint',
      project: 'Compositor',
      x: group.x,
      y: group.y + group.height + 40,
      width: 345,
      height: 245,
      kind: 'tasks',
      content: [],
    };
    setSurfaces([...surfaces, widget]);
    setSelected([widget.id]);
    fit([widget]);
    setActivity({
      request: 'Make a small checklist for this work.',
      tool: 'agent-apply / make-agent-widget',
      status: 'waiting',
      result:
        'Added a Slint-style task widget.\nIt lives on the canvas, too.\n\nWaiting for checkbox events.',
    });
  }

  function toggleTask(index: number, value: boolean) {
    const next = checked.map((current, position) =>
      position === index ? value : current,
    );
    setChecked(next);
    setSequence(sequence + 1);
    setActivity({
      request: 'Keep track of the work with me.',
      tool: 'wait-for-agent-events',
      status: next.every(Boolean) ? 'done' : 'event',
      result:
        '(:source "tasks" :name "toggle"\n :value "' +
        (index + 1) +
        ':' +
        value +
        '" :sequence ' +
        (sequence + 1) +
        ')\n\n' +
        next.filter(Boolean).length +
        ' of 3 items complete.',
    });
  }

  function panStart(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || surfaceDrag.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      camera,
    };
    setPanning(true);
  }

  function panEnd() {
    drag.current = null;
    setPanning(false);
  }

  function startSurfaceDrag(
    event: PointerEvent<HTMLButtonElement>,
    surface: Surface,
  ) {
    if (event.button !== 0 || drag.current || surfaceDrag.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    suppressSurfaceClick.current = null;
    surfaceDrag.current = {
      id: surface.id,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: { x: surface.x, y: surface.y },
      zoom: camera.zoom,
      moved: false,
    };
    setDraggingSurface(surface.id);
    setSelected([surface.id]);
  }

  function moveSurface(event: PointerEvent<HTMLButtonElement>) {
    const start = surfaceDrag.current;
    if (!start || start.pointer !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.moved && Math.hypot(deltaX, deltaY) < 3) return;
    start.moved = true;
    setSurfaces((current) =>
      current.map((surface) =>
        surface.id === start.id
          ? {
              ...surface,
              x: start.origin.x + deltaX / start.zoom,
              y: start.origin.y + deltaY / start.zoom,
            }
          : surface,
      ),
    );
  }

  function endSurfaceDrag(pointer: number) {
    const start = surfaceDrag.current;
    if (!start || start.pointer !== pointer) return;
    suppressSurfaceClick.current = start.moved ? start.id : null;
    surfaceDrag.current = null;
    setDraggingSurface(null);
  }

  function reset() {
    drag.current = null;
    surfaceDrag.current = null;
    suppressSurfaceClick.current = null;
    setPanning(false);
    setDraggingSurface(null);
    setSurfaces(original);
    setCamera(initialCamera);
    setActivity(initialActivity);
    setSelected([]);
    setGrouped(false);
    setChecked([false, false, false]);
    setSequence(0);
  }

  return (
    <div className="canvas-demo">
      <div className="world-representation-note">
        <h3>Choose how your world works.</h3>
        <p>Tiling. Scrolling columns. An open plane. Your own geometry.</p>
      </div>
      <div
        className={cn('infinite-scene', panning && 'is-panning')}
        ref={stage}
        style={{
          backgroundSize: 120 * camera.zoom + 'px ' + 120 * camera.zoom + 'px',
          backgroundPosition: offset.x + 'px ' + offset.y + 'px',
        }}
      >
        <Button
          variant="ghost"
          className="canvas-pan-surface"
          aria-label="Pan the infinite canvas. Drag, or use arrow keys."
          onPointerDown={panStart}
          onPointerUp={panEnd}
          onPointerCancel={panEnd}
          onLostPointerCapture={panEnd}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || start.pointer !== event.pointerId) return;
            setCamera({
              ...start.camera,
              x: start.camera.x - (event.clientX - start.x) / start.camera.zoom,
              y: start.camera.y - (event.clientY - start.y) / start.camera.zoom,
            });
          }}
          onKeyDown={(event) => {
            const movement: Record<string, [number, number]> = {
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
              ArrowUp: [0, -1],
              ArrowDown: [0, 1],
            };
            const direction = movement[event.key];
            if (!direction) return;
            event.preventDefault();
            setCamera((current) => ({
              ...current,
              x: current.x + (direction[0] * 80) / current.zoom,
              y: current.y + (direction[1] * 80) / current.zoom,
            }));
          }}
        />

        <div className="canvas-camera-bar">
          <span>example / open plane</span>
          <span>{surfaces.length} objects</span>
        </div>
        <div
          className="canvas-plane"
          style={{
            transform:
              'translate(' +
              offset.x +
              'px,' +
              offset.y +
              'px) scale(' +
              camera.zoom +
              ')',
          }}
        >
          {grouped &&
            projects.map((project) => {
              const box = extent(
                surfaces.filter((surface) => surface.project === project),
              );
              return (
                <div
                  className="canvas-project-outline"
                  key={project}
                  style={{
                    left: box.x - 18,
                    top: box.y - 18,
                    width: box.width + 36,
                    height: box.height + 36,
                  }}
                >
                  <span style={{ fontSize: 12 / camera.zoom }}>{project}</span>
                </div>
              );
            })}
          {surfaces.map((surface) => (
            <section
              key={surface.id}
              className={cn(
                'canvas-surface',
                selected.includes(surface.id) && 'is-selected',
                surface.kind === 'tasks' && 'task-surface',
                draggingSurface === surface.id && 'is-dragging',
              )}
              aria-label={surface.title}
              style={{
                width: surface.width,
                height: surface.height,
                transform: 'translate(' + surface.x + 'px,' + surface.y + 'px)',
              }}
            >
              <Button
                variant="ghost"
                className="canvas-surface-title"
                aria-label={
                  'Move ' +
                  surface.title +
                  '. Drag or use arrow keys; click to focus.'
                }
                onFocus={() => {
                  if (surfaceDrag.current) return;
                  fit([surface]);
                  setSelected([surface.id]);
                }}
                onClick={() => {
                  if (suppressSurfaceClick.current === surface.id) {
                    suppressSurfaceClick.current = null;
                    return;
                  }
                  fit([surface]);
                  setSelected([surface.id]);
                }}
                onPointerDown={(event) => startSurfaceDrag(event, surface)}
                onPointerMove={moveSurface}
                onPointerUp={(event) => endSurfaceDrag(event.pointerId)}
                onPointerCancel={(event) => endSurfaceDrag(event.pointerId)}
                onLostPointerCapture={(event) =>
                  endSurfaceDrag(event.pointerId)
                }
                onKeyDown={(event) => {
                  const directions: Record<string, [number, number]> = {
                    ArrowLeft: [-1, 0],
                    ArrowRight: [1, 0],
                    ArrowUp: [0, -1],
                    ArrowDown: [0, 1],
                  };
                  const direction = directions[event.key];
                  if (!direction) return;
                  event.preventDefault();
                  const distance = (event.shiftKey ? 48 : 16) / camera.zoom;
                  setSurfaces((current) =>
                    current.map((item) =>
                      item.id === surface.id
                        ? {
                            ...item,
                            x: item.x + direction[0] * distance,
                            y: item.y + direction[1] * distance,
                          }
                        : item,
                    ),
                  );
                  setSelected([surface.id]);
                }}
              >
                <span>{surface.title}</span>
                <span>{surface.app}</span>
              </Button>
              {surface.kind === 'tasks' ? (
                <div className="canvas-task-content">
                  <p>A few things to work through.</p>
                  {tasks.map((task, index) => (
                    <label
                      key={task}
                      className={cn(checked[index] && 'is-complete')}
                    >
                      <Checkbox
                        checked={checked[index]}
                        onCheckedChange={(value) =>
                          toggleTask(index, value === true)
                        }
                      />
                      {task}
                    </label>
                  ))}
                  <span>
                    {checked.filter(Boolean).length} / 3 complete · events →
                    agent
                  </span>
                </div>
              ) : surface.kind === 'code' || surface.kind === 'terminal' ? (
                <pre
                  className={cn(
                    surface.kind === 'terminal' && 'canvas-terminal',
                  )}
                >
                  {surface.content.join('\n')}
                </pre>
              ) : surface.kind === 'ui' ? (
                <div className="canvas-launcher">
                  <p>{surface.content[0]}</p>
                  {surface.content.slice(1).map((item) => (
                    <div key={item}>
                      {item}
                      <span>available</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="canvas-document">
                  <span>{surface.project.toUpperCase()}</span>
                  <h4>{surface.content[0]}</h4>
                  {surface.content.slice(1).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="canvas-tools" aria-label="Viewport controls">
          <Button
            variant="outline"
            aria-label="Zoom out"
            disabled={camera.zoom <= 0.08}
            onClick={() =>
              setCamera((current) => ({
                ...current,
                zoom: Math.max(0.08, current.zoom / 1.3),
              }))
            }
          >
            −
          </Button>
          <span>{Math.round(camera.zoom * 100)}%</span>
          <Button
            variant="outline"
            aria-label="Zoom in"
            disabled={camera.zoom >= 1.4}
            onClick={() =>
              setCamera((current) => ({
                ...current,
                zoom: Math.min(1.4, current.zoom * 1.3),
              }))
            }
          >
            +
          </Button>
          <Button variant="outline" onClick={() => fit(surfaces)}>
            See all
          </Button>
        </div>

        <aside className="canvas-agent" aria-label="Canvas agent">
          <div className="canvas-agent-title">
            <span>agent / world access</span>
            <span className={'harness-status cue-' + activity.status}>
              {
                {
                  ready: 'Ready',
                  done: 'Complete',
                  waiting: 'Needs input',
                  event: 'Input received',
                }[activity.status]
              }
            </span>
          </div>
          <div className="canvas-agent-body">
            <p className="canvas-agent-request">
              <span aria-hidden="true">›</span>
              {activity.request}
            </p>
            <div
              className={'canvas-agent-log cue-' + activity.status}
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>↳ {activity.tool}</strong>
              <pre>{activity.result}</pre>
            </div>
            <div className="canvas-agent-actions">
              <Button
                variant="outline"
                onClick={() => findProject('Compositor')}
              >
                Find my compositor work <span>↗</span>
              </Button>
              <Button variant="outline" onClick={groupProjects}>
                Group windows by project <span>↗</span>
              </Button>
              <Button variant="outline" onClick={makeWidget}>
                {hasWidget ? 'Find the task widget' : 'Make a task widget'}{' '}
                <span>↗</span>
              </Button>
            </div>
          </div>
        </aside>
        <span className="canvas-coordinates">
          x {Math.round(camera.x)} / y {Math.round(camera.y)}
        </span>
      </div>
      <div className="world-caption">
        <span>Drag a window to move it. Drag empty space to pan.</span>
        <Button variant="ghost" className="world-reset" onClick={reset}>
          Reset example ↺
        </Button>
      </div>
    </div>
  );
}
