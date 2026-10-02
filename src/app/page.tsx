import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-dvh px-6 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-6 border-b border-[var(--brand-border)] pb-7">
          <Image
            src="/brand/logo-valle-dincanto.jpg"
            alt="Hotel Valle D'Incanto"
            width={1024}
            height={364}
            priority
            className="h-auto w-44 sm:w-52"
          />
          <span className="hidden text-xs font-medium tracking-[0.2em] text-[var(--brand-muted-foreground)] uppercase sm:block">
            Portal de Experiências
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mb-5 text-sm font-semibold tracking-[0.18em] text-[var(--brand-primary)] uppercase">
            Valle D&apos;Incanto
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[var(--brand-foreground)] sm:text-6xl">
            Um novo espaço para a recepção.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[var(--brand-muted-foreground)] sm:text-lg">
            O Portal Valle reunirá a programação e as experiências do hotel em uma visão clara para o dia a dia.
          </p>
          <p className="mt-10 inline-flex w-fit rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-3 text-sm text-[var(--brand-primary)]">
            Fundação do projeto em preparação
          </p>
        </section>

        <footer className="border-t border-[var(--brand-border)] pt-6 text-sm text-[var(--brand-muted-foreground)]">
          Portal Valle · Gramado, RS
        </footer>
      </div>
    </main>
  );
}
