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

## Récapitulatif temps

| Phase | Temps réduit (80%) |
|---|---|
| 1. Finir MVP | 3-5 j |
| 2. OpenTofu | 1-1,5 sem |
| 3. Ansible | 1 sem |
| 4. Monitoring | 1 sem |
| 5. Industrialisation | 3-4 j |
| **Total code pur** | **≈ 4-5 semaines** |
| **Calendrier réel estimé** | **≈ 6-8 semaines** (goulot d'étranglement : tests contre la vraie infra Infomaniak, pas la vitesse d'écriture du code) |

## Ordre d'exécution recommandé

1. Finir la Phase 1 (base saine indispensable)
2. OpenTofu (le plus gros morceau restant)
3. Ansible (dépend d'avoir des VMs à provisionner)
4. Monitoring (dépend d'avoir des VMs à surveiller)
5. Industrialisation minimale en dernier
