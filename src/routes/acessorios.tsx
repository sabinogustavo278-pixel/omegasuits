import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/acessorios")({
  head: () => ({
    meta: [
      { title: "Acessórios — Omega Suits" },
      {
        name: "description",
        content: "Gravatas, cintos e abotoaduras: os detalhes que compõem o traje.",
      },
      { property: "og:title", content: "Acessórios — Omega Suits" },
    ],
  }),
  component: () => (
    <CategoryPage
      category="acessorios"
      title="Acessórios"
      description="Gravatas tecidas em Como, cintos em couro vegetal e abotoaduras em prata 925."
    />
  ),
});
