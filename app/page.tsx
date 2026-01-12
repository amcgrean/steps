import { auth, signOut } from "@/auth";
import { getMasterData } from "@/lib/googleSheets";
import Dashboard from "@/components/Dashboard";
import Link from "next/link";
import { PlusCircle, LogOut } from "lucide-react";

export default async function Home() {
    const session = await auth();
    const data = await getMasterData();

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-5xl mx-auto pt-8 px-4 flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                        {session?.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold text-slate-700">{session?.user?.name || session?.user?.email}</p>
                    </div>
                </div>

                <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/signin" }); }}>
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <Dashboard data={data} />

            {/* Floating Action Button for Mobile */}
            <Link
                href="/add"
                className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all z-50 font-bold"
            >
                <PlusCircle className="w-5 h-5" />
                Log Steps
            </Link>
        </main>
    );
}
