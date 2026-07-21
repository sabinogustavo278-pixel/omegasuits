import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Omega Suits" },
      { name: "description", content: "Área administrativa Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
