import { NavLink, Outlet } from "react-router-dom";
import { Icon, type IconName } from "./Icon";

const navigation: { label: string; to: string; icon: IconName }[] = [
  { label: "Create Post", to: "/", icon: "plus" },
  { label: "My Posts", to: "/posts", icon: "file" },
  { label: "Media Library", to: "/media", icon: "image" },
];

function NavigationLinks({
  onNavigate,
  horizontal = false,
}: {
  onNavigate?: () => void;
  horizontal?: boolean;
}) {
  return (
    <nav
      aria-label="Main navigation"
      className={`flex gap-1 ${horizontal ? "flex-row" : "flex-col"}`}
    >
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
              horizontal ? "min-w-0 flex-1 justify-center px-2 py-2 text-xs" : ""
            } ${
              isActive
                ? "bg-brand-50 text-brand-800"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                name={item.icon}
                className={`${horizontal ? "size-4" : "size-[18px]"} ${isActive ? "text-brand-700" : "text-slate-400 group-hover:text-slate-600"}`}
              />
              {item.label}
              {item.to === "/" && isActive && !horizontal && (
                <span className="ml-auto size-1.5 rounded-full bg-brand-500" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex size-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-600 to-green-500 text-white shadow-sm shadow-brand-900/15">
        <Icon name="layers" className="size-5" />
      </div>
      <div>
        <p className="text-[15px] leading-5 font-semibold tracking-tight text-slate-950">
          Social Publisher
        </p>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-slate-200/80 bg-white px-5 py-6 lg:flex">
        <Brand />
        <div className="mt-8">
          <NavigationLinks />
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-5 sm:px-8">
            <div>
              <Brand />
            </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <NavigationLinks horizontal />
          </div>
        </header>

        <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
