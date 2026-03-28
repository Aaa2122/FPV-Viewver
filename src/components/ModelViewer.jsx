import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
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

const roundPosition = (point) => [
    Number(point.x.toFixed(4)),
    Number(point.y.toFixed(4)),
    Number(point.z.toFixed(4))
];

const PinMesh = ({ component, selected, onSelect }) => {
    return (
        <group position={component.position}>
            <mesh
                onPointerDown={(event) => {
                    event.stopPropagation();
                    onSelect(component.id);
                }}
            >
                <sphereGeometry args={[selected ? 0.045 : 0.03, 24, 24]} />
                <meshStandardMaterial
                    color={selected ? '#f97316' : '#06b6d4'}
                    emissive={selected ? '#f97316' : '#0891b2'}
                    emissiveIntensity={selected ? 0.4 : 0.2}
                />
            </mesh>

            {selected && (
                <Html position={[0, 0.12, 0]} center distanceFactor={7}>
                    <div className="pointer-events-none rounded bg-slate-900/90 border border-cyan-500/40 px-2 py-1 text-[11px] text-white whitespace-nowrap">
                        {component.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

const SceneContents = ({
    modelUrl,
    editMode,
    components,
    selectedComponentId,
    orbitEnabled,
    onSelectComponent,
    onAddComponent,
    onMoveComponent,
    onTransformDragging
}) => {
    const { scene } = useGLTF(modelUrl);

    const model = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clone;
    }, [scene]);

    const selectedComponent = components.find((component) => component.id === selectedComponentId) || null;
    const unselectedComponents = components.filter((component) => component.id !== selectedComponentId);

    const handleModelPointerDown = (event) => {
        if (!editMode) {
            return;
        }

        event.stopPropagation();
        onAddComponent(roundPosition(event.point));
    };

    return (
        <>
            <color attach="background" args={['#050910']} />
            <fog attach="fog" args={['#050910', 8, 18]} />

            <PerspectiveCamera makeDefault position={[2.6, 2.2, 3.2]} fov={45} />
            <OrbitControls enabled={orbitEnabled} enablePan={false} minDistance={1.2} maxDistance={9} maxPolarAngle={Math.PI / 1.55} />

            <ambientLight intensity={0.6} />
            <directionalLight position={[4, 8, 3]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <pointLight position={[-4, 3, -2]} intensity={0.6} color="#0ea5e9" />

            <Environment preset="city" blur={0.8} />
            <Grid args={[16, 16]} cellSize={0.5} cellThickness={0.6} cellColor="#1e293b" sectionSize={2} sectionThickness={1} sectionColor="#334155" fadeDistance={25} fadeStrength={1} infiniteGrid />

            <group onPointerDown={handleModelPointerDown}>
                <primitive object={model} />
            </group>

            {unselectedComponents.map((component) => (
                <PinMesh
                    key={component.id}
                    component={component}
                    selected={false}
                    onSelect={onSelectComponent}
                />
            ))}

            {selectedComponent && editMode ? (
                <TransformControls
                    mode="translate"
                    size={0.7}
                    onDraggingChanged={(event) => onTransformDragging(event.value)}
                    onObjectChange={(event) => {
                        const object = event.target.object;
                        if (!object) {
                            return;
                        }

                        onMoveComponent(selectedComponent.id, [
                            Number(object.position.x.toFixed(4)),
                            Number(object.position.y.toFixed(4)),
                            Number(object.position.z.toFixed(4))
                        ]);
                    }}
                >
                    <PinMesh component={selectedComponent} selected onSelect={onSelectComponent} />
                </TransformControls>
            ) : null}

            {selectedComponent && !editMode ? (
                <PinMesh component={selectedComponent} selected onSelect={onSelectComponent} />
            ) : null}

            <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={12} blur={2.4} far={5} />
        </>
    );
};

const LoadingFallback = () => (
    <Html center>
        <div className="px-3 py-2 rounded bg-slate-900/90 border border-slate-700 text-xs text-slate-200">
            Loading model...
        </div>
    </Html>
);

const ModelViewer = ({
    modelUrl,
    editMode,
    components,
    selectedComponentId,
    orbitEnabled,
    onSelectComponent,
    onAddComponent,
    onMoveComponent,
    onTransformDragging
}) => {
    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true }}>
                <Suspense fallback={<LoadingFallback />}>
                    <SceneContents
                        modelUrl={modelUrl}
                        editMode={editMode}
                        components={components}
                        selectedComponentId={selectedComponentId}
                        orbitEnabled={orbitEnabled}
                        onSelectComponent={onSelectComponent}
                        onAddComponent={onAddComponent}
                        onMoveComponent={onMoveComponent}
                        onTransformDragging={onTransformDragging}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

useGLTF.preload('/fpv.glb');

export default ModelViewer;
