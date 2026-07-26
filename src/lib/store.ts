import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Producer = {
  id: string;
  nom: string;
  temperature: number; // °C
  debit: number; // m³/h
  puissance: number; // MW récupérable
  disponibilite: number; // %
};

export type Consumer = {
  id: string;
  nom: string;
  besoin: number; // MW
  consommation: number; // MW
  priorite: "Haute" | "Moyenne" | "Basse";
};

export type NetworkSegment = {
  id: string;
  nom: string;
  tempDepart: number;
  tempRetour: number;
  debit: number;
  longueur: number; // km
  pertes: number; // %
};

export type AlertType = "Température insuffisante" | "Fuite" | "Pompe en panne" | "Maintenance nécessaire";
export type Alert = {
  id: string;
  type: AlertType;
  message: string;
  date: string;
  cible: string;
  fermee: boolean;
};

export type Maintenance = {
  id: string;
  technicien: string;
  date: string;
  cible: string;
  rapport: string;
};

type State = {
  producers: Producer[];
  consumers: Consumer[];
  segments: NetworkSegment[];
  alerts: Alert[];
  maintenances: Maintenance[];
  addProducer: (p: Omit<Producer, "id">) => void;
  updateProducer: (id: string, p: Partial<Producer>) => void;
  deleteProducer: (id: string) => void;
  addConsumer: (c: Omit<Consumer, "id">) => void;
  updateConsumer: (id: string, c: Partial<Consumer>) => void;
  deleteConsumer: (id: string) => void;
  addSegment: (s: Omit<NetworkSegment, "id">) => void;
  updateSegment: (id: string, s: Partial<NetworkSegment>) => void;
  deleteSegment: (id: string) => void;
  addAlert: (a: Omit<Alert, "id">) => void;
  closeAlert: (id: string) => void;
  addMaintenance: (m: Omit<Maintenance, "id">) => void;
  deleteMaintenance: (id: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set) => ({
      producers: [
        { id: uid(), nom: "Aciérie Nord", temperature: 180, debit: 320, puissance: 12.5, disponibilite: 96 },
        { id: uid(), nom: "Data Center Est", temperature: 65, debit: 180, puissance: 4.2, disponibilite: 99 },
        { id: uid(), nom: "Cimenterie Sud", temperature: 220, debit: 410, puissance: 18.3, disponibilite: 88 },
        { id: uid(), nom: "Verrerie Ouest", temperature: 150, debit: 220, puissance: 7.8, disponibilite: 92 },
      ],
      consumers: [
        { id: uid(), nom: "Hôpital Central", besoin: 6.5, consommation: 5.9, priorite: "Haute" },
        { id: uid(), nom: "Quartier résidentiel Belair", besoin: 12.0, consommation: 10.8, priorite: "Moyenne" },
        { id: uid(), nom: "Campus universitaire", besoin: 8.4, consommation: 7.1, priorite: "Moyenne" },
        { id: uid(), nom: "Piscine municipale", besoin: 2.1, consommation: 1.9, priorite: "Basse" },
        { id: uid(), nom: "Zone industrielle", besoin: 9.3, consommation: 8.6, priorite: "Haute" },
      ],
      segments: [
        { id: uid(), nom: "Tronçon A1", tempDepart: 95, tempRetour: 62, debit: 340, longueur: 2.4, pertes: 3.2 },
        { id: uid(), nom: "Tronçon A2", tempDepart: 92, tempRetour: 60, debit: 280, longueur: 1.8, pertes: 2.6 },
        { id: uid(), nom: "Tronçon B1", tempDepart: 90, tempRetour: 58, debit: 210, longueur: 3.1, pertes: 4.1 },
        { id: uid(), nom: "Tronçon C1", tempDepart: 88, tempRetour: 55, debit: 175, longueur: 4.2, pertes: 5.3 },
      ],
      alerts: [
        { id: uid(), type: "Température insuffisante", message: "Tronçon B1 sous seuil (78°C)", date: new Date().toISOString(), cible: "Tronçon B1", fermee: false },
        { id: uid(), type: "Pompe en panne", message: "Pompe P-04 arrêtée", date: new Date(Date.now() - 3600e3).toISOString(), cible: "Cimenterie Sud", fermee: false },
        { id: uid(), type: "Maintenance nécessaire", message: "Contrôle annuel échangeur", date: new Date(Date.now() - 86400e3).toISOString(), cible: "Verrerie Ouest", fermee: false },
      ],
      maintenances: [
        { id: uid(), technicien: "Marc Dubois", date: "2026-07-15", cible: "Aciérie Nord", rapport: "Remplacement joint échangeur principal. RAS." },
        { id: uid(), technicien: "Sophie Laurent", date: "2026-06-28", cible: "Tronçon A1", rapport: "Purge et calibrage capteurs de pression." },
        { id: uid(), technicien: "Karim Benali", date: "2026-05-10", cible: "Data Center Est", rapport: "Installation nouvelle sonde température." },
      ],
      addProducer: (p) => set((s) => ({ producers: [...s.producers, { ...p, id: uid() }] })),
      updateProducer: (id, p) => set((s) => ({ producers: s.producers.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deleteProducer: (id) => set((s) => ({ producers: s.producers.filter((x) => x.id !== id) })),
      addConsumer: (c) => set((s) => ({ consumers: [...s.consumers, { ...c, id: uid() }] })),
      updateConsumer: (id, c) => set((s) => ({ consumers: s.consumers.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteConsumer: (id) => set((s) => ({ consumers: s.consumers.filter((x) => x.id !== id) })),
      addSegment: (seg) => set((s) => ({ segments: [...s.segments, { ...seg, id: uid() }] })),
      updateSegment: (id, seg) => set((s) => ({ segments: s.segments.map((x) => (x.id === id ? { ...x, ...seg } : x)) })),
      deleteSegment: (id) => set((s) => ({ segments: s.segments.filter((x) => x.id !== id) })),
      addAlert: (a) => set((s) => ({ alerts: [{ ...a, id: uid() }, ...s.alerts] })),
      closeAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, fermee: true } : a)) })),
      addMaintenance: (m) => set((s) => ({ maintenances: [{ ...m, id: uid() }, ...s.maintenances] })),
      deleteMaintenance: (id) => set((s) => ({ maintenances: s.maintenances.filter((x) => x.id !== id) })),
    }),
    { name: "heatnet-store" },
  ),
);

// CO2 evité : hypothèse ~ 0.234 tCO2 / MWh gaz évité
export const CO2_FACTOR_T_PER_MWH = 0.234;

export function computeMetrics(state: Pick<State, "producers" | "consumers" | "segments" | "alerts">) {
  const production = state.producers.reduce((a, p) => a + p.puissance * (p.disponibilite / 100), 0);
  const consommation = state.consumers.reduce((a, c) => a + c.consommation, 0);
  const rendement = production > 0 ? Math.min(100, (consommation / production) * 100) : 0;
  // CO2 evité annuel (t) = énergie livrée * facteur * 8760h
  const co2Evite = consommation * CO2_FACTOR_T_PER_MWH * 8760;
  const alertesActives = state.alerts.filter((a) => !a.fermee).length;
  return {
    production,
    consommation,
    rendement,
    co2Evite,
    alertesActives,
    nbUsines: state.producers.length,
  };
}
