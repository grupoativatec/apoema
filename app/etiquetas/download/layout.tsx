import { Toaster } from "@/components/ui/toaster";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen bg-light-400 bg-center dark:bg-zinc-900">
      <section className="flex h-full flex-col items-center">
        <div className="main-content p-6">
          {children}
          <Toaster />
        </div>
      </section>
    </main>
  );
};

export default layout;
