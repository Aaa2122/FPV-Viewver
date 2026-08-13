# FPV Studio

FPV Studio is an interactive 3D workspace for exploring and documenting an FPV drone. Inspect the built-in assembly, attach component pins to the model, edit technical details, and save or share the project as JSON.

## Features

- Interactive 3D navigation with orbit, zoom, camera reset, and animated focus
- View and Edit modes for safe inspection and authoring
- Component pins placed directly on the model
- Editable component names, descriptions, positions, and specifications
- 3D transform controls for repositioning existing pins
- Searchable scene inventory and contextual component inspector
- Animated exploded view for the built-in nine-part drone assembly
- Local `.glb` and `.gltf` model loading
- Automatic project persistence in the browser
- Validated JSON project import and export
- Responsive desktop and mobile interface
- Lazy-loaded 3D workspace with visible loading and error states
- Demand-based rendering and an optimized production model

## Screenshots

![Exploded view of the FPV drone](./docs/screenshots/overview.png)

![Assembled drone in View mode](./docs/screenshots/view.png)

![Component inspector](./docs/screenshots/components.png)

![Pin editing with 3D transform controls](./docs/screenshots/edit.png)

## Getting started

Requirements:

- Node.js 18 or later
- npm

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in a modern browser.

## Using the editor

1. Explore the included FPV drone or choose **Open model** to load a local `.glb` or `.gltf` file.
2. Switch to **Edit** mode.
3. Select **Add pin**, then click a point on the model.
4. Enter the component name, description, coordinates, and specifications in the inspector.
5. Use the Select tool and the 3D gizmo to reposition a pin when needed.
6. Return to **View** mode to inspect the finished scene.
7. Choose **Export** to download a portable JSON copy of the project.

Projects are autosaved to browser storage. Imported projects reference the model by file name; if a project uses a custom model, reopen that model file after importing or restoring the project.

> The exploded view is tailored to the named groups in the bundled FPV model and is not automatically available for imported models.

## Keyboard shortcuts

| Shortcut | Action | Availability |
| --- | --- | --- |
| `V` | Select tool | Edit mode |
| `A` | Add pin tool | Edit mode |
| `H` | Hand/navigation tool | Edit mode |
| `Delete` | Delete the selected component | Edit mode |
| `Ctrl/Cmd + C` | Copy the selected component | Edit mode |
| `Ctrl/Cmd + V` | Paste the copied component | Edit mode |
| `E` | Explode or reassemble the built-in drone | View mode |
| `R` | Reset the camera | View mode |
| `Escape` | Clear the selection and return to Select | Any mode |

Edit-only shortcuts are disabled in View mode to prevent accidental changes.

## Production build

```bash
npm run build
npm run preview
```

The production model is approximately 2.25 MiB, down from the original 29 MiB asset. The viewer also uses a fixed device pixel ratio and renders on demand to reduce idle GPU work.

## Tech stack

- React 18
- Vite 5
- Three.js
- React Three Fiber
- Drei
- Tailwind CSS/PostCSS tooling

## Project structure

```text
src/
  components/        UI and 3D viewer components
  utils/             Project schema and validation
  App.jsx            Application state and project actions
  index.css          Application styles
public/              Optimized model and static assets
docs/screenshots/    README screenshots
```
