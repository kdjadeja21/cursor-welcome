import type { ReactNode } from "react";

import type { BlobKind, OrbitBlob } from "./config";

function BlobBody({ kind, fill }: { kind: BlobKind; fill: string }): ReactNode {
  switch (kind) {
    case "oval":
      return <ellipse cx="50" cy="50" rx="34" ry="42" fill={fill} />;
    case "teardrop":
      return (
        <path
          d="M50 6C50 6 12 46 12 66a38 38 0 0 0 76 0C88 46 50 6 50 6z"
          fill={fill}
        />
      );
    case "hex":
      return (
        <polygon
          points="50,8 86,28 86,72 50,92 14,72 14,28"
          fill={fill}
          stroke={fill}
          strokeLinejoin="round"
          strokeWidth="10"
        />
      );
    case "triangle":
      return (
        <polygon
          points="50,12 90,86 10,86"
          fill={fill}
          stroke={fill}
          strokeLinejoin="round"
          strokeWidth="12"
        />
      );
    case "circle":
      return <circle cx="50" cy="50" r="40" fill={fill} />;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function eyeLayout(kind: BlobKind): { cy: number; spread: number; h: number } {
  switch (kind) {
    case "oval":
      return { cy: 46, spread: 9, h: 15 };
    case "teardrop":
      return { cy: 62, spread: 9, h: 15 };
    case "hex":
      return { cy: 48, spread: 10, h: 16 };
    case "triangle":
      return { cy: 58, spread: 9, h: 14 };
    case "circle":
      return { cy: 48, spread: 10, h: 16 };
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function Eyes({ kind }: { kind: BlobKind }) {
  const { cy, spread, h } = eyeLayout(kind);
  const w = 6.5;
  return (
    <>
      <rect
        x={50 - spread - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={w / 2}
        fill="#0a0a0c"
      />
      <rect
        x={50 + spread - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={w / 2}
        fill="#0a0a0c"
      />
    </>
  );
}

export function OrbitBlobSvg({ blob }: { blob: OrbitBlob }) {
  return (
    <svg
      className="countdown-blob-svg"
      viewBox="0 0 100 100"
      width={blob.size}
      height={blob.size}
      aria-hidden="true"
      focusable="false"
    >
      <BlobBody kind={blob.kind} fill={blob.fill} />
      <Eyes kind={blob.kind} />
    </svg>
  );
}
