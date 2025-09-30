import { useEffect, useRef } from "react";

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

  // Handle focus when modal opens
  useEffect(() => {
    if (!isOpen || !autoFocus) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [isOpen, autoFocus]);

  // Handle body overflow and escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return { inputRef };
}
