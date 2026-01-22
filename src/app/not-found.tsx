import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4 text-center text-white">
            <div className="mb-6 rounded-full bg-yellow-500/10 p-4 text-yellow-500">
                <AlertTriangle className="h-12 w-12" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">404</h1>
            <h2 className="mb-4 text-xl font-semibold">Page Not Found</h2>
            <p className="mb-8 max-w-md text-slate-400">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-500"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
        </div>
    );
}
