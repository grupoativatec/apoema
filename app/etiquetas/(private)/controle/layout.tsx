import { getCurrentUser } from "@/lib/actions/user.actions";
import React from "react";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="h-screen bg-light-400 bg-center dark:bg-zinc-900">
      <Sidebar
        {...currentUser}
        userId={currentUser.$id}
        accountId={currentUser.accountId}
      />
      <section className="flex h-full flex-col md:pl-52">
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <MobileNavigation {...currentUser} />
        <div className="main-content p-6">
          {children}
          <Toaster />
        </div>
      </section>
    </main>
  );
};

export default layout;
