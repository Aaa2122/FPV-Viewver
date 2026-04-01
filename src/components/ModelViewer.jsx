import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    ContactShadows,
    Environment,
    Grid,
    Html,
    OrbitControls,
    PerspectiveCamera,
    TransformControls,
    useGLTF
} from '@react-three/drei';
import { Box3, Color, MathUtils, Sphere, Vector3 } from 'three';

const roundPosition = (point) => [
    Number(point.x.toFixed(4)),
    Number(point.y.toFixed(4)),
    Number(point.z.toFixed(4))
];

const ScreenPositionTracker = ({ position, onChange }) => {
    const { camera, size } = useThree();
    const vecRef = useRef(new Vector3());
    const prevRef = useRef(null);

    useFrame(() => {
        if (!position) {
            if (prevRef.current) {
                prevRef.current = null;
                onChange(null);
            }
            return;
        }
        vecRef.current.set(position[0], position[1], position[2]);
        vecRef.current.project(camera);
        const x = (vecRef.current.x * 0.5 + 0.5) * size.width;
        const y = (-vecRef.current.y * 0.5 + 0.5) * size.height;
        const prev = prevRef.current;
        if (!prev || Math.abs(x - prev.x) > 0.5 || Math.abs(y - prev.y) > 0.5) {
            prevRef.current = { x, y };
            onChange({ x, y });
        }
    });

    return null;
};

