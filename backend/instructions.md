# Contexte

Une API backend existe déjà et expose les leads générés par le site web d’une salle de sport CrossFit appelée CrossFit Avignon.

Le site web collecte des leads via un formulaire et les envoie à cette API.

Nous voulons maintenant créer le MVP d’un CRM interne permettant de gérer ces leads.

L’objectif principal est d’aider les fondateurs de la salle à :
 - consulter les leads entrants
 - suivre leur statut
 - organiser les rappels
 - suivre les conversions

Le système doit être simple, rapide et orienté action commerciale.

⸻

# Stack technique

Créer une application frontend moderne.

Technologies :
 - React
 - TypeScript
 - Vite
 - TailwindCSS
 - shadcn/ui
 - TanStack Query (pour les appels API)
 - React Router

⸻

# Objectif du MVP

Construire une interface CRM simple permettant de gérer les leads.

Le MVP doit permettre :
 - voir les nouveaux leads
 - voir les leads à rappeler
 - consulter un lead
 - modifier le statut
 - ajouter des notes
 - planifier un rappel

⸻

# Pages à implémenter

Dashboard

Page d’accueil avec indicateurs :
 - nouveaux leads aujourd’hui
 - leads à rappeler aujourd’hui
 - nombre total de leads
 - leads convertis

Afficher aussi une liste des leads récents.

⸻

# Leads List

Page listant tous les leads.

Table avec colonnes :
 - prénom
 - nom
 - téléphone
 - email
 - source
 - statut
 - date de création
 - prochaine action

Fonctionnalités :
 - tri
 - pagination
 - filtres par statut
 - filtres par source
 - recherche par nom ou email

Cliquer sur une ligne ouvre la fiche lead.

⸻

# Lead Detail

Page affichant les détails d’un lead.

Sections :

Informations
 - prénom
 - nom
 - email
 - téléphone
 - expérience
 - message

Source marketing
 - source
 - utm_source
 - utm_medium
 - utm_campaign
 - referrer

Suivi commercial

Champs éditables :
 - statut
 - date prochaine action
 - notes

⸻

# Leads à rappeler

Page affichant uniquement les leads :
next_action_date <= today
status != converted
status != lost

Cette page doit servir de liste de travail quotidienne.

⸻

# Pipeline de statuts

Les statuts possibles sont :
 - new
 - to_call
 - contacted
 - trial_scheduled
 - trial_done
 - converted
 - lost

Le statut doit pouvoir être changé rapidement depuis :
 - la liste
 - la fiche lead

⸻

# Historique des actions

Dans la fiche lead afficher une timeline :
 - lead créé
 - statut changé
 - note ajoutée

⸻

# UX importante

Le CRM doit être orienté rapidité.

Les actions les plus fréquentes doivent être faciles :
 - appeler le lead
 - changer le statut
 - planifier un rappel
 - ajouter une note

⸻

# Appels API

L’application doit utiliser les endpoints existants :

GET /v1/leads
GET /v1/leads/{id}
PATCH /v1/leads/{id}

Si disponible :

GET /v1/leads/to-call

⸻

# Composants UI attendus

Créer des composants réutilisables :
 - LeadTable
 - LeadStatusBadge
 - LeadFilters
 - LeadTimeline
 - LeadNotes
 - LeadForm

⸻

# Objectif final

Obtenir une application CRM simple permettant aux fondateurs de CrossFit Avignon de gérer les leads entrants et d’optimiser la conversion.

⸻

# Bonus

Ajouter :
 - vue Kanban par statut
 - indicateurs de conversion par source
 - mise en évidence des leads récents
 - badge “à rappeler aujourd’hui”
