export default function AmbientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-float"></div>
        </div>
    )
}