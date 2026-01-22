# FPV Viewer 🚁

An interactive 3D web application for exploring FPV (First-Person View) racing drone components with detailed annotations, exploded view, and real-time 3D visualization.

![FPV Viewer](https://img.shields.io/badge/FPV-Viewer-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

- **🎮 Interactive 3D Viewer**: Explore the drone from any angle with smooth OrbitControls
- **🔍 Component Annotations**: Click on hotspots to view detailed information about each component
- **📊 Technical Specifications**: View comprehensive specs for motors, FC, camera, battery, and more
- **🌓 Dark/Light Mode**: Seamless theme switching with smooth transitions
- **🌍 Bilingual Support**: Full French and English translations
- **💫 Advanced Animations**:
  - Floating drone animation
  - Propeller rotation on hover
  - Camera zoom and focus on selected components
  - Transparency effects for component isolation
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Optimized Performance**: Built with Vite for lightning-fast development and production builds

## 🛠️ Technologies

- **React 18** - Modern React with hooks
- **Three.js + React Three Fiber** - 3D rendering engine
- **@react-three/drei** - Useful helpers for R3F
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
cd fpv-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
fpv-viewer/
├── public/
│   └── fpv.glb              # 3D drone model
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Header.jsx   # App header with controls
│   │   │   ├── Controls.jsx # Instructions panel
│   │   │   └── FadeIn.jsx   # Animation wrapper
│   │   ├── DroneModel.jsx      # 3D drone with hotspots
│   │   ├── DroneViewer3D.jsx   # Three.js canvas setup
│   │   └── ComponentModal.jsx  # Component details modal
│   ├── data/
│   │   └── fpvData.js       # Drone specifications and translations
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + Tailwind
├── index.html               # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Usage

### Basic Interaction

1. **Rotate**: Left-click and drag to rotate the view
2. **Zoom**: Use mouse wheel to zoom in/out
3. **Select Component**: Click on white hotspots to see component details
4. **Hover**: Hover over the drone to see propeller animation
5. **Reset View**: Click the reset button to return to default view

### Features

- **Dark Mode**: Toggle between dark and light themes using the sun/moon button
- **Language**: Switch between French (FR) and English (EN) using the language button
- **Component Details**: Click on any hotspot to view:
  - Component name and description
  - Technical specifications
  - Key features

## 🎨 Customization

### Add New Components

Edit `src/data/fpvData.js` to add new components or modify existing ones:

```javascript
{
  id: 'component-id',
  position: [x, y, z],  // 3D position
  label: 'Component Name',
  title: 'COMPONENT TITLE',
  description: 'Description...',
  color: '#hexcolor',
  specs: {
    'Spec 1': 'Value 1',
    'Spec 2': 'Value 2'
  }
}
```

### Modify Camera Positions

Update camera positions in `src/components/DroneModel.jsx` in the `cameraPositions` object.

### Change Theme Colors

Edit `tailwind.config.js` to customize the color palette.

## 🐛 Known Issues

- Large 3D model file size (30MB) - consider compression for production
- Initial load time depends on network speed for the GLB file

## 🔮 Future Enhancements

- [ ] Add exploded view toggle
- [ ] Implement progressive GLB loading
- [ ] Add more drone builds/configurations
- [ ] Include flight video integration
- [ ] Add AR view for mobile devices
- [ ] Implement component comparison tool

## 📄 License

MIT License - feel free to use this project for learning or personal projects.

## 🙏 Credits

- 3D Model: Custom FPV drone design
- Built with ❤️ using React, Three.js, and Vite

---

**Enjoy exploring the FPV drone! 🚁✨**
