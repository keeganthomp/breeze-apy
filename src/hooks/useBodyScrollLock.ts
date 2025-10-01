import { useEffect } from "react";

let lockCount = 0;
let originalOverflow: string | null = null;

function lockBodyScroll() {
  if (typeof document === "undefined") {
    return;
  }

  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  lockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined" || lockCount === 0) {
    return;
  }

  lockCount -= 1;

  if (lockCount === 0) {
    if (originalOverflow !== null) {
      document.body.style.overflow = originalOverflow;
      originalOverflow = null;
    } else {
      document.body.style.overflow = "";
    }
  }
}

export function useBodyScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      unlockBodyScroll();
      return;
    }

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [enabled]);
}
