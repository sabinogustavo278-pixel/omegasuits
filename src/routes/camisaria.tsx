import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/camisaria")({
  head: () => ({
    meta: [
      { title: "Camisaria — Omega Suits" },
      {
        name: "description",
        content: "Camisaria fina em algodão egípcio, com colarinhos construídos à mão.",
      },
      { property: "og:title", content: "Camisaria — Omega Suits" },
    ],
  }),
  component: () => (
    <CategoryPage
      category="camisaria"
      title="Camisaria"
      description="Algodões egípcios de fio longo, colarinhos entretelados e acabamento em pontos miúdos."
    />
  ),
});
