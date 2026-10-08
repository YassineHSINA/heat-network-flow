import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type AlertType } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Plus, Thermometer, Droplet, Wrench, Cog } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/alertes")({
  head: () => ({
    meta: [
      { title: "Alertes — HeatNet" },
      { name: "description", content: "Alertes température, fuites, pannes de pompe, maintenance." },
      { property: "og:title", content: "Alertes — HeatNet" },
      { property: "og:description", content: "Alertes température, fuites, pannes de pompe, maintenance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const iconFor = (t: AlertType) => {
  if (t === "Température insuffisante") return Thermometer;
  if (t === "Fuite") return Droplet;
  if (t === "Pompe en panne") return Cog;
  return Wrench;
};

const TYPES: AlertType[] = ["Température insuffisante", "Fuite", "Pompe en panne", "Maintenance nécessaire"];

function Page() {
  const { alerts, addAlert, closeAlert } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ type: AlertType; message: string; cible: string }>({
    type: "Température insuffisante", message: "", cible: "",
  });

  function save() {
    addAlert({ ...form, date: new Date().toISOString(), fermee: false });
    setOpen(false); setForm({ type: "Température insuffisante", message: "", cible: "" });
  }

  const actives = alerts.filter((a) => !a.fermee);
  const fermees = alerts.filter((a) => a.fermee);

  const AlertRow = ({ a }: { a: typeof alerts[number] }) => {
    const Icon = iconFor(a.type);
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.fermee ? "bg-muted text-muted-foreground" : "bg-destructive/15 text-destructive"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{a.type}</span>
              <Badge variant="outline">{a.cible}</Badge>
              {a.fermee && <Badge variant="secondary">Fermée</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{a.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(a.date).toLocaleString("fr-FR")}</p>
          </div>
        </div>
        {!a.fermee && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => closeAlert(a.id)}>
            <CheckCircle2 className="h-4 w-4" /> Fermer
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-destructive" /> Alertes</h2>
          <p className="text-sm text-muted-foreground">{actives.length} active(s) · {fermees.length} fermée(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nouvelle alerte</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle alerte</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AlertType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Cible</Label><Input value={form.cible} onChange={(e) => setForm({ ...form, cible: e.target.value })} placeholder="Ex : Tronçon B1" /></div>
              <div><Label>Message</Label><Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="actives">
        <TabsList>
          <TabsTrigger value="actives">Actives ({actives.length})</TabsTrigger>
          <TabsTrigger value="fermees">Fermées ({fermees.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="actives">
          <Card><CardContent className="space-y-3 p-4">
            {actives.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Aucune alerte active 🎉</p> : actives.map((a) => <AlertRow key={a.id} a={a} />)}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="fermees">
          <Card><CardContent className="space-y-3 p-4">
            {fermees.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Aucune alerte fermée.</p> : fermees.map((a) => <AlertRow key={a.id} a={a} />)}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
