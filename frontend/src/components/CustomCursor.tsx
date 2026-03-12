import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a,button,[role='button'],input,textarea,select,label,.cursor-pointer";

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const dotRefPos = useRef({ x: 0, y: 0 });
  const ringRefPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const update = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      dotRefPos.current.x += (targetRef.current.x - dotRefPos.current.x) * 0.42;
      dotRefPos.current.y += (targetRef.current.y - dotRefPos.current.y) * 0.42;
      ringRefPos.current.x += (targetRef.current.x - ringRefPos.current.x) * 0.2;
      ringRefPos.current.y += (targetRef.current.y - ringRefPos.current.y) * 0.2;

      dot.style.transform = `translate3d(${dotRefPos.current.x}px, ${dotRefPos.current.y}px, 0)`;
      ring.style.transform = `translate3d(${ringRefPos.current.x}px, ${ringRefPos.current.y}px, 0)`;

      rafRef.current = requestAnimationFrame(update);
    };

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerDown = () => setPressed(true);
    const onPointerUp = () => setPressed(false);

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      setHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
    };

    const onLeaveWindow = () => {
      setPressed(false);
      setHovering(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerover", onPointerOver);
    window.addEventListener("blur", onLeaveWindow);
    document.addEventListener("mouseleave", onLeaveWindow);

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("blur", onLeaveWindow);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  const dotScale = pressed ? 0.85 : hovering ? 1.2 : 1;
  const ringScale = pressed ? 0.8 : hovering ? 1.45 : 1;

  return (
    <>
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[999998]"
        style={{
          width: 30,
          height: 30,
          marginLeft: -15,
          marginTop: -15,
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "9999px",
            border: "1px solid rgba(239, 68, 68, 0.65)",
            boxShadow: "0 0 16px rgba(239, 68, 68, 0.35)",
            transition: "transform 130ms ease, opacity 130ms ease",
            transform: `scale(${ringScale})`,
            opacity: hovering ? 0.95 : 0.8,
          }}
        />
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[999999]"
        style={{
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "9999px",
            background: "radial-gradient(circle at 35% 35%, #fca5a5 0%, #ef4444 55%, #b91c1c 100%)",
            boxShadow: "0 0 12px rgba(239, 68, 68, 0.9), 0 0 24px rgba(239, 68, 68, 0.35)",
            transition: "transform 100ms ease",
            transform: `scale(${dotScale})`,
          }}
        />
      </div>
    </>
  );
};

export default CustomCursor;
