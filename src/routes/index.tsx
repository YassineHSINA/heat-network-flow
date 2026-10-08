import { createFileRoute } from "@tanstack/react-router";
import { useStore, computeMetrics } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Zap, Gauge, Leaf, AlertTriangle, Battery } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, Area, AreaChart,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — HeatNet" },
      { name: "description", content: "Vue d'ensemble du réseau de chaleur : production, consommation, rendement, CO₂ évité, stockage." },
      { property: "og:title", content: "Tableau de bord — HeatNet" },
      { property: "og:description", content: "Vue d'ensemble du réseau de chaleur : production, consommation, rendement, CO₂ évité, stockage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function KpiCard({ icon: Icon, label, value, unit, tint }: { icon: any; label: string; value: string; unit?: string; tint: "blue" | "orange" | "green" | "red" }) {
  const tints = {
    blue: "bg-primary/10 text-primary",
    orange: "bg-secondary/20 text-secondary",
    green: "bg-emerald-500/15 text-emerald-600",
    red: "bg-destructive/15 text-destructive",
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tints[tint]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const state = useStore();
  const m = computeMetrics(state);

  const producerData = state.producers.map((p) => ({
    name: p.nom,
    puissance: +(p.puissance * (p.disponibilite / 100)).toFixed(2),
  }));
  const consumerData = state.consumers.map((c) => ({
    name: c.nom,
    besoin: c.besoin,
    consommation: c.consommation,
  }));
  const liveTrend = state.trend.map((p) => ({
    time: new Date(p.t).toLocaleTimeString("fr-FR", { minute: "2-digit", second: "2-digit" }),
    prod: p.production,
    cons: p.consommation,
    batt: p.batterie,
  }));
  const priorites = ["Haute", "Moyenne", "Basse"].map((p) => ({
    name: p,
    value: state.consumers.filter((c) => c.priorite === p).length,
  }));
  const COLORS = ["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-3)"];

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 text-primary-foreground shadow-lg"
        style={{ background: "var(--gradient-heat)" }}
      >
        <p className="text-sm opacity-90">Supervision temps réel</p>
        <h2 className="text-2xl font-bold md:text-3xl">Réseau de chaleur fatale</h2>
        <p className="mt-1 text-sm opacity-90">
          {state.producers.length} fours · {state.consumers.length} bâtiments · {state.batteries.length} blocs BESS · {m.alertesActives} alerte(s) active(s)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <KpiCard icon={Flame} label="Production" value={m.production.toFixed(1)} unit="MW" tint="orange" />
        <KpiCard icon={Zap} label="Consommation" value={m.consommation.toFixed(1)} unit="MW" tint="blue" />
        <KpiCard icon={Gauge} label="Rendement" value={m.rendement.toFixed(1)} unit="%" tint="blue" />
        <KpiCard icon={Leaf} label="CO₂ évité / an" value={(m.co2Evite / 1000).toFixed(1)} unit="kt" tint="green" />
        <KpiCard icon={Battery} label="Charge batt." value={m.chargeMoyenne.toFixed(0)} unit="%" tint="green" />
        <KpiCard icon={Flame} label="Fours" value={String(m.nbFours)} tint="orange" />
        <KpiCard icon={AlertTriangle} label="Alertes" value={String(m.alertesActives)} tint="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Production & consommation — temps réel (MW)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={liveTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="prod" name="Production" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.25} strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="cons" name="Consommation" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Production par four (MW)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={producerData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="puissance" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Besoin vs consommation (MW)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={consumerData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="besoin" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="consommation" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Charge batteries moyenne (%)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={liveTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="batt" name="Charge %" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Priorités consommateurs</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={priorites} dataKey="value" nameKey="name" outerRadius={90} label>
                  {priorites.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
