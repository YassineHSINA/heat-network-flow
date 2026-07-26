import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Wrench } from "lucide-react";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance — HeatNet" },
      { name: "description", content: "Historique des interventions de maintenance sur le réseau." },
    ],
  }),
  component: Page,
});

function Page() {
  const { maintenances, addMaintenance, deleteMaintenance } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ technicien: "", date: new Date().toISOString().slice(0, 10), cible: "", rapport: "" });

  function save() { addMaintenance(form); setOpen(false); setForm({ technicien: "", date: new Date().toISOString().slice(0, 10), cible: "", rapport: "" }); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-secondary" /> Maintenance</h2>
          <p className="text-sm text-muted-foreground">Historique des interventions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nouvelle intervention</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle intervention</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Technicien</Label><Input value={form.technicien} onChange={(e) => setForm({ ...form, technicien: e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div><Label>Cible</Label><Input value={form.cible} onChange={(e) => setForm({ ...form, cible: e.target.value })} placeholder="Ex : Aciérie Nord" /></div>
              <div><Label>Rapport</Label><Textarea rows={4} value={form.rapport} onChange={(e) => setForm({ ...form, rapport: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Interventions ({maintenances.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Technicien</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Rapport</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">{new Date(m.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-medium">{m.technicien}</TableCell>
                  <TableCell>{m.cible}</TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">{m.rapport}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => deleteMaintenance(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
