"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { removeToken } from "@/src/shared/utils/token";

type SidebarItemProps = {
  href?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  suffix?: React.ReactNode;
  onClick?: () => void;
};

function SidebarItem({
  href,
  icon,
  children,
  active,
  suffix,
  onClick,
}: SidebarItemProps) {
  const className = `
    flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
    ${
      active
        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }
  `;

  const content = (
    <>
      <span className={active ? "text-white" : "text-slate-400"}>{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      {suffix && <span>{suffix}</span>}
    </>
  );

  if (href) {
    return (
      <li>
        <Link href={href} className={className} onClick={onClick}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    </li>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(path: string) {
    if (path === "/professionals") {
      return pathname === "/professionals";
    }
    return pathname.startsWith(path);
  }

  function handleLogout() {
    removeToken(); // usa a chave correta "matchjob_token"
    router.push("/login");
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <Link
          href="/professionals"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-purple-900/30">
            <Image
              src="/logos/logoside.png"
              alt="Logo MatchJob"
              width={48}
              height={48}
              className="h-full w-full object-contain p-1"
              priority
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              MatchJob
            </h1>
            <p className="text-xs text-slate-400">Painel profissional</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <SidebarItem
            href="/professionals"
            active={isActive("/professionals")}
            icon={<PresentationChartBarIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Dashboard
          </SidebarItem>

          <SidebarItem
            href="/services"
            active={isActive("/services")}
            icon={<ShoppingBagIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Serviços
          </SidebarItem>

          <SidebarItem
            href="/chat"
            active={isActive("/chat")}
            icon={<InboxIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Mensagens
          </SidebarItem>

          <SidebarItem
            href="/favorites"
            active={isActive("/favorites")}
            icon={<HeartIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Favoritos
          </SidebarItem>

          <SidebarItem
            href="/profile/edit"
            active={isActive("/profile/edit")}
            icon={<UserCircleIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Perfil
          </SidebarItem>

          <SidebarItem
            href="/settings"
            active={isActive("/settings")}
            icon={<Cog6ToothIcon className="h-5 w-5" />}
            onClick={onNavigate}
          >
            Configurações
          </SidebarItem>
        </ul>
      </nav>

      <div className="border-t border-white/10 pt-4">
        <SidebarItem
          icon={<PowerIcon className="h-5 w-5" />}
          onClick={handleLogout}
        >
          Sair
        </SidebarItem>
      </div>
    </>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-950 p-3 text-white shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <aside className="sticky left-0 top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950 px-4 py-6 text-white lg:flex">
        <SidebarContent />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          <aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-slate-950 px-4 py-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Fechar menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
