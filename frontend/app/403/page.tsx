import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-6xl font-bold mb-4">403</h1>
      <p className="text-xl mb-8">You do not have permission to access this resource.</p>
      <Link
        href="/"
        className=" rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </main>
  );
}