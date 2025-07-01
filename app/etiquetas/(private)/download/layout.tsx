export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-light-400 bg-center dark:bg-zinc-900">
      <section className="flex flex-col min-h-screen">
        <div className="flex flex-1 items-center justify-center md:p-10 overflow-auto">
          <div className="w-full max-w-full sm:max-w-2xl md:max-w-5xl">{children}</div>
        </div>
      </section>
    </main>
  );
}
