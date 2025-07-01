// app/etiquetas/(private)/layout.tsx
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen bg-light-400 bg-center dark:bg-zinc-900 overflow-hidden">
      <section className="flex h-full flex-col ">
        <div className="flex-1 flex items-center justify-center p-10 overflow-auto">
          <div className="w-full md:max-w-4xl">{children}</div>
        </div>
      </section>
    </main>
  );
}
