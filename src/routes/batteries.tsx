import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, computeMetrics, type BatteryStatus } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Battery, BatteryCharging, BatteryLow, Plus, Trash2, Zap } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/batteries")({
  head: () => ({
    meta: [
      { title: "Stockage batteries — HeatNet" },
      { name: "description", content: "Supervision des blocs de stockage : charge, puissance, cycles, état temps réel." },
    ],
  }),
  component: Page,
});

const etats: BatteryStatus[] = ["Charge", "Décharge", "Repos", "Défaut"];

function etatColor(e: BatteryStatus) {
  switch (e) {
    case "Charge": return "bg-emerald-500/15 text-emerald-600";
    case "Décharge": return "bg-secondary/20 text-secondary";
    case "Repos": return "bg-muted text-muted-foreground";
    case "Défaut": return "bg-destructive/15 text-destructive";
  }
}

function EtatIcon({ e }: { e: BatteryStatus }) {
  if (e === "Charge") return <BatteryCharging className="h-4 w-4" />;
  if (e === "Décharge") return <Zap className="h-4 w-4" />;
  if (e === "Défaut") return <BatteryLow className="h-4 w-4" />;
  return <Battery className="h-4 w-4" />;
}

function Page() {
  const { batteries, trend, addBattery, updateBattery, deleteBattery } = useStore();
  const m = computeMetrics(useStore.getState());
  const [open, setOpen] = useState(false);
  const empty = { nom: "", capacite: 1000, charge: 50, puissance: 0, etat: "Repos" as BatteryStatus, cycles: 0 };
  const [form, setForm] = useState(empty);

  function save() {
    if (!form.nom) return;
    addBattery(form);
    setForm(empty);
    setOpen(false);
  }

  const batTrend = trend.map((p) => ({ time: new Date(p.t).toLocaleTimeString("fr-FR", { minute: "2-digit", second: "2-digit" }), batterie: p.batterie }));
  const puissanceNette = batteries.reduce((a, b) => a + b.puissance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Battery className="h-6 w-6 text-primary" /> Stockage batteries
          </h2>
          <p className="text-sm text-muted-foreground">Blocs BESS — charge, puissance et cycles en temps réel</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nouveau bloc</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau bloc de stockage</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Capacité (kWh)</Label><Input type="number" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: +e.target.value })} /></div>
                <div><Label>Charge (%)</Label><Input type="number" value={form.charge} onChange={(e) => setForm({ ...form, charge: +e.target.value })} /></div>
                <div><Label>Puissance (kW, +charge / -décharge)</Label><Input type="number" value={form.puissance} onChange={(e) => setForm({ ...form, puissance: +e.target.value })} /></div>
                <div><Label>Cycles</Label><Input type="number" value={form.cycles} onChange={(e) => setForm({ ...form, cycles: +e.target.value })} /></div>
                <div className="col-span-2">
                  <Label>État</Label>
                  <Select value={form.etat} onValueChange={(v) => setForm({ ...form, etat: v as BatteryStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{etats.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Capacité totale</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{(m.capaciteTotale / 1000).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">MWh</span></p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Énergie stockée</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{(m.energieStockee / 1000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MWh</span></p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Charge moyenne</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{m.chargeMoyenne.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">%</span></p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Puissance nette</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${puissanceNette >= 0 ? "text-emerald-600" : "text-secondary"}`}>
            {puissanceNette >= 0 ? "+" : ""}{puissanceNette.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">kW</span>
          </p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Charge moyenne du parc (temps réel)</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer>
            <LineChart data={batTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="batterie" name="Charge %" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Blocs ({batteries.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead className="min-w-[180px]">Charge</TableHead>
                <TableHead>Puissance</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Cycles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batteries.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.nom}</TableCell>
                  <TableCell className="tabular-nums">{b.capacite} kWh</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={b.charge} className="h-2 w-32" />
                      <span className="tabular-nums text-sm">{b.charge.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={`tabular-nums ${b.puissance > 0 ? "text-emerald-600" : b.puissance < 0 ? "text-secondary" : ""}`}>
                    {b.puissance > 0 ? "+" : ""}{b.puissance} kW
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${etatColor(b.etat)}`}><EtatIcon e={b.etat} /> {b.etat}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{b.cycles}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Select value={b.etat} onValueChange={(v) => updateBattery(b.id, { etat: v as BatteryStatus })}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>{etats.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" onClick={() => deleteBattery(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
