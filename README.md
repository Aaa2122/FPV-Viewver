# FPV 3D Model Pin Editor

A web app to upload a drone 3D model, place component pins directly on the model, and display technical info when pins are clicked.

## Core Features

- Upload and view `.glb` / `.gltf` models
- Edit mode:
  - Click model surface to create pins
  - Drag selected pin in 3D (TransformControls)
  - Edit component name, description, specs, and XYZ coordinates
- Viewer mode:
  - Click a pin to open its info card
- Local persistence:
  - Autosave project in browser localStorage
  - Import / export project JSON

## Tech Stack

- React + Vite
- Three.js + React Three Fiber + Drei
- Tailwind CSS

## Run

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Project JSON Schema (v1)

```json
{
  "version": 1,
  "meta": {
    "name": "My Drone Project",
    "createdAt": "2026-03-28T12:00:00.000Z",
    "updatedAt": "2026-03-28T12:10:00.000Z"
  },
  "model": {
    "fileName": "my-drone.glb",
    "mimeType": "model/gltf-binary"
  },
  "components": [
    {
      "id": "component-1",
      "name": "Flight Controller",
      "description": "Main FC board",
      "specs": [
        { "key": "MCU", "value": "STM32F722" },
        { "key": "Gyro", "value": "MPU6000" }
      ],
      "position": [0.0, 0.15, 0.02]
    }
  ]
}
```

## Notes

- Imported JSON restores metadata and pins.
- If JSON references a custom model file not currently uploaded, the app loads the default model and asks for re-upload.
- `.gltf` support assumes self-contained/resolvable assets.
