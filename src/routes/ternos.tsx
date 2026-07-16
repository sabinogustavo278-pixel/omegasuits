import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/ternos")({
  head: () => ({
    meta: [
      { title: "Ternos — Omega Suits" },
      {
        name: "description",
        content: "Ternos clássicos em lã italiana, cortados à mão no ateliê Omega Suits.",
      },
      { property: "og:title", content: "Ternos — Omega Suits" },
      {
        property: "og:description",
        content: "Ternos clássicos em lã italiana, cortados à mão.",
      },
    ],
  }),
  component: () => (
    <CategoryPage
      category="ternos"
      title="Ternos"
      description="Silhuetas clássicas construídas com entretela flutuante e lãs italianas Super 130's. Do formal ao mais discreto uso diário."
    />
  ),
});
