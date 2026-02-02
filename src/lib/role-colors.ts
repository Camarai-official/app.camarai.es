export type RoleColorConfig = {
  bg: string;
  text: string;
  border: string;
  chipBg: string;
};

export const roleColors: Record<string, RoleColorConfig> = {
  camarero: {
    bg: "bg-brand-blue/10",
    text: "text-brand-blue",
    border: "border-brand-blue/30",
    chipBg: "bg-brand-blue/20",
  },
  cocinero: {
    bg: "bg-brand-yellow/10",
    text: "text-brand-yellow",
    border: "border-brand-yellow/30",
    chipBg: "bg-brand-yellow/20",
  },
  bartender: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    chipBg: "bg-primary/20",
  },
  gerente: {
    bg: "bg-brand-green/10",
    text: "text-brand-green",
    border: "border-brand-green/30",
    chipBg: "bg-brand-green/20",
  },
  encargado: {
    bg: "bg-brand-green/10",
    text: "text-brand-green",
    border: "border-brand-green/30",
    chipBg: "bg-brand-green/20",
  },
  jefe: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    chipBg: "bg-primary/20",
  },
  host: {
    bg: "bg-brand-pink/10",
    text: "text-brand-pink",
    border: "border-brand-pink/30",
    chipBg: "bg-brand-pink/20",
  },
  ayudante_cocina: {
    bg: "bg-brand-yellow/10",
    text: "text-brand-yellow",
    border: "border-brand-yellow/30",
    chipBg: "bg-brand-yellow/20",
  },
  repartidor: {
    bg: "bg-brand-blue/10",
    text: "text-brand-blue",
    border: "border-brand-blue/30",
    chipBg: "bg-brand-blue/20",
  },
};

export const getRoleColors = (role?: string): RoleColorConfig =>
  role ? roleColors[role] ?? roleColors.camarero : roleColors.camarero;
