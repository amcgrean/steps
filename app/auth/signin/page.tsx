import { signIn } from "@/auth";

export default function SignIn() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="p-8 bg-white rounded-2xl shadow-xl shadow-slate-200 w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-slate-900">Step Tracker Betting</h1>
                <p className="mt-2 text-slate-500 text-sm">Sign in to track your steps and bets</p>

                <form
                    className="mt-8"
                    action={async () => {
                        "use server";
                        await signIn("google", { redirectTo: "/" });
                    }}
                >
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
}
