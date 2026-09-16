"use client";

/**
 * Ring faces use the in-repo Bloub port (`app/bot`), MIT-licensed from
 * jeremy-prt/bloub. Colored fills and a black paper backing punch dark eye
 * holes. Not affiliated with x.ai.
 */

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { blockAt, ringCycle } from "../bot/cycles";
import { BotEngine, type BotFrame } from "../bot/engine";
import { BALL_RADIUS } from "../bot/repere";
import { usePrefersReducedMotion } from "../use-prefers-reduced-motion";
import { ORBIT_BOTS, type OrbitBot } from "./config";

const VB = 110;
const PAPER = "#000000";
const EYE_RX = 9;
const EYE_H = 38;
const EYE_GAP = 16;

function RingBotSvg({
  fill,
  frame,
  size,
}: {
  fill: string;
  frame: BotFrame;
  size: number;
}) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `ring-bot-${reactId}`;

  return (
    <svg
      className="countdown-bot-svg"
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
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
          <path d={frame.bodyPath} fill="#fff" />
          <rect
            x={-EYE_GAP - EYE_RX}
            y={-EYE_H / 2}
            width={EYE_RX * 2}
            height={EYE_H}
            rx={EYE_RX}
            fill="#000"
          />
          <rect
            x={EYE_GAP - EYE_RX}
            y={-EYE_H / 2}
            width={EYE_RX * 2}
            height={EYE_H}
            rx={EYE_RX}
            fill="#000"
          />
        </mask>
      </defs>
      <path d={frame.bodyPath} fill={PAPER} />
      <g opacity={frame.bodyAlpha} mask={`url(#${maskId})`}>
        <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={fill} />
      </g>
    </svg>
  );
}

function RingSlot({
  bot,
  frame,
}: {
  bot: OrbitBot;
  frame: BotFrame;
}) {
  const style = {
    "--size": `${bot.size}px`,
    "--angle": `${bot.angleDeg}deg`,
  } as CSSProperties;

  return (
    <div className="countdown-slot" style={style}>
      <div className="countdown-upright">
        <RingBotSvg fill={bot.fill} frame={frame} size={bot.size} />
      </div>
    </div>
  );
}

export function RingBots() {
  const reduceMotion = usePrefersReducedMotion();
  const actors = useMemo(
    () =>
      ORBIT_BOTS.map((bot, i) => {
        const cycle = ringCycle(i);
        const first = cycle.blocks[0]!.state;
        const engine = new BotEngine(BALL_RADIUS, first);
        engine.reset(first, 0);
        return { bot, cycle, engine, lastIndex: 0 };
      }),
    [],
  );

  const frozen = useMemo(
    () => actors.map((actor) => actor.engine.sample(0)),
    [actors],
  );

  const [frames, setFrames] = useState<BotFrame[]>(frozen);
  const actorsRef = useRef(actors);
  actorsRef.current = actors;

  useEffect(() => {
    if (reduceMotion) {
      setFrames(frozen);
      return;
    }

    let raf = 0;
    let last = 0;
    let clock = 0;

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;

      const next: BotFrame[] = [];
      for (const actor of actorsRef.current) {
        const blocks = actor.cycle.blocks;
        const { index } = blockAt(blocks, clock);

        if (index !== actor.lastIndex) {
          if (index < actor.lastIndex) {
            actor.engine.reset(blocks[index]!.state, clock);
          } else {
            actor.engine.setState(blocks[index]!.state, clock);
          }
          actor.lastIndex = index;
        }
        next.push(actor.engine.sample(clock));
      }
      setFrames(next);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frozen, reduceMotion]);

  return (
    <div className="countdown-ring" aria-hidden="true">
      {actors.map((actor, i) => (
        <RingSlot
          key={actor.bot.id}
          bot={actor.bot}
          frame={frames[i] ?? frozen[i]!}
        />
      ))}
    </div>
  );
}
