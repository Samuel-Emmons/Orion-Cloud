import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh grid-cols-[40%_60%]">
      <section className="flex items-end bg-brand px-5 py-12 sm:px-10 lg:px-16">
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

      <div className="flex min-w-0 items-center justify-center bg-gray-100 px-5 py-12 sm:px-10">
        {children}
      </div>
    </main>
  );
}
