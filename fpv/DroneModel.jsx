import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// Composant Hotspot - Style ultra-minimaliste 2D
const Hotspot = ({ position, isSelected, isVisible, onSelect, label }) => {
    const [hovered, setHovered] = useState(false);

    // Si invisible, on rend quand même avec opacité 0 pour les interactions, ou on affiche toujours
    // if (!isVisible && !isSelected && !hovered) return null;

    return (
        <group position={position}>
            <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
                <div
                    className="relative flex items-center justify-center cursor-pointer pointer-events-auto"
                    onMouseEnter={() => {
                        setHovered(true);
                        document.body.style.cursor = 'pointer';
                    }}
                    onMouseLeave={() => {
                        setHovered(false);
                        document.body.style.cursor = 'default';
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                >
                    {/* Cercle externe (anneau vide) */}
                    <div
                        className={`absolute rounded-full border border-white transition-all duration-300 ${isSelected ? 'w-8 h-8 opacity-100 border-green-500' :
                            hovered ? 'w-8 h-8 opacity-100' : 'w-6 h-6 opacity-60'
                            }`}
                        style={{ borderWidth: '1px' }}
                    />

                    {/* Point central blanc */}
                    <div
                        className={`rounded-full bg-white transition-all duration-300 ${isSelected ? 'w-2 h-2 bg-green-500' : 'w-1.5 h-1.5'
                            }`}
                    />

                    {/* Label au survol */}
                    {(hovered || isSelected) && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded text-white text-[10px] whitespace-nowrap tracking-wider font-light">
                            {label}
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
};


const DroneModel = ({ selectedComponent, onComponentSelect, onCloseComponent, cameraRef, controlsRef }) => {
    const groupRef = useRef();
    const [isDroneHovered, setIsDroneHovered] = useState(false);
    const { camera } = useThree();

    // État pour savoir si on anime la caméra
    const [isAnimatingCamera, setIsAnimatingCamera] = useState(false);
    const animationProgress = useRef(0);

    // ============================================================
    // CONFIGURATION DES COMPOSANTS - Positions en espace local (avant scale 3.5)
    // Vue du dessus du drone :
    //
    //        AVANT (Camera)
    //     Motor1 [+X,+Z]    Motor2 [-X,+Z]
    //            \            /
    //             \    FC    /
    //              \   |    /
    //               \  |   /
    //     Motor3 [+X,-Z]    Motor4 [-X,-Z]
    //        ARRIERE (Battery)
    //
    // ============================================================



    // Position cible de la caméra
    const targetCameraPos = useRef(null);
    const targetLookAt = useRef(null);

    const { scene } = useGLTF('/fpv.glb');

    // Clone et configure le modèle avec références aux matériaux
    const { clonedScene, meshesWithMaterials } = useMemo(() => {
        const clone = scene.clone();
        const meshes = [];
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.envMapIntensity = 2;
                    // Stocker l'opacité originale
                    child.userData.originalOpacity = child.material.opacity || 1;
                    meshes.push(child);
                }
            }
        });
        return { clonedScene: clone, meshesWithMaterials: meshes };
    }, [scene]);

    // Position par défaut de la caméra (Vue de face/gauche pour l'intro)
    const defaultCameraPos = useMemo(() => new THREE.Vector3(-4, 2.5, -4), []);
    const defaultLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    // Positions de caméra optimisées pour chaque composant (coordonnées world)
    const cameraPositions = useMemo(() => ({
        // Caméra face à l'objectif
        'fpv-camera': {
            position: [0, 0.5, -2],     // Devant la caméra
            target: [0, 0.15, -0.6]     // Regarde l'objectif
        },
        // Moteur avant-gauche (vue diagonale haute)
        'motor-1': {
            position: [-1.8, 1.2, -1.5],
            target: [-0.75, 0.18, -0.58]
        },
        // Moteur avant-droit
        'motor-2': {
            position: [1.8, 1.2, -1.5],
            target: [0.74, 0.18, -0.58]
        },
        // Moteur arrière-gauche
        'motor-3': {
            position: [-1.8, 1.2, 1.5],
            target: [-0.73, 0.18, 0.57]
        },
        // Moteur arrière-droit
        'motor-4': {
            position: [1.8, 1.2, 1.5],
            target: [0.75, 0.18, 0.58]
        },
        // FC (vue de dessus)
        'fc': {
            position: [-1.5, 1.5, 0.5],
            target: [0, 0.16, 0]
        },
        // Batterie (vue de côté/dessus)
        'battery': {
            position: [1.5, 1.5, 1.5],
            target: [0, 0.44, 0]
        }
    }), []);

    // NOTE: L'effet de caméra est défini plus bas, après dynamicCameraPositions

    // ============================================================
    // DONNÉES DES COMPOSANTS
    // Positions des hotspots en espace local (AVANT le scale 8)
    // Ces positions doivent correspondre exactement à l'emplacement 
    // des composants sur le modèle 3D fpv.glb
    // ============================================================
    const components = useMemo(() => [
        // --- CAMÉRA FPV (avant du drone, Z négatif = avant) ---
        {
            id: 'fpv-camera',
            position: [0.0056, 0.152, -0.6008],   // Position × 8 (Mesh_Camera)
            label: 'Caméra FPV',
            title: 'CAMÉRA FPV',
            description: 'Objectif grand angle 150° avec transmission vidéo numérique DJI O3. Latence ultra-basse (<10ms) pour une immersion totale en vol.',
            color: '#a855f7',                     // Violet
            specs: {
                'Résolution': '1200TVL',
                'Latence': '<10ms',
                'FOV': '150°',
                'WDR': 'Actif'
            }
        },
        // --- MOTEUR 1 : Avant-Gauche (Front-Left) ---
        {
            id: 'motor-1',
            position: [-0.7472, 0.1808, -0.5864], // Position × 8 (Mesh_Motor_FL)
            label: 'Moteur 1 (AVG)',
            title: 'MOTEUR 1 - AVG',
            description: 'Moteur brushless XING2 2207 1950KV. Position Avant-Gauche. Rotation horaire (CW).',
            color: '#3b82f6',                     // Bleu
            specs: {
                'Position': 'Avant-Gauche',
                'Rotation': 'CW',
                'KV': '1950',
                'Thrust': '1.8kg'
            }
        },
        // --- MOTEUR 2 : Avant-Droit (Front-Right) ---
        {
            id: 'motor-2',
            position: [0.7408, 0.1776, -0.5856],  // Position × 8 (Mesh_Motor_FR)
            label: 'Moteur 2 (AVD)',
            title: 'MOTEUR 2 - AVD',
            description: 'Moteur brushless XING2 2207 1950KV. Position Avant-Droit. Rotation anti-horaire (CCW).',
            color: '#06b6d4',                     // Cyan
            specs: {
                'Position': 'Avant-Droit',
                'Rotation': 'CCW',
                'KV': '1950',
                'Thrust': '1.8kg'
            }
        },
        // --- MOTEUR 3 : Arrière-Gauche (Back-Left) ---
        {
            id: 'motor-3',
            position: [-0.7352, 0.1808, 0.5752],  // Position × 8 (Mesh_Motor_BL)
            label: 'Moteur 3 (ARG)',
            title: 'MOTEUR 3 - ARG',
            description: 'Moteur brushless XING2 2207 1950KV. Position Arrière-Gauche. Rotation anti-horaire (CCW).',
            color: '#22c55e',                     // Vert
            specs: {
                'Position': 'Arrière-Gauche',
                'Rotation': 'CCW',
                'KV': '1950',
                'Thrust': '1.8kg'
            }
        },
        // --- MOTEUR 4 : Arrière-Droit (Back-Right) ---
        {
            id: 'motor-4',
            position: [0.7488, 0.1808, 0.5808],   // Position × 8 (Mesh_Motor_BR)
            label: 'Moteur 4 (ARD)',
            title: 'MOTEUR 4 - ARD',
            description: 'Moteur brushless XING2 2207 1950KV. Position Arrière-Droit. Rotation horaire (CW).',
            color: '#f59e0b',                     // Orange
            specs: {
                'Position': 'Arrière-Droit',
                'Rotation': 'CW',
                'KV': '1950',
                'Thrust': '1.8kg'
            }
        },
        // --- FLIGHT CONTROLLER (centre) ---
        {
            id: 'fc',
            position: [-0.0032, 0.164, -0.0016],  // Position × 8 (Mesh_FC)
            label: 'Flight Controller',
            title: 'FLIGHT CONTROLLER',
            description: 'FC SpeedyBee F7 V3 avec gyroscope MPU6000. ESC 55A 4-in-1 BLHeli_32 intégré. Cœur du système de contrôle.',
            color: '#ec4899',                     // Rose
            specs: {
                'CPU': 'STM32F722',
                'Gyro': 'MPU6000',
                'Loop': '8kHz',
                'ESC': '55A'
            }
        },
        // --- BATTERIE (sur le dessus) ---
        {
            id: 'battery',
            position: [0.0088, 0.4376, 0.0312],   // Position × 8 (Mesh_Battery)
            label: 'Batterie 6S',
            title: 'BATTERIE 6S',
            description: 'LiPo CNHL Black Series 1300mAh 6S 120C. Haute densité énergétique pour freestyle agressif.',
            color: '#ef4444',                     // Rouge
            specs: {
                'Capacité': '1300mAh',
                'Voltage': '22.2V',
                'C-Rate': '120C',
                'Poids': '185g'
            }
        }
    ], []);

    // ============================================================
    // SYSTÈME DE REPÉRAGE AUTOMATIQUE DES COMPOSANTS
    // ============================================================
    const [positions, setPositions] = useState({});
    const [foundObjects, setFoundObjects] = useState({});

    // Mapping entre nos IDs et les noms possibles dans le fichier GLB
    // Basé sur l'analyse du fichier fpv.glb - On utilise les Mesh_ car ils ont les vraies positions
    const nodeMapping = useMemo(() => ({
        'motor-1': ['Mesh_Motor_FL', 'Motor_FL'],              // Front-Left (Avant-Gauche)
        'motor-2': ['Mesh_Motor_FR', 'Motor_FR'],              // Front-Right (Avant-Droit)
        'motor-3': ['Mesh_Motor_BL', 'Motor_BL'],              // Back-Left (Arrière-Gauche)
        'motor-4': ['Mesh_Motor_BR', 'Motor_BR'],              // Back-Right (Arrière-Droit)
        'battery': ['Mesh_Battery', 'Battery'],                // Batterie
        'fpv-camera': ['Mesh_Camera', 'Camera', 'Camera_FPV'], // Caméra FPV
        'fc': ['Mesh_FC', 'Frame'],                            // Flight Controller
    }), []);

    // Effet pour initialiser les positions (utilise les positions manuelles)
    // L'auto-détection est désactivée car le scale du Primitive n'est pas appliqué au moment du scan
    useEffect(() => {
        if (!clonedScene) return;

        const newPositions = {};

        console.log('=== Initialisation des positions des hotspots ===');

        components.forEach(comp => {
            // Utiliser directement les positions manuelles précalculées (× 8)
            newPositions[comp.id] = comp.position;
            console.log(`📍 [${comp.id}] Position: [${comp.position.map(n => n.toFixed(3)).join(', ')}]`);
        });

        console.log('=== Positions initialisées ===');

        setPositions(newPositions);

    }, [clonedScene, components]);

    // Générer les positions de caméra dynamiquement basées sur les positions trouvées
    // const dynamicCameraPositions = useMemo(() => {
    //     const camPositions = {};

    //     components.forEach(comp => {
    //         const pos = positions[comp.id] || comp.position;

    //         // Calculer une position de caméra relative à la position du composant
    //         // La caméra se place à une certaine distance avec un angle approprié
    //         const offsetDistance = 1.2;
    //         const heightOffset = 0.8;

    //         // Direction depuis le centre vers le composant (pour positionner la caméra)
    //         const dir = new THREE.Vector3(pos[0], 0, pos[2]).normalize();

    //         // Si le composant est au centre (FC), on met la caméra sur le côté
    //         if (Math.abs(pos[0]) < 0.1 && Math.abs(pos[2]) < 0.1) {
    //             dir.set(1, 0, 0.5).normalize();
    //         }

    //         camPositions[comp.id] = {
    //             position: [
    //                 pos[0] + dir.x * offsetDistance,
    //                 pos[1] + heightOffset,
    //                 pos[2] + dir.z * offsetDistance
    //             ],
    //             target: pos
    //         };
    //     });

    //     return camPositions;
    // }, [positions, components]);

    // Démarrer l'animation de caméra quand un composant est sélectionné/désélectionné
    useEffect(() => {
        if (selectedComponent) {
            // Utiliser la position définie manuellement
            const camPos = cameraPositions[selectedComponent.id];

            if (camPos) {
                targetCameraPos.current = new THREE.Vector3(...camPos.position);
                targetLookAt.current = new THREE.Vector3(...camPos.target);
                setIsAnimatingCamera(true);
                animationProgress.current = 0;
            }
        } else {
            // Dézoom : retour à la position par défaut
            targetCameraPos.current = defaultCameraPos.clone();
            targetLookAt.current = defaultLookAt.clone();
            setIsAnimatingCamera(true);
            animationProgress.current = 0;
        }
    }, [selectedComponent, cameraPositions, defaultCameraPos, defaultLookAt]);

    // Identification des meshes de moteurs pour l'animation
    const motorMeshes = useMemo(() => {
        return meshesWithMaterials.filter(mesh =>
            // On cherche les parties rotatives (cloches moteurs / hélices)
            (mesh.name.includes('Motor') || mesh.name.includes('Prop')) &&
            !mesh.name.includes('Base') && // Exclure les bases fixes si nommées ainsi
            !mesh.name.includes('Wire')    // Exclure les fils
        );
    }, [meshesWithMaterials]);

    // Animation fluide
    useFrame((state, delta) => {
        // 1. Animation flottante du drone
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            groupRef.current.position.y = (Math.sin(t * 0.5) * 0.1) + (Math.sin(t * 1.5) * 0.02);
            groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.02;
            groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.02;
        }

        // 2. Animation de la caméra
        if (isAnimatingCamera && cameraRef.current) {
            animationProgress.current += delta * 1.5;

            if (animationProgress.current >= 1) {
                animationProgress.current = 1;
                setIsAnimatingCamera(false);
            }

            // Interpolation fluide
            cameraRef.current.position.lerp(targetCameraPos.current, delta * 4);

            if (controlsRef.current) {
                controlsRef.current.target.lerp(targetLookAt.current, delta * 4);
                controlsRef.current.update();
            } else {
                cameraRef.current.lookAt(targetLookAt.current);
            }
        }

        // 3. Animation opacité des meshes
        meshesWithMaterials.forEach((mesh) => {
            if (!mesh.material) return;

            let targetOpacity = mesh.userData.originalOpacity || 1;

            if (selectedComponent) {
                const compPosition = positions[selectedComponent.id] || selectedComponent.position;
                const compPos = new THREE.Vector3(...compPosition);
                const meshPos = new THREE.Vector3();
                mesh.getWorldPosition(meshPos);
                const distance = meshPos.distanceTo(compPos);

                if (distance > 1.5) {
                    targetOpacity = 0.12;
                    mesh.material.transparent = true;
                }
            }

            const diff = Math.abs(mesh.material.opacity - targetOpacity);
            if (diff > 0.01) {
                mesh.material.opacity = THREE.MathUtils.lerp(
                    mesh.material.opacity,
                    targetOpacity,
                    delta * 6
                );
            } else {
                mesh.material.opacity = targetOpacity;
            }

            if (mesh.material.opacity > 0.98 && !selectedComponent) {
                mesh.material.transparent = false;
                mesh.material.opacity = mesh.userData.originalOpacity || 1;
            }
        });

        // 4. Animation des hélices (Arming au survol)
        // 4. Animation des hélices (Arming au survol)
        // Gestion de l'inertie (Spool up / Spool down)
        // Si un composant est sélectionné, on arrête les hélices pour inspecter les détails sans mouvement parasite
        const shouldSpin = isDroneHovered && !selectedComponent;

        // Vitesse très lente et esthétique (Slow Motion) pour éviter l'effet stroboscopique/rollback
        const targetSpeed = shouldSpin ? 4 : 0;

        // Accélération / Décélération fluide
        if (!groupRef.current.userData.propSpeed) groupRef.current.userData.propSpeed = 0;

        groupRef.current.userData.propSpeed = THREE.MathUtils.lerp(
            groupRef.current.userData.propSpeed,
            targetSpeed,
            delta * 2
        );

        const currentSpeed = groupRef.current.userData.propSpeed;

        if (currentSpeed > 0.01) {
            motorMeshes.forEach((mesh, i) => {
                const direction = i % 2 === 0 ? 1 : -1;
                mesh.rotation.z += currentSpeed * delta * direction;
            });
        }
    });

    // Configuration des OrbitControls
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.enableDamping = true;
            controlsRef.current.dampingFactor = 0.05;
            controlsRef.current.minDistance = 2;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.maxPolarAngle = Math.PI / 1.6; // Empêche de passer sous le sol
            controlsRef.current.minPolarAngle = 0.1;
            controlsRef.current.enablePan = false;
            controlsRef.current.autoRotate = false; // DÉSACTIVÉ
        }
    }, [controlsRef]);

    const handleComponentClick = useCallback((component) => {
        if (selectedComponent?.id === component.id) {
            onCloseComponent();
        } else {
            onComponentSelect(component);
        }
    }, [selectedComponent, onComponentSelect, onCloseComponent]);

    const handleBackgroundPointerDown = useCallback((e) => {
        if (selectedComponent) {
            onCloseComponent();
        }
    }, [selectedComponent, onCloseComponent]);

    return (
        <group
            ref={groupRef}
            onPointerDown={handleBackgroundPointerDown}
            onPointerOver={() => setIsDroneHovered(true)}
            onPointerOut={() => setIsDroneHovered(false)}
        >
            <primitive
                object={clonedScene}
                scale={8}
                position={[0, 0, 0]}
            />

            {/* Hotspots - utilisent les positions scalées (x8) définies dans components */}
            {components.map((comp) => (
                <Hotspot
                    key={comp.id}
                    position={comp.position}
                    isSelected={selectedComponent?.id === comp.id}
                    isVisible={isDroneHovered || selectedComponent !== null}
                    onSelect={() => handleComponentClick(comp)}
                    label={comp.label}
                />
            ))}
        </group>
    );
};

useGLTF.preload('/fpv.glb');

export default DroneModel;
