export default function AuthLayout() {
  return (
    <main className="grid min-h-dvh grid-cols-[40%_60%]">
      <section className="flex items-center bg-brand px-5 py-12 sm:px-10 lg:px-16">
        <h1
          className="-translate-y-[15dvh] text-2xl font-medium leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          Sign into
          <br />
          Orion Cloud
        </h1>
      </section>

      {/* Reserved for the sign-in and sign-up forms. */}
      <div className="bg-gray-100" />
    </main>
  );
}
