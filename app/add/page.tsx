import { auth } from "@/auth";
import InputForm from "@/components/InputForm";
import { redirect } from "next/navigation";

export default async function AddStepsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/auth/signin");

    return (
        <main className="min-h-screen bg-slate-50 py-12">
            <InputForm userEmail={session.user.email} />
        </main>
    );
}
