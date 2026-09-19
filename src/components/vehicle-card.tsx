import { BatteryCharging, Cog, Fingerprint, Gauge } from "lucide-react";

import { VEHICLE } from "@/lib/vehicle";

export function VehicleCard() {
  return (
    <div className="vehicle-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {VEHICLE.arabic.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{VEHICLE.arabic.subtitle}</p>
        </div>
        <div className="vin-badge">
          <Fingerprint className="size-4 shrink-0" />
          <span className="font-mono text-xs tracking-wider sm:text-sm">{VEHICLE.vin}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Spec icon={<Gauge className="size-4" />} label="المحرك" value="6.0L V8 FHEV" />
        <Spec icon={<BatteryCharging className="size-4" />} label="النظام" value="2-Mode Hybrid" />
        <Spec icon={<Cog className="size-4" />} label="الدفع" value="4WD — 2010" />
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="spec-pill">
      <span className="text-accent">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ms-auto font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
