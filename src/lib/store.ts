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

export type AlertType = "Température insuffisante" | "Fuite" | "Pompe en panne" | "Maintenance nécessaire" | "Batterie faible";
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

export type BatteryStatus = "Charge" | "Décharge" | "Repos" | "Défaut";
export type Battery = {
  id: string;
  nom: string;
  capacite: number; // kWh
  charge: number; // % (0-100)
  puissance: number; // kW (>0 charge, <0 décharge)
  etat: BatteryStatus;
  cycles: number;
};

export type TrendPoint = {
  t: number; // timestamp
  production: number; // MW
  consommation: number; // MW
  batterie: number; // % moyen
};

type State = {
  producers: Producer[];
  consumers: Consumer[];
  segments: NetworkSegment[];
  alerts: Alert[];
  maintenances: Maintenance[];
  batteries: Battery[];
  trend: TrendPoint[];
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
  addBattery: (b: Omit<Battery, "id">) => void;
  updateBattery: (id: string, b: Partial<Battery>) => void;
  deleteBattery: (id: string) => void;
  tickSimulation: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const jitter = (v: number, pct: number) => v * (1 + (Math.random() - 0.5) * pct);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useStore = create<State>()(
  persist(
    (set, get) => ({
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
      batteries: [
        { id: uid(), nom: "Bloc BESS-01", capacite: 2400, charge: 78, puissance: 220, etat: "Charge", cycles: 412 },
        { id: uid(), nom: "Bloc BESS-02", capacite: 2400, charge: 64, puissance: -180, etat: "Décharge", cycles: 389 },
        { id: uid(), nom: "Bloc BESS-03", capacite: 1200, charge: 92, puissance: 0, etat: "Repos", cycles: 156 },
        { id: uid(), nom: "Bloc Tampon T-04", capacite: 600, charge: 45, puissance: -75, etat: "Décharge", cycles: 823 },
      ],
      trend: [],
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
      addBattery: (b) => set((s) => ({ batteries: [...s.batteries, { ...b, id: uid() }] })),
      updateBattery: (id, b) => set((s) => ({ batteries: s.batteries.map((x) => (x.id === id ? { ...x, ...b } : x)) })),
      deleteBattery: (id) => set((s) => ({ batteries: s.batteries.filter((x) => x.id !== id) })),
      tickSimulation: () => {
        const s = get();
        const producers = s.producers.map((p) => ({
          ...p,
          temperature: +clamp(jitter(p.temperature, 0.03), 40, 260).toFixed(1),
          debit: +clamp(jitter(p.debit, 0.05), 50, 600).toFixed(0),
          puissance: +clamp(jitter(p.puissance, 0.04), 0.5, 30).toFixed(2),
        }));
        const consumers = s.consumers.map((c) => ({
          ...c,
          consommation: +clamp(jitter(c.consommation, 0.06), 0.1, c.besoin * 1.05).toFixed(2),
        }));
        const batteries = s.batteries.map((b) => {
          if (b.etat === "Défaut") return b;
          const dt = 5 / 3600; // 5s in hours
          const deltaPct = ((b.puissance * dt) / b.capacite) * 100;
          let charge = clamp(b.charge + deltaPct + (Math.random() - 0.5) * 0.2, 0, 100);
          let etat: BatteryStatus = b.etat;
          let puissance = b.puissance;
          if (charge >= 99 && puissance > 0) { etat = "Repos"; puissance = 0; }
          if (charge <= 5 && puissance < 0) { etat = "Repos"; puissance = 0; }
          if (etat === "Repos" && Math.random() < 0.15) {
            etat = Math.random() < 0.5 ? "Charge" : "Décharge";
            puissance = (etat === "Charge" ? 1 : -1) * (b.capacite * 0.08);
          }
          return { ...b, charge: +charge.toFixed(1), etat, puissance: +puissance.toFixed(0) };
        });
        const production = producers.reduce((a, p) => a + p.puissance * (p.disponibilite / 100), 0);
        const consommation = consumers.reduce((a, c) => a + c.consommation, 0);
        const batAvg = batteries.length ? batteries.reduce((a, b) => a + b.charge, 0) / batteries.length : 0;
        const trend = [
          ...s.trend,
          { t: Date.now(), production: +production.toFixed(2), consommation: +consommation.toFixed(2), batterie: +batAvg.toFixed(1) },
        ].slice(-60);
        set({ producers, consumers, batteries, trend });
      },
    }),
    {
      name: "heatnet-store",
      partialize: (s) => ({
        producers: s.producers, consumers: s.consumers, segments: s.segments,
        alerts: s.alerts, maintenances: s.maintenances, batteries: s.batteries,
      }),
    },
  ),
);

// CO2 evité : hypothèse ~ 0.234 tCO2 / MWh gaz évité
export const CO2_FACTOR_T_PER_MWH = 0.234;

export function computeMetrics(state: Pick<State, "producers" | "consumers" | "segments" | "alerts" | "batteries">) {
  const production = state.producers.reduce((a, p) => a + p.puissance * (p.disponibilite / 100), 0);
  const consommation = state.consumers.reduce((a, c) => a + c.consommation, 0);
  const rendement = production > 0 ? Math.min(100, (consommation / production) * 100) : 0;
  const co2Evite = consommation * CO2_FACTOR_T_PER_MWH * 8760;
  const alertesActives = state.alerts.filter((a) => !a.fermee).length;
  const capaciteTotale = state.batteries.reduce((a, b) => a + b.capacite, 0);
  const energieStockee = state.batteries.reduce((a, b) => a + (b.capacite * b.charge) / 100, 0);
  const chargeMoyenne = capaciteTotale > 0 ? (energieStockee / capaciteTotale) * 100 : 0;
  return {
    production,
    consommation,
    rendement,
    co2Evite,
    alertesActives,
    nbUsines: state.producers.length,
    capaciteTotale,
    energieStockee,
    chargeMoyenne,
    nbBatteries: state.batteries.length,
  };
}
