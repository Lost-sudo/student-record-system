import { env } from "@/config/env";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1>{env.appName}</h1>

        <p>Frontend is running.</p>

        <small>API: {env.apiUrl}</small>
      </div>
    </main>
  )
}