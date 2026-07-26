import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Consumer } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/consommateurs")({
  head: () => ({
    meta: [
      { title: "Consommateurs — HeatNet" },
      { name: "description", content: "Bâtiments alimentés par le réseau de chaleur." },
    ],
  }),
  component: Page,
});

const empty: Omit<Consumer, "id"> = { nom: "", besoin: 0, consommation: 0, priorite: "Moyenne" };

function Page() {
  const { consumers, addConsumer, updateConsumer, deleteConsumer } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Consumer | null>(null);
  const [form, setForm] = useState(empty);

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(c: Consumer) { setEditing(c); setForm(c); setOpen(true); }
  function save() {
    if (editing) updateConsumer(editing.id, form); else addConsumer(form);
    setOpen(false);
  }

  const priorityColor = { Haute: "destructive", Moyenne: "secondary", Basse: "outline" } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consommateurs</h2>
          <p className="text-sm text-muted-foreground">Bâtiments alimentés par le réseau</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouveau"} consommateur</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nom</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Besoin (MW)</Label><Input type="number" step="0.1" value={form.besoin} onChange={(e) => setForm({ ...form, besoin: +e.target.value })} /></div>
                <div><Label>Consommation (MW)</Label><Input type="number" step="0.1" value={form.consommation} onChange={(e) => setForm({ ...form, consommation: +e.target.value })} /></div>
              </div>
              <div>
                <Label>Priorité</Label>
                <Select value={form.priorite} onValueChange={(v) => setForm({ ...form, priorite: v as Consumer["priorite"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haute">Haute</SelectItem>
                    <SelectItem value="Moyenne">Moyenne</SelectItem>
                    <SelectItem value="Basse">Basse</SelectItem>
                  </SelectContent>
                </Select>
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
        <CardHeader><CardTitle className="text-base">Liste ({consumers.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bâtiment</TableHead>
                <TableHead>Besoin</TableHead>
                <TableHead>Consommation</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumers.map((c) => {
                const taux = c.besoin > 0 ? (c.consommation / c.besoin) * 100 : 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nom}</TableCell>
                    <TableCell>{c.besoin} MW</TableCell>
                    <TableCell>{c.consommation} MW</TableCell>
                    <TableCell className="w-40"><Progress value={taux} /><span className="text-xs text-muted-foreground">{taux.toFixed(0)}%</span></TableCell>
                    <TableCell><Badge variant={priorityColor[c.priorite]}>{c.priorite}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteConsumer(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
