import {
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Package,
  Target,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { DEFAULT_SECTOR_ICON } from "@/plugins/company-metrics/shared/sector-icons";

const ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  wallet: Wallet,
  megaphone: Megaphone,
  users: Users,
  "graduation-cap": GraduationCap,
  package: Package,
  "clipboard-list": ClipboardList,
  "building-2": Building2,
  target: Target,
};

export function SectorIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = ICONS[icon ?? ""] ?? ICONS[DEFAULT_SECTOR_ICON];
  return <Icon className={className} />;
}
