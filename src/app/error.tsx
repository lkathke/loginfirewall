"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4 text-center text-white">
            <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-500">
                <AlertOctagon className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">500</h1>
            <h2 className="mb-4 text-xl font-semibold">Something went wrong!</h2>
            <p className="mb-8 max-w-md text-slate-400">
                We encountered an unexpected error. Please try again later.
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-500"
            >
                <RefreshCw className="h-4 w-4" />
                Try again
            </button>
        </div>
    );
}
