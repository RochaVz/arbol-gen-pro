import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarCtx {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Ctx = createContext<SidebarCtx>({ collapsed: false, setCollapsed: () => {} });

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const set = (v: boolean) => {
    setCollapsed(v);
    localStorage.setItem('sidebar-collapsed', String(v));
  };
  return <Ctx.Provider value={{ collapsed, setCollapsed: set }}>{children}</Ctx.Provider>;
};

export const useSidebarState = () => useContext(Ctx);
