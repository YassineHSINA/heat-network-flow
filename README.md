# Heat Hub Manager

Objectif :
Développer une application permettant de gérer un réseau de chaleur intelligent en centralisant les données des producteurs de chaleur fatale, des consommateurs, du réseau de distribution et des opérations de maintenance.

L'application doit contenir les écrans suivants :

 Accueil (Dashboard)

 Production totale de chaleur (MW)

 Consommation totale (MW)

 Rendement du réseau (%)

 CO₂ évité

 Nombre d'usines connectées

 Nombre d'alertes

 Producteurs

 Liste des usines

 Ajouter / Modifier / Supprimer

 Champs :

 Nom de l'usine

 Température (°C)

 Débit

 Puissance récupérable (MW)

 Disponibilité

 Consommateurs

 Liste des bâtiments alimentés

 Besoin thermique

 Consommation actuelle

 Priorité

 Réseau

 Liste des tronçons

 Température départ

 Température retour

 Débit

 Longueur

 Pertes thermiques

 Alertes

 Température insuffisante

 Fuite

 Pompe en panne

 Maintenance nécessaire

 Possibilité de fermer une alerte

 Maintenance

 Historique des interventions

 Technicien

 Date

 Rapport

Fonctionnalités :

 Navigation entre les écrans.

 Tableau de bord avec graphiques.

 Calcul automatique du rendement énergétique.

 Calcul des émissions de CO₂ évitées.

 Interface moderne avec un thème bleu et orange rappelant l'énergie et la chaleur.

 Compatible mobile.

 Base de données SharePoint ou Dataverse.

 Formules Power Fx pour les calculs.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://heat-network-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e129a77-f557-4f39-ab29-f0ac3c6071e6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
