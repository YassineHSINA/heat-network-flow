import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type NetworkSegment } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/reseau")({
  head: () => ({
    meta: [
      { title: "Réseau — HeatNet" },
      { name: "description", content: "Tronçons du réseau de distribution : températures, débits, pertes." },
      { property: "og:title", content: "Réseau — HeatNet" },
      { property: "og:description", content: "Tronçons du réseau de distribution : températures, débits, pertes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const empty: Omit<NetworkSegment, "id"> = { nom: "", tempDepart: 90, tempRetour: 60, debit: 0, longueur: 0, pertes: 0 };

function Page() {
  const { segments, addSegment, updateSegment, deleteSegment } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NetworkSegment | null>(null);
  const [form, setForm] = useState(empty);

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(s: NetworkSegment) { setEditing(s); setForm(s); setOpen(true); }
  function save() { editing ? updateSegment(editing.id, form) : addSegment(form); setOpen(false); }

  const totalLong = segments.reduce((a, s) => a + s.longueur, 0);
  const pertesMoy = segments.length ? segments.reduce((a, s) => a + s.pertes, 0) / segments.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Réseau de distribution</h2>
          <p className="text-sm text-muted-foreground">{segments.length} tronçons · {totalLong.toFixed(1)} km · pertes moy. {pertesMoy.toFixed(1)}%</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouveau"} tronçon</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>T° départ (°C)</Label><Input type="number" value={form.tempDepart} onChange={(e) => setForm({ ...form, tempDepart: +e.target.value })} /></div>
                <div><Label>T° retour (°C)</Label><Input type="number" value={form.tempRetour} onChange={(e) => setForm({ ...form, tempRetour: +e.target.value })} /></div>
                <div><Label>Débit (m³/h)</Label><Input type="number" value={form.debit} onChange={(e) => setForm({ ...form, debit: +e.target.value })} /></div>
                <div><Label>Longueur (km)</Label><Input type="number" step="0.1" value={form.longueur} onChange={(e) => setForm({ ...form, longueur: +e.target.value })} /></div>
                <div className="col-span-2"><Label>Pertes thermiques (%)</Label><Input type="number" step="0.1" value={form.pertes} onChange={(e) => setForm({ ...form, pertes: +e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tronçons</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>T° départ</TableHead>
                <TableHead>T° retour</TableHead>
                <TableHead>ΔT</TableHead>
                <TableHead>Débit</TableHead>
                <TableHead>Longueur</TableHead>
                <TableHead>Pertes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.nom}</TableCell>
                  <TableCell>{s.tempDepart} °C</TableCell>
                  <TableCell>{s.tempRetour} °C</TableCell>
                  <TableCell className="font-medium text-secondary">{s.tempDepart - s.tempRetour} °C</TableCell>
                  <TableCell>{s.debit} m³/h</TableCell>
                  <TableCell>{s.longueur} km</TableCell>
                  <TableCell>{s.pertes} %</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteSegment(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
