# FPV Viewer

Visualiseur 3D interactif de drone FPV. Placez des points sur les composants, consultez leurs fiches techniques, et naviguez autour du modele.

## Apercu

![Mode vue avec fiche composant](./docs/screenshots/view.png)

![Mode edition avec toolbar et gizmo](./docs/screenshots/edit.png)

![Vue generale sans selection](./docs/screenshots/overview.png)

## Fonctionnalites

- **Visualisation 3D** : chargez un modele `.glb` / `.gltf` et naviguez autour avec orbit, zoom et rotation
- **Fiches composants** : cliquez sur un point pour afficher une fiche avec specs, metriques et description
- **Fleche de liaison** : connecteur visuel entre la fiche et le point sur le modele
- **Mode Edit** : placez, deplacez et supprimez des points avec une toolbar dediee
- **Outils** : Hand (navigation), Select (selection/deplacement), Add (ajout de point), Delete
- **Raccourcis clavier** : `Del` supprimer, `Ctrl+C/V` copier/coller, `Escape` deselectionner, `V/A/H` changer d'outil
- **Points interactifs** : visibles au hover en mode vue, toujours visibles en mode edit avec labels
- **Sauvegarde auto** : projet persiste dans le navigateur
- **Import/Export** : projet complet en JSON

## Workflow

1. Chargez votre modele avec **Upload Model**
2. Passez en **Edit** pour placer les points sur les composants
3. Utilisez l'outil **Add** (+) pour cliquer sur le modele et ajouter un point
4. Selectionnez un point avec **Select** pour le deplacer avec le gizmo 3D
5. Completez nom, description et specs dans le panneau d'edition
6. Passez en **View** pour voir le rendu final avec les fiches
7. Exportez avec **Export Project**

## Raccourcis

| Touche | Action |
|--------|--------|
| `V` | Outil Select |
| `A` | Outil Add |
| `H` | Outil Hand |
| `Delete` | Supprimer le composant selectionne |
| `Ctrl+C` | Copier |
| `Ctrl+V` | Coller |
| `Escape` | Deselectionner |

## Demarrage

```bash
npm install
npm run dev
```

## Stack

React + Vite + Three.js (React Three Fiber / Drei). Donnees projet stockees localement et transportables via JSON.
