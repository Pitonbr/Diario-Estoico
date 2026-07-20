"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊", exact: true },
  { href: "/marketing", label: "Agentes de Marketing", icon: "📣" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

const DIARIO_ITEMS = [
  { href: "/diario-estoico", label: "Visão geral", icon: "📰", exact: true },
  { href: "/diario-estoico/newsletter", label: "Newsletter", icon: "✉️" },
  { href: "/diario-estoico/analytics", label: "Analytics", icon: "📈" },
];

const CHAT_ITEMS = [
  { href: "/chat", label: "Visão geral", icon: "🏛️", exact: true },
  { href: "/chat/alertas", label: "Alertas", icon: "🚨" },
  { href: "/chat/usuarios", label: "Usuários", icon: "👥" },
  { href: "/chat/analytics", label: "Analytics", icon: "📈" },
  { href: "/chat/financeiro", label: "Financeiro", icon: "💳" },
];

function NavLink({
  href,
  icon,
  label,
  exact,
  indent,
}: {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  indent?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        indent ? "pl-5" : ""
      } ${
        active
          ? "bg-stone-900 text-white"
          : "text-stone-700 hover:bg-stone-100"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-stone-200 bg-white p-4">
      <div className="mb-8 px-2">
        <p className="text-sm font-bold tracking-widest text-stone-900 uppercase">
          Empreender Estoico
        </p>
        <p className="text-xs text-stone-400">Painel administrativo</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="my-3 border-t border-stone-100" />

        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Produtos
        </p>

        <p className="px-3 pb-0.5 pt-2 text-xs font-semibold text-stone-500">
          Diário Estoico
        </p>
        {DIARIO_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} indent />
        ))}

        <p className="px-3 pb-0.5 pt-3 text-xs font-semibold text-stone-500">
          Chat Estoico
        </p>
        {CHAT_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} indent />
        ))}
      </nav>
    </aside>
  );
}
