'use client';

import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/user.actions';
import MobileNavigation from '@/components/MobileNavigation';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) return redirect('/sign-in');
      if (user.role !== 'admin') return redirect('/dashboard');
      setCurrentUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading || !currentUser) return null;

  return (
    <main className="h-screen bg-light-400 bg-center dark:bg-zinc-900 flex">
      <Sidebar
        name={currentUser.nome}
        {...currentUser}
        userId={currentUser.id}
        accountId={currentUser.nome}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <section
        className={`flex transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-52'} w-full`}
      >
        <MobileNavigation fullName={''} {...currentUser} />
        <div className="main-content p-6">
          {children}
          <Toaster />
        </div>
      </section>
    </main>
  );
};

export default Layout;
