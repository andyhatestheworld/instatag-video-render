"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import type { AnimationDef } from "@/lib/animations";
import type { AppState } from "@/lib/types";
import VerifiedBadge from "./VerifiedBadge";

// Framer Motion's full prop union is so large it overflows TS ("union type too
// complex to represent") under this project's settings. Aliasing to a loose
// component type sidesteps the inference without losing runtime behavior.
const MotionDiv = motion.div as ComponentType<any>;

/** Small looping live preview of a single effect, shown inside each list card. */
export default function MiniPreview({
  anim,
  state,
}: {
  anim: AnimationDef;
  state: AppState;
}) {
  const name = state.username && state.username.length ? state.username : "username";
  const text = (state.atPrefix ? "@" : "") + name;

  // Collapse Framer Motion's prop inference (which otherwise produces a union
  // "too complex to represent") by passing the variants as one object.
  const motionProps = {
    initial: anim.motion.initial,
    animate: anim.motion.animate,
    transition: anim.motion.transition,
    style: { transformPerspective: 600 },
  };

  return (
    <div className="grid h-10 w-12 place-items-center overflow-hidden rounded-sm bg-surface2">
      <MotionDiv
        key={anim.id + String(state.atPrefix) + String(state.verified)}
        {...motionProps}
        className="flex items-center gap-0.5"
      >
        <span className="max-w-[40px] truncate text-[9px] font-bold leading-none text-ink">
          {text}
        </span>
        {state.verified && <VerifiedBadge size={8} />}
      </MotionDiv>
    </div>
  );
}
