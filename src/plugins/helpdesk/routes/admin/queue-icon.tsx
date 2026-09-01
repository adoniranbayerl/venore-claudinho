import {
  Cpu,
  Droplets,
  Hammer,
  LifeBuoy,
  Monitor,
  Network,
  Plug,
  Printer,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { DEFAULT_QUEUE_ICON } from "@/plugins/helpdesk/shared/queue-icons";

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  hammer: Hammer,
  monitor: Monitor,
  cpu: Cpu,
  printer: Printer,
  network: Network,
  plug: Plug,
  droplets: Droplets,
  wind: Wind,
  "life-buoy": LifeBuoy,
};

export function QueueIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = ICONS[icon ?? ""] ?? ICONS[DEFAULT_QUEUE_ICON];
  return <Icon className={className} />;
}
