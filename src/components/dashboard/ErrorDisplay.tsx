interface ErrorDisplayProps {
  error: Error | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
      {error.message}
    </div>
  );
}
