"use client";

import Image from "next/image";
import React from "react";
import Lottie from "lottie-react";
import fileAnimation from "@/public/animations/file-management.json";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center bg-brand px-12 py-16 dark:bg-zinc-900 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-10">
          <div className="flex items-center justify-center">
            <Image src="/logo.png" alt="logo" width={230} height={230} />
          </div>

          <div className="space-y-6 text-center text-white">
            <h1 className="h1 text-3xl font-bold leading-tight">
              Gerencie seus arquivos com facilidade
            </h1>
            <p className="body-1 text-lg">
              Armazene, compartilhe e organize seus arquivos com praticidade.
            </p>
          </div>

          <div className="flex items-center justify-center rounded-full bg-white p-2 shadow-md">
            <Lottie
              animationData={fileAnimation}
              loop
              className="size-[260px]"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white px-6 py-10 dark:bg-zinc-900/80 dark:text-white lg:justify-center lg:px-12 lg:py-0">
        <div className="mb-12 text-start lg:hidden">
          <Image
            src="/logo.png"
            alt="logo"
            width={200}
            height={82}
            className="h-auto w-[180px] lg:w-[220px]"
          />
        </div>
        {children}
      </section>
    </div>
  );
};

export default Layout;
