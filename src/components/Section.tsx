import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  idx: number;
  refCb: (el: HTMLElement | null) => void;
  children: ReactNode;
}

export function Section({ id, idx, refCb, children }: SectionProps) {
  return (
    <section
      id={id}
      data-idx={idx}
      ref={refCb}
      className="relative"
    >
      {children}
    </section>
  );
}
