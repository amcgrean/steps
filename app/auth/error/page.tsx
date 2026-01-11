import Link from "next/link";

export default function AuthError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="p-8 bg-white rounded-2xl shadow-xl shadow-slate-200 w-full max-w-md text-center border-t-4 border-red-500">
                <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
                <p className="mt-4 text-slate-500">
                    Only Aaron and Andrew's registered email addresses are allowed to access this application.
                </p>
                <Link
                    href="/auth/signin"
                    className="mt-8 inline-block px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
}