const PinHotspot = ({ component, selected, onSelect, editMode, editTool }) => {
    const noInteract = (editMode && selected) || (editMode && editTool === 'hand');
    return (
        <group position={component.position}>
            <Html center zIndexRange={[100, 0]} style={noInteract ? { pointerEvents: 'none' } : undefined}>
                <button
                    type="button"
                    className={`pin-marker ${selected ? 'selected' : ''} ${editMode ? 'edit-mode' : ''}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelect(component.id);
                    }}
                >
                    <span className="pin-dot" />
                    <span className="pin-label">{component.name}</span>
                </button>
            </Html>
        </group>
    );
};

const SceneContents = ({
    modelUrl,
    modelFileName,
    editMode,
    editTool,
    components,
    selectedComponentId,
    orbitEnabled,
    onSelectComponent,
    onAddComponent,
    onMoveComponent,
    onTransformDragging,
    onPinScreenPosition
}) => {
    const { camera } = useThree();
    const controlsRef = useRef(null);
    const dragTargetRef = useRef(null);
    const targetCameraPosRef = useRef(new Vector3(-4, 2.5, -4));
    const targetLookAtRef = useRef(new Vector3(0, 0, 0));
    const isCameraAutoAnimatingRef = useRef(false);
    const isTransformInteractingRef = useRef(false);
    const { scene } = useGLTF(modelUrl);

    const isDefaultModel = modelFileName === 'fpv.glb';
    const shouldAutoFocusInView = isDefaultModel && !editMode;

    const modelData = useMemo(() => {
        const clone = scene.clone(true);

        clone.traverse((child) => {
            if (!child.isMesh) {
                return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            if (!child.material) {
                return;
            }

            child.material = child.material.clone();
            const meshName = child.name?.toLowerCase() || '';

            if (meshName.includes('prop')) {
                child.material.color = new Color('#f58cdd');
                if ('emissive' in child.material) {
                    child.material.emissive = new Color('#f58cdd');
                    child.material.emissiveIntensity = 0.18;
                }
                return;
            }

            if ('color' in child.material && child.material.color) {
                child.material.color.multiplyScalar(0.66);
            }
        });

        const box = new Box3().setFromObject(clone);
        const center = new Vector3();
        const sphere = new Sphere();

        if (box.isEmpty()) {
            return {
                model: clone,
                center: new Vector3(0, 0, 0),
                radius: 1.2,
                modelScale: 1,
                floorY: -0.01,
                shadowScale: 7,
                shadowFar: 6,
                fogNear: 6,
                fogFar: 20,
                controlSize: 0.65
            };
        }

        box.getCenter(center);
        box.getBoundingSphere(sphere);

        const baseRadius = Math.max(sphere.radius, 0.001);
        const modelScale = isDefaultModel
            ? 8
            : MathUtils.clamp(1.1 / baseRadius, 0.15, 180);

        const scaledCenter = center.clone().multiplyScalar(modelScale);
        const radius = baseRadius * modelScale;

        return {
            model: clone,
            center: scaledCenter,
            radius,
            modelScale,
            floorY: box.min.y * modelScale - 0.01,
            shadowScale: Math.max(radius * 6.8, 3),
            shadowFar: Math.max(radius * 5.5, 3),
            fogNear: Math.max(radius * 4.2, 2),
            fogFar: Math.max(radius * 23, 14),
            controlSize: MathUtils.clamp(radius * 0.55, 0.42, 1.7)
        };
    }, [isDefaultModel, scene]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        if (isDefaultModel) {
            camera.position.set(-4, 2.5, -4);
            camera.near = 0.05;
            camera.far = 60;
            camera.updateProjectionMatrix();

            controls.target.set(0, 0, 0);
            controls.minDistance = 2;
            controls.maxDistance = 10;
            controls.update();
            targetCameraPosRef.current.set(-4, 2.5, -4);
            targetLookAtRef.current.set(0, 0, 0);
            isCameraAutoAnimatingRef.current = false;
            return;
        }

        const { center, radius } = modelData;
        const fov = (camera.fov * Math.PI) / 180;
        const fitDistance = radius / Math.tan(fov / 2);
        const distance = MathUtils.clamp(fitDistance * 0.88, 0.35, 16);

        camera.position.set(
            center.x + distance * 0.9,
            center.y + distance * 0.6,
            center.z + distance * 0.92
        );
        camera.near = Math.max(distance / 220, 0.01);
        camera.far = Math.max(distance * 55, 24);
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.minDistance = Math.max(radius * 0.4, 0.2);
        controls.maxDistance = Math.max(radius * 8, 1.4);
        controls.update();
    }, [camera, isDefaultModel, modelData, modelUrl]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        controls.enabled = orbitEnabled && !isTransformInteractingRef.current;
    }, [orbitEnabled]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        const stopAutoAnimation = () => {
            isCameraAutoAnimatingRef.current = false;
        };

        controls.addEventListener('start', stopAutoAnimation);
        return () => controls.removeEventListener('start', stopAutoAnimation);
    }, []);

    const selectedComponent = components.find((component) => component.id === selectedComponentId) || null;

    useEffect(() => {
        if (dragTargetRef.current && selectedComponent) {
            dragTargetRef.current.position.set(...selectedComponent.position);
        }
    }, [selectedComponent?.id]);

    const defaultFocusMap = useMemo(
        () => ({
            'fpv-camera': {
                position: [0, 0.5, -2],
                target: [0, 0.15, -0.6]
            },
            'motor-1': {
                position: [-1.8, 1.2, -1.5],
                target: [-0.75, 0.18, -0.58]
            },
            'motor-2': {
                position: [1.8, 1.2, -1.5],
                target: [0.74, 0.18, -0.58]
            },
            'motor-3': {
                position: [-1.8, 1.2, 1.5],
                target: [-0.73, 0.18, 0.57]
            },
            'motor-4': {
                position: [1.8, 1.2, 1.5],
                target: [0.75, 0.18, 0.58]
            },
            fc: {
                position: [-1.5, 1.5, 0.5],
                target: [0, 0.16, 0]
            },
            battery: {
                position: [1.5, 1.5, 1.5],
                target: [0, 0.44, 0]
            }
        }),
        []
    );

    const handleModelPointerDown = (event) => {
        if (!editMode || editTool !== 'add') {
            return;
        }

        event.stopPropagation();
        onAddComponent(roundPosition(event.point));
    };

    useEffect(() => {
        if (!isDefaultModel) {
            return;
        }

        if (!shouldAutoFocusInView) {
            isCameraAutoAnimatingRef.current = false;
            return;
        }

        if (!selectedComponent) {
            targetCameraPosRef.current.set(-4, 2.5, -4);
            targetLookAtRef.current.set(0, 0, 0);
            isCameraAutoAnimatingRef.current = true;
            return;
        }

        const mappedTarget = defaultFocusMap[selectedComponent.id];
        if (mappedTarget) {
            targetCameraPosRef.current.set(...mappedTarget.position);
            targetLookAtRef.current.set(...mappedTarget.target);
            isCameraAutoAnimatingRef.current = true;
            return;
        }

        const [x = 0, y = 0, z = 0] = selectedComponent.position;
        targetLookAtRef.current.set(x, y, z);
        targetCameraPosRef.current.set(x + 1.6, y + 1.1, z + 1.5);
        isCameraAutoAnimatingRef.current = true;
    }, [defaultFocusMap, isDefaultModel, selectedComponent, shouldAutoFocusInView]);

    useFrame((_, delta) => {
        if (!shouldAutoFocusInView || !isCameraAutoAnimatingRef.current) {
            return;
        }

        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        camera.position.lerp(targetCameraPosRef.current, MathUtils.clamp(delta * 4.2, 0, 1));
        controls.target.lerp(targetLookAtRef.current, MathUtils.clamp(delta * 4.2, 0, 1));
        controls.update();

        const cameraSettled = camera.position.distanceToSquared(targetCameraPosRef.current) < 0.0002;
        const targetSettled = controls.target.distanceToSquared(targetLookAtRef.current) < 0.0002;

        if (cameraSettled && targetSettled) {
            camera.position.copy(targetCameraPosRef.current);
            controls.target.copy(targetLookAtRef.current);
            controls.update();
            isCameraAutoAnimatingRef.current = false;
        }
    });

    return (
        <>
            <color attach="background" args={['#0b111d']} />
            <fog attach="fog" args={['#0b111d', modelData.fogNear, modelData.fogFar]} />

            <PerspectiveCamera makeDefault position={[2.5, 1.9, 3.1]} fov={43} />
            <OrbitControls
                ref={controlsRef}
                enabled={orbitEnabled}
                enablePan={false}
                maxPolarAngle={Math.PI / 1.5}
            />

            <ambientLight intensity={0.68} />
            <directionalLight position={[5, 8, 4]} intensity={1.32} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <pointLight position={[-4, 2, -2]} intensity={0.45} color="#95b7ff" />

            <Environment preset="city" blur={1} />
            <Grid args={[18, 18]} cellSize={0.8} cellThickness={0.55} cellColor="#1e2d4a" sectionSize={4} sectionThickness={0.9} sectionColor="#314a75" fadeDistance={30} fadeStrength={1} infiniteGrid />

            <group onPointerDown={handleModelPointerDown}>
                <primitive object={modelData.model} scale={modelData.modelScale} />
            </group>

            {components.map((component) => (
                <PinHotspot
                    key={component.id}
                    component={component}
                    selected={component.id === selectedComponentId}
                    onSelect={onSelectComponent}
                    editMode={editMode}
                    editTool={editTool}
                />
            ))}

            <mesh ref={dragTargetRef} visible={false}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {selectedComponent && editMode ? (
                <TransformControls
                    object={dragTargetRef}
                    mode="translate"
                    size={modelData.controlSize}
                    onMouseDown={() => {
                        isTransformInteractingRef.current = true;
                        if (controlsRef.current) {
                            controlsRef.current.enabled = false;
                        }
                        onTransformDragging(true);
                    }}
                    onMouseUp={() => {
                        isTransformInteractingRef.current = false;
                        if (controlsRef.current) {
                            controlsRef.current.enabled = orbitEnabled;
                        }
                        onTransformDragging(false);
                    }}
                    onDraggingChanged={(event) => {
                        isTransformInteractingRef.current = event.value;
                        if (controlsRef.current) {
                            controlsRef.current.enabled = orbitEnabled && !event.value;
                        }
                        onTransformDragging(event.value);
                    }}
                    onObjectChange={() => {
                        const object = dragTargetRef.current;
                        if (!object) {
                            return;
                        }

                        onMoveComponent(selectedComponent.id, [
                            Number(object.position.x.toFixed(4)),
                            Number(object.position.y.toFixed(4)),
                            Number(object.position.z.toFixed(4))
                        ]);
                    }}
                />
            ) : null}

            <ContactShadows
                position={[modelData.center.x, modelData.floorY, modelData.center.z]}
                opacity={0.5}
                scale={modelData.shadowScale}
                blur={2.2}
                far={modelData.shadowFar}
            />

            <ScreenPositionTracker
                position={selectedComponent?.position || null}
                onChange={onPinScreenPosition}
            />
        </>
    );
};

const LoadingFallback = () => (
    <Html center>
        <div className="loading-pill">Loading model...</div>
    </Html>
);

const ModelViewer = ({
    modelUrl,
    modelFileName,
    editMode,
    editTool,
    components,
    selectedComponentId,
    orbitEnabled,
    onSelectComponent,
    onDeselectComponent,
    onAddComponent,
    onMoveComponent,
    onTransformDragging,
    onPinScreenPosition
}) => {
    return (
        <div className="viewer-canvas-wrap">
            <Canvas
                shadows
                dpr={[1, 1.75]}
                gl={{ antialias: true }}
                onPointerMissed={() => onDeselectComponent?.()}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <SceneContents
                        modelUrl={modelUrl}
                        modelFileName={modelFileName}
                        editMode={editMode}
                        editTool={editTool}
                        components={components}
                        selectedComponentId={selectedComponentId}
                        orbitEnabled={orbitEnabled}
                        onSelectComponent={onSelectComponent}
                        onAddComponent={onAddComponent}
                        onMoveComponent={onMoveComponent}
                        onTransformDragging={onTransformDragging}
                        onPinScreenPosition={onPinScreenPosition}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

useGLTF.preload('/fpv.glb');

export default ModelViewer;
