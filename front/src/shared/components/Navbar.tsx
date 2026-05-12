"use client";

import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/solid";

type SidebarItemProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  suffix?: React.ReactNode;
};

function SidebarItem({ icon, children, active, suffix }: SidebarItemProps) {
  return (
    <li>
      <button
        type="button"
        className={`
          flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
          ${
            active
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <span className={active ? "text-white" : "text-slate-400"}>
          {icon}
        </span>

        <span className="flex-1 text-left">{children}</span>

        {suffix && <span>{suffix}</span>}
      </button>
    </li>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky left-0 top-0 flex h-screen w-72 flex-col border-r border-white/10 bg-slate-950 px-4 py-6 text-white">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 shadow-lg shadow-purple-900/40">
          <BriefcaseIcon className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            MatchJob
          </h1>
          <p className="text-xs text-slate-400">
            Painel profissional
          </p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <SidebarItem
            active
            icon={<PresentationChartBarIcon className="h-5 w-5" />}
          >
            Dashboard
          </SidebarItem>

          <SidebarItem icon={<ShoppingBagIcon className="h-5 w-5" />}>
            Serviços
          </SidebarItem>

          <SidebarItem
            icon={<InboxIcon className="h-5 w-5" />}
            suffix={
              <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs font-bold text-white">
                14
              </span>
            }
          >
            Mensagens
          </SidebarItem>

          <SidebarItem icon={<UserCircleIcon className="h-5 w-5" />}>
            Perfil
          </SidebarItem>

          <SidebarItem icon={<Cog6ToothIcon className="h-5 w-5" />}>
            Configurações
          </SidebarItem>
        </ul>
      </nav>

      <div className="border-t border-white/10 pt-4">
        <SidebarItem icon={<PowerIcon className="h-5 w-5" />}>
          Sair
        </SidebarItem>
      </div>
    </aside>
  );
}