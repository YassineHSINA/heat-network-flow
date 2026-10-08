import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Producer } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/producteurs")({
  head: () => ({
    meta: [
      { title: "Fours — HeatNet" },
      { name: "description", content: "Supervision des quatre fours : température, débit, puissance récupérable et disponibilité." },
      { property: "og:title", content: "Fours — HeatNet" },
      { property: "og:description", content: "Supervision des quatre fours : température, débit, puissance récupérable et disponibilité." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProducteursPage,
});

const empty: Omit<Producer, "id"> = { nom: "", temperature: 0, debit: 0, puissance: 0, disponibilite: 100 };

function ProducteursPage() {
  const { producers, addProducer, updateProducer, deleteProducer } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producer | null>(null);
  const [form, setForm] = useState(empty);

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(p: Producer) { setEditing(p); setForm(p); setOpen(true); }
  function save() {
    if (editing) updateProducer(editing.id, form);
    else addProducer(form);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fours</h2>
          <p className="text-sm text-muted-foreground">Fours de récupération de chaleur fatale</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier le" : "Nouveau"} four</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label htmlFor="four-nom">Nom du four</Label><Input id="four-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Température (°C)</Label><Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: +e.target.value })} /></div>
                <div><Label>Débit (m³/h)</Label><Input type="number" value={form.debit} onChange={(e) => setForm({ ...form, debit: +e.target.value })} /></div>
                <div><Label>Puissance (MW)</Label><Input type="number" step="0.1" value={form.puissance} onChange={(e) => setForm({ ...form, puissance: +e.target.value })} /></div>
                <div><Label>Disponibilité (%)</Label><Input type="number" value={form.disponibilite} onChange={(e) => setForm({ ...form, disponibilite: +e.target.value })} /></div>
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
        <CardHeader><CardTitle className="text-base">Liste des fours ({producers.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Température</TableHead>
                <TableHead>Débit</TableHead>
                <TableHead>Puissance</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {producers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nom}</TableCell>
                  <TableCell>{p.temperature} °C</TableCell>
                  <TableCell>{p.debit} m³/h</TableCell>
                  <TableCell>{p.puissance} MW</TableCell>
                  <TableCell>
                    <Badge variant={p.disponibilite >= 95 ? "default" : p.disponibilite >= 85 ? "secondary" : "destructive"}>
                      {p.disponibilite}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label={`Modifier ${p.nom}`} title={`Modifier ${p.nom}`} onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Supprimer ${p.nom}`} title={`Supprimer ${p.nom}`} onClick={() => deleteProducer(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
