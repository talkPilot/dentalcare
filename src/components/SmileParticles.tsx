import { useEffect, useRef } from "react";
/** A deterministic point cloud: a tooth disperses into an orbit and returns to its exact shape. */
export default function SmileParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      visible = false,
      start = performance.now();
    let pointer = { x: -1000, y: -1000 };
    const seed = (n: number) => {
      const x = Math.sin(n * 127.1 + 31.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const shape = new Path2D(
      "M64 77c-8-39 24-52 55-36 34-17 66-4 60 35-4 29-13 45-19 70-6 25-13 48-24 48-12 0-6-52-17-52-12 0-6 52-19 52-10 0-16-22-23-48-6-23-10-43-13-69Z",
    );
    const points: {
      x: number;
      y: number;
      z: number;
      angle: number;
      radius: number;
    }[] = [];
    for (let i = 0; i < 6500; i++) {
      const x = seed(i * 3) * 240,
        y = seed(i * 3 + 1) * 240;
      if (context.isPointInPath(shape, x, y))
        points.push({
          x: (x - 120) / 120,
          y: (y - 116) / 120,
          z: seed(i * 3 + 2) * 2 - 1,
          angle: seed(i + 30) * Math.PI * 2,
          radius: 0.45 + seed(i + 40) * 0.5,
        });
      if (points.length >= 1500) break;
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function draw(now: number) {
      if (!visible) return;
      context!.clearRect(0, 0, width, height);
      const t = (now - start) / 1000;
      const cycle = t % 16;
      const smooth = (x: number) => {
        x = Math.max(0, Math.min(1, x));
        return x * x * (3 - 2 * x);
      };
      const morph = motion.matches
        ? 0
        : smooth((cycle - 5) / 2) * (1 - smooth((cycle - 10) / 3));
      const scale = Math.min(width, height) * 0.43;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const angle = p.angle + t * 0.13;
        const sx = Math.cos(angle) * p.radius;
        const sy = Math.sin(angle) * p.radius * 0.65;
        const z = Math.sin(angle) * 0.6 + p.z * 0.4;
        let x = width / 2 + (p.x * (1 - morph) + sx * morph) * scale;
        let y = height / 2 + (p.y * (1 - morph) + sy * morph) * scale;
        const dx = x - pointer.x,
          dy = y - pointer.y,
          d = Math.hypot(dx, dy);
        if (d < 60 && !motion.matches) {
          const force = (1 - d / 60) * 15;
          x += (dx / (d || 1)) * force;
          y += (dy / (d || 1)) * force;
        }
        const opacity = 0.18 + (p.z + 1) * 0.22;
        context!.fillStyle = `rgba(213,180,112,${opacity})`;
        context!.beginPath();
        context!.arc(
          x,
          y,
          (0.8 + (z + 1) * 0.35) * (width / 500 + 0.35),
          0,
          Math.PI * 2,
        );
        context!.fill();
      }
      if (!motion.matches) frame = requestAnimationFrame(draw);
    }
    const observer = new ResizeObserver(() => {
      resize();
      if (visible && motion.matches) draw(performance.now());
    });
    observer.observe(canvas);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(frame);
        if (visible) {
          start = performance.now();
          frame = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.1 },
    );
    intersection.observe(canvas);
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const leave = () => {
      pointer = { x: -1000, y: -1000 };
    };
    const change = () => {
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(draw);
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    motion.addEventListener("change", change);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      motion.removeEventListener("change", change);
    };
  }, []);
  return <canvas className="smile-particles" ref={ref} aria-hidden="true" />;
}
