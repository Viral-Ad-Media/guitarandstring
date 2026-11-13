export const site = {
  name: "Guitar and String",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guitarandstring.com",
  description:
    "Guitar gear guides, string advice and how-tos for players of every level.",
  logo: "/uploads/2023/01/guitarandstring.png",
  nav: [
    { href: "/acoustic", label: "Acoustic" },
    { href: "/electric", label: "Electric" },
    { href: "/reviews", label: "Reviews" },
    { href: "/blog", label: "Blog" },
    { href: "/spanish", label: "Español" },
  ],
} as const;
