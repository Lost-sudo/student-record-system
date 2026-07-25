export default function BackgroundBlobs() {
  return (
    <>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-delayed" />
      <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
    </>
  );
}