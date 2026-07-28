# Projet42 - Cahier des charges simplifié (scope 80%)

Version allégée du cahier des charges d'origine, pensée pour obtenir un pipeline
complet et fonctionnel (OpenStack -> IaC -> Ansible -> Monitoring) plutôt que
des phases parfaites à 100% mais incomplètes. Établi le 2026-07-08.

## Principe

Plutôt que de finir chaque phase du CDC d'origine à 100% dans l'ordre, on
garde le strict nécessaire de chaque brique pour avoir un flux de bout en
bout qui fonctionne : sélection d'un template -> déploiement OpenTofu ->
provisionnement Ansible -> visualisation des métriques dans Grafana.

## État au démarrage de ce plan

- **Phase 1 (MVP)** : ~75% fait — auth JWT complète, worker OpenStack
  (VMs, volumes, réseaux, images, flavors, quotas, projets), frontend-v2
  avec pages réelles (Dashboard, Resources, Network, Datastore, VMDetail,
  Login, Settings). Multi-provider en cours (branche `feature/multi-projets`).
- **Phases 2 à 5** : 0% (rien de codé), sauf docs vides et stubs.

## Périmètre retenu par phase

### Phase 1 — Finir le MVP
**Garder :**
- Multi-provider fini (chiffrement des credentials, sélection du provider
  dans les requêtes)
- Synchronisation périodique + cache en base (aujourd'hui tout est en
  proxy live vers le worker, rien n'est persisté)
- Dashboard existant

**Couper :**
- Export CSV/JSON
- Multi-région
- Recherche/filtrage avancée (un filtre simple suffit)

**Estimation :** 3-5 jours

### Phase 2 — IaC (OpenTofu)
**Garder :**
- 2-3 templates réels (ex : VM seule, stack LAMP)
- Formulaire de saisie de variables
- Prévisualisation du plan
- Apply / Destroy

**Couper :**
- Rollback automatique sophistiqué (un simple "destroy" suffit)
- Catalogue extensible/plugin
- Gestion Git complète des templates (versionner en dur dans le repo suffit)

**Estimation :** 1-1,5 semaine

### Phase 3 — Provisionnement (Ansible)
**Garder :**
- Lancement de playbook
- Inventaire dynamique généré depuis les VMs OpenStack
- Logs en temps réel

**Couper :**
- Exécution parallèle optimisée
- Reprise sur erreur fine (un retry manuel suffit)
- Gestion de rôles avancée

**Estimation :** 1 semaine

### Phase 4 — Monitoring
**Garder :**
- Prometheus
- 1-2 dashboards Grafana (santé + capacité)
- Alerting sur un seul canal (webhook)

**Couper :**
- Les 5 dashboards du CDC d'origine
- Alerting email + Mattermost
- Tendances historiques poussées

**Estimation :** 1 semaine

### Phase 5 — Industrialisation
**Garder :**
- Secrets chiffrés en base
- Rate limiting basique
- README + guide d'installation

**Couper :**
- Pipeline CI/CD complet (build/test manuel en attendant)
- Documentation exhaustive (Swagger suffit pour l'API)

**Estimation :** 3-4 jours

### Phase 6 — Pilote (post-développement)

Avant de considérer l'outil "livré" à l'équipe technique, une phase de
validation en conditions réelles est nécessaire. Le scope réduit donne un
**prototype fonctionnel**, pas un produit durci pour un usage sans
supervision (pas de CI/CD, sécurité basique non auditée, pas de doc
utilisateur, pas de plan de support).

**Contenu :**
- 1-2 collègues techniques utilisent l'outil sur de vrais cas d'usage
  (déployer une vraie VM, lancer un vrai playbook, consulter les vrais
  dashboards)
- Disponibilité pour corriger les bugs en direct pendant la période
- Recueil des retours d'usage (UX, cas d'erreur non gérés, besoins de doc)
- Ajustements avant ouverture à un usage plus large

**Ce qu'on surveille en priorité pendant le pilote :**
- Actions destructrices (delete VM, destroy OpenTofu) : garde-fous suffisants ?
- Comportement en cas d'erreur OpenStack/Ansible/OpenTofu (messages clairs
  ou stack trace brute ?)
- Fiabilité de la synchronisation/cache en base
- Charge réelle de support (combien de fois tu es sollicité par jour ?)

**Durée :** 1-2 semaines

**Sortie de cette phase :** soit l'outil est jugé stable et adopté plus
largement, soit une liste de correctifs prioritaires est identifiée avant
adoption large.

### Phase 7 — Finalisation et livraison

