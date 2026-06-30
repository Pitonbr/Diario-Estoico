import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/marketing", label: "Marketing", icon: "📣" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-stone-200 bg-white p-4">
      <div className="mb-8 px-2">
        <p className="text-lg font-semibold text-stone-900">🏛️ Diário Estoico</p>
        <p className="text-xs text-stone-500">Painel administrativo</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
