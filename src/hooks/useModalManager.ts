import { useEffect, useRef } from "react";

import { useBodyScrollLock } from "./useBodyScrollLock";

interface UseModalManagerParams {
  isOpen: boolean;
  onClose: () => void;
  autoFocus?: boolean;
}

export function useModalManager({
  isOpen,
  onClose,
  autoFocus = true,
}: UseModalManagerParams) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useBodyScrollLock(isOpen);

  // Handle focus when modal opens
  useEffect(() => {
    if (!isOpen || !autoFocus) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [isOpen, autoFocus]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return { inputRef };
}
