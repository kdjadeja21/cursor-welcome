"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { NOTIF_BLUE } from "./bot/decor";
import { BotEngine, type BotFrame } from "./bot/engine";
import { followLook } from "./bot/gaze";
import { clamp, mixHex } from "./bot/math";
import { BALL_RADIUS, HALF_VIEWBOX } from "./bot/repere";
import { POSES } from "./bot/states";

const VB = HALF_VIEWBOX;
const DEFAULT_PAPER = "#ffffff";
const DEFAULT_INK = "#0a0a0c";

function Dot({
  dot,
  ink,
  paper,
}: {
  dot: BotFrame["dots"][number];
  ink: string;
  paper: string;
}) {
  const fill =
    dot.color ??
    (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));

  if (dot.d) {
    return (
      <path
        d={dot.d}
        fill={fill}
        opacity={dot.opacity}
        transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${BALL_RADIUS})`}
      />
    );
  }

  return (
    <circle cx={dot.x} cy={dot.y} r={dot.r} fill={fill} opacity={dot.opacity} />
  );
}

export function GrokBotAvatar({
  alt,
  fill = DEFAULT_INK,
  paper = DEFAULT_PAPER,
  reduceMotion,
  className,
}: {
  alt: string;
  fill?: string;
  paper?: string;
  reduceMotion: boolean;
  className?: string;
}) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `bot-mask-${reactId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const engine = useMemo(() => new BotEngine(BALL_RADIUS, "idle"), []);
  const frozenFrame = useMemo(() => {
    const still = new BotEngine(BALL_RADIUS, "idle");
    return still.sample(POSES.idle);
  }, []);
  const [frame, setFrame] = useState<BotFrame>(() =>
    engine.sample(reduceMotion ? POSES.idle : 0),
  );

  useEffect(() => {
    if (reduceMotion) return;

    const pointer = { current: null as { x: number; y: number } | null };
    let raf = 0;
    let last = 0;
    let clock = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerLeave = () => {
      pointer.current = null;
    };

    const aim = () => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box || box.width === 0 || box.height === 0) return;
      const halfW = Math.max(1, window.innerWidth / 2);
      const halfH = Math.max(1, window.innerHeight / 2);
      const p = pointer.current;
      engine.setLook(
        followLook({
          nx: p ? clamp((p.x - (box.left + box.width / 2)) / halfW, -1, 1) : 0,
          ny: p ? clamp((p.y - (box.top + box.height / 2)) / halfH, -1, 1) : 0,
          pointer: p !== null,
        }),
        clock,
      );
    };

    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      aim();
      setFrame(engine.sample(clock));
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [engine, reduceMotion]);

  const drawn = reduceMotion ? frozenFrame : frame;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role="img"
      aria-label={alt}
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-VB}
          y={-VB}
          width={VB * 2}
          height={VB * 2}
        >
          <path d={drawn.bodyPath} fill="#fff" />
          {drawn.eyes.map((eye, i) => (
            <path
              key={i}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
              fill="#000"
            />
          ))}
          {drawn.notch ? (
            <circle
              cx={drawn.notch.x}
              cy={drawn.notch.y}
              r={drawn.notch.r}
              fill="#000"
            />
          ) : null}
        </mask>
        {drawn.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${reactId}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((color, i) => (
              <stop
                key={i}
                offset={
                  arc.grad.stops.length === 1
                    ? 0
                    : i / (arc.grad.stops.length - 1)
                }
                stopColor={color}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {drawn.arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${reactId}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {drawn.dotsBehind
        ? drawn.dots.map((dot, i) => (
            <Dot key={`pb${i}`} dot={dot} ink={fill} paper={paper} />
          ))
        : null}

      <g opacity={drawn.bodyAlpha}>
        <path d={drawn.bodyPath} fill={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={fill} />
        </g>
      </g>

      {!drawn.dotsBehind
        ? drawn.dots.map((dot, i) => (
            <Dot key={`pf${i}`} dot={dot} ink={fill} paper={paper} />
          ))
        : null}

      {drawn.notif ? (
        <circle
          cx={drawn.notif.x}
          cy={drawn.notif.y}
          r={drawn.notif.r}
          fill={NOTIF_BLUE}
        />
      ) : null}

      <g fill="none" strokeLinecap="round">
        {drawn.arcs.map((arc) => (
          <path
            key={`f${arc.id}`}
            d={arc.front}
            stroke={`url(#${reactId}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
