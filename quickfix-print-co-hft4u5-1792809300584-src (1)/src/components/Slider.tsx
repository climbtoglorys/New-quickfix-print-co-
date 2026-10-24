import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderProps {
  label: string;
  items: ReactNode[];
  variant?: 'work' | 'client';
}

const PAUSE_MS = 8000;

export default function Slider({
  label,
  items,
  variant = 'work',
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const hoverRef = useRef(false);
  const pausedUntil = useRef(0);
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0 });
  const [active, setActive] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const count = items.length;

  const nearestIndex = useCallback((): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const max = track.scrollWidth - track.clientWidth;
    if (max > 2 && track.scrollLeft >= max - 2) return count - 1;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const dist = Math.abs(
        (child as HTMLElement).offsetLeft - track.scrollLeft
      );
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, [count]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.children[index] as HTMLElement | undefined;
    if (!el) return;
    track.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
  }, []);

  const next = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 2) return;
    if (track.scrollLeft >= max - 2)
      track.scrollTo({ left: 0, behavior: 'smooth' });
    else goTo(Math.min(nearestIndex() + 1, count - 1));
  }, [count, goTo, nearestIndex]);

  const prev = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 2) return;
    if (track.scrollLeft <= 2)
      track.scrollTo({ left: max, behavior: 'smooth' });
    else goTo(Math.max(nearestIndex() - 1, 0));
  }, [goTo, nearestIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () =>
      setCanScroll(track.scrollWidth - track.clientWidth > 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (count < 2 || !canScroll) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (
        hoverRef.current ||
        document.hidden ||
        Date.now() < pausedUntil.current
      )
        return;
      next();
    }, 5000);
    return () => window.clearInterval(id);
  }, [count, canScroll, next]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const pause = () => {
    pausedUntil.current = Date.now() + PAUSE_MS;
  };

  const onScroll = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setActive(nearestIndex()));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      pause();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      pause();
      prev();
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pause();
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: track.scrollLeft,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag.down || !track) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) track.classList.add('is-dragging');
    if (track.classList.contains('is-dragging'))
      track.scrollLeft = drag.startLeft - dx;
  };

  const endDrag = () => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag.down || !track) return;
    drag.down = false;
    if (track.classList.contains('is-dragging')) {
      track.classList.remove('is-dragging');
      goTo(nearestIndex());
    }
  };

  const noun = variant === 'work' ? 'work' : 'client';

  return (
    <div
      className={`slider slider-${variant}`}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        endDrag();
      }}
    >
      <div
        ref={trackRef}
        className="slider-track"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="slider-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {item}
          </div>
        ))}
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            className="slider-arrow slider-prev"
            aria-label={`Previous ${noun}`}
            onClick={() => {
              pause();
              prev();
            }}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="slider-arrow slider-next"
            aria-label={`Next ${noun}`}
            onClick={() => {
              pause();
              next();
            }}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </>
      )}

      {canScroll && count > 1 && count <= 12 && (
        <div className="slider-dots" role="group" aria-label="Choose a slide">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? 'dot is-active' : 'dot'}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => {
                pause();
                goTo(i);
              }}
            />
          ))}
        </div>
      )}
      {canScroll && count > 12 && (
        <p className="slider-counter" aria-live="polite">
          {active + 1} / {count}
        </p>
      )}
    </div>
  );
}
