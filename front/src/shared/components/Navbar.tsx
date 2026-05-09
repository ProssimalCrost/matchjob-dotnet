import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/professionals", label: "Profissionais" },
  { href: "/profile", label: "Perfil" },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-semibold text-slate-950" href="/">
          MatchJob
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {links.map((link) => (
            <Link
              className="transition-colors hover:text-slate-950"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="rounded-md bg-slate-950 px-3 py-2 font-medium text-white transition-colors hover:bg-slate-800"
            href="/login"
          >
            Entrar
          </Link>
        </div>
      </nav>
    </header>
  );
}

