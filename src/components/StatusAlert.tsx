'use client';

interface StatusAlertProps {
  message: string | null;
  isError: boolean;
}

export default function StatusAlert({ message, isError }: StatusAlertProps) {
    if (!message) return null;

    const baseClasses = 'rounded-md p-4';
    const colorClasses = isError
      ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-900/30'
      : 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-200/50 dark:border-green-900/30';
    const Icon = isError ? (
      <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
    ) : (
      <svg className="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    );

    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            <div className="flex">
                <div className="flex-shrink-0">{Icon}</div>
                <div className="ml-3"><p className="text-sm font-medium">{message}</p></div>
            </div>
        </div>
    );
}