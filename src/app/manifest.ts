import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quem é Mais Brabo",
    short_name: "Mais Brabo",
    description:
      "Jogo de festa: sorteia uma letra, escreva 3 famosos brabos e vote em quem é o mais brabo!",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1e0b3b",
    theme_color: "#1e0b3b",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
