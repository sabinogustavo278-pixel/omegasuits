import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/calcados")({
  head: () => ({
    meta: [
      { title: "Calçados — Omega Suits" },
      {
        name: "description",
        content: "Sapatos Oxford e Derby em couro Goodyear welted, feitos para durar décadas.",
      },
      { property: "og:title", content: "Calçados — Omega Suits" },
    ],
  }),
  component: () => (
    <CategoryPage
      category="calcados"
      title="Calçados"
      description="Sapatos com montagem Goodyear welted, cabedal em couro europeu e sola em couro curtido ao tanino."
    />
  ),
});