Le pilote produit presque toujours une liste de correctifs. Cette phase
consiste à les traiter puis à clore formellement le projet, plutôt que de
laisser l'outil "en cours" indéfiniment.

**Contenu :**
1. **Correctifs post-pilote** — traiter les bugs et frictions remontés
   pendant le pilote (priorité aux actions destructrices mal gérées et aux
   erreurs opaques)
2. **Checklist de recette** — repasser sur chaque item "gardé" du périmètre
   réduit (sections ci-dessus) et cocher qu'il fonctionne réellement, pas
   juste en théorie :
   - [ ] Connexion multi-provider fonctionnelle et credentials chiffrés
   - [ ] Dashboard à jour via la synchronisation en base (pas de données
     périmées)
   - [ ] Déploiement d'un template OpenTofu de bout en bout (plan + apply
     + destroy) sans intervention manuelle en dehors de l'UI
   - [ ] Playbook Ansible lancé depuis l'UI avec logs visibles en temps réel
   - [ ] Dashboards Grafana affichant des données réelles, alerte webhook
     déclenchée au moins une fois en test
   - [ ] Rate limiting et chiffrement des secrets vérifiés
3. **Livrables de passation** à préparer :
   - README + guide d'installation à jour
   - Guide utilisateur minimal (captures d'écran des flux principaux :
     déployer une VM, lancer un playbook, lire un dashboard)
   - Liste des accès/credentials à transmettre à l'équipe (qui a accès à
     quoi)
   - Procédure de sauvegarde de base (dump de la base de données à minima)
4. **Décision finale go/no-go** — toi (ou le responsable technique) valides
   explicitement que l'outil passe de "pilote" à "livré"
5. **Communication à l'équipe** — annonce officielle + courte session de
   présentation/formation aux utilisateurs prévus

**Durée :** 3-5 jours (hors temps d'attente des retours du pilote)

**Sortie de cette phase :** le projet est considéré **livré** — plus
"prototype en test", mais outil officiellement adopté par l'équipe
technique, avec une checklist de recette validée et une passation
documentée.

## Récapitulatif temps

| Phase | Temps réduit (80%) |
|---|---|
| 1. Finir MVP | 3-5 j |
| 2. OpenTofu | 1-1,5 sem |
| 3. Ansible | 1 sem |
| 4. Monitoring | 1 sem |
| 5. Industrialisation | 3-4 j |
| 6. Pilote | 1-2 sem |
| 7. Finalisation et livraison | 3-5 j |
| **Total code pur (phases 1-5)** | **≈ 4-5 semaines** |
| **Calendrier réel estimé (dev + pilote + livraison)** | **≈ 8-11 semaines** (goulot d'étranglement : tests contre la vraie infra Infomaniak, pas la vitesse d'écriture du code) |

## Calendrier daté

**Date de démarrage :** 08/07/2026
**Rythme retenu :** 3h/jour, ~5 jours/semaine (hypothèse à ajuster si le
rythme réel diffère — un rythme 7j/7 raccourcirait le calendrier d'environ
une semaine, un rythme plus irrégulier l'allongerait)

| Phase | Durée | Fin estimée |
|---|---|---|
| 1. Finir MVP | ~7 j | **15/07/2026** |
| 2. OpenTofu | ~12 j | **27/07/2026** |
| 3. Ansible | ~9 j | **05/08/2026** |
| 4. Monitoring | ~9 j | **14/08/2026** |
| 5. Industrialisation | ~7 j | **21/08/2026** |
| 6. Pilote | 7-14 j | **28/08/2026 – 04/09/2026** |
| 7. Finalisation et livraison | 3-5 j | **04/09/2026 – 09/09/2026** |

**Date cible de livraison finale à l'équipe technique : première semaine de
septembre 2026.**

Ce calendrier suppose une progression linéaire sans blocage majeur. Les
imprévus les plus probables qui le décaleraient : un problème de crédentials
ou de quota sur Infomaniak qui bloque les tests, un template OpenTofu ou un
playbook Ansible qui ne se comporte pas comme prévu en conditions réelles,
ou simplement des jours sans les 3h prévues.

## Ordre d'exécution recommandé

1. Finir la Phase 1 (base saine indispensable)
2. OpenTofu (le plus gros morceau restant)
3. Ansible (dépend d'avoir des VMs à provisionner)
4. Monitoring (dépend d'avoir des VMs à surveiller)
5. Industrialisation minimale en dernier
6. Pilote avec 1-2 collègues avant adoption large — l'outil n'est pas
   considéré "fini" tant que cette étape n'est pas passée
