import { useEffect } from 'react';

const TARGETS = [
  'main .section > .container > *:not(.grid)',
  'main .section .grid > li',
  'main .split > *',
  'main .band-inner > *',
].join(', ');

function indexAmongSiblings(el: Element): number {
  const parent = el.parentElement;
  if (!parent) return 0;
  return Array.prototype.indexOf.call(parent.children, el) as number;
}

// Fades page sections in as they scroll into view. Does nothing for visitors
// who prefer reduced motion, so their content is always visible.
export function useReveal(key: string): void {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.getElementById('main');
    if (!root) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    );

    const tag = (el: Element) => {
      if (el.classList.contains('reveal')) return;
      const delay = Math.min(indexAmongSiblings(el), 5) * 70;
      (el as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`);
      el.classList.add('reveal');
      io.observe(el);
    };

    const scan = (scope: Element) => {
      if (scope.matches(TARGETS)) tag(scope);
      scope.querySelectorAll(TARGETS).forEach(el => tag(el));
    };

    scan(root);

    const mo = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node instanceof Element) scan(node);
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [key]);
}
