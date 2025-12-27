import { ReactNode } from "react";

interface ViewProps {
  isActive: boolean;
  children: ReactNode;
}

export function View({ isActive, children }: ViewProps) {
  return (
    <div
      style={{
        display: isActive ? 'block' : 'none',
      }}
    >
      {children}
    </div>
  );
}