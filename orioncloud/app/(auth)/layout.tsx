import type { ReactNode } from "react";
import Image from "next/image";
import logo from "@/public/assets/logo.png";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh grid-cols-1 md:grid-cols-[40%_60%]">
      <section className="hidden flex-col justify-between gap-12 bg-brand px-5 py-12 sm:px-10 md:flex lg:px-16">
        <div
          className="flex items-center gap-3 text-white"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          <Image
            src={logo}
            alt=""
            className="h-auto w-12 shrink-0 sm:w-16"
          />
          <span className="text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Orion Cloud
          </span>
        </div>
        <div
          className="text-white"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          <h1 className="text-xl font-medium leading-tight tracking-tight sm:text-2xl lg:text-3xl">
            Manage Your Files
            <br />
            Clean and Easily
          </h1>
          <p className="mt-4 max-w-sm text-xs leading-relaxed sm:text-sm">
            Keep your documents, photos, and ideas together in one simple space.
          </p>
        </div>
      </section>

      <div className="flex min-w-0 flex-col items-center justify-center bg-gray-100 px-5 py-12 sm:px-10">
        <div
          className="mb-10 flex items-center justify-center gap-3 text-gray-900 md:hidden"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          <Image src={logo} alt="" className="h-auto w-12 shrink-0" />
          <span className="text-2xl font-semibold leading-tight tracking-tight">
            Orion Cloud
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
