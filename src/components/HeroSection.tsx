import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-tailoring.jpg";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-primary-foreground">
      <img
        src={heroImg}
        alt="Alfaiataria Omega Suits"
        width={1600}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-charcoal/95" />
      <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:px-10 md:pb-28">
        <p className="text-[11px] uppercase tracking-[0.5em] text-accent">
          Nova coleção · Outono / Inverno
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] text-primary-foreground md:text-7xl">
          A arte serena da <em className="italic text-accent">alfaiataria</em> clássica.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/75">
          Cortes construídos à mão, tecidos italianos e o silêncio de um ateliê que atravessa
          gerações. Uma nova coleção pensada para o homem que veste o tempo com discrição.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/ternos"
            className="inline-flex items-center justify-center border border-accent bg-accent px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-charcoal transition-colors hover:bg-transparent hover:text-accent"
          >
            Ver Coleção
          </Link>
          <Link
            to="/camisaria"
            className="inline-flex items-center justify-center border border-primary-foreground/40 px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:border-primary-foreground"
          >
            Sob medida
          </Link>
        </div>
      </div>
    </section>
  );
}
