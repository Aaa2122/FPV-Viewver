import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModelErrorBoundary from './components/ModelErrorBoundary';
import ModelViewer from './components/ModelViewer';
import {
    DEFAULT_MODEL,
    DEFAULT_MODEL_URL,
    PROJECT_STORAGE_KEY,
    createEmptyProject,
    nowIso,
    validateProjectData
} from './utils/projectSchema';

const MODEL_EXTENSIONS = ['.glb', '.gltf'];

const getModelMimeType = (fileName, fallback) => {
    if (fallback && fallback.trim()) {
        return fallback;
    }

    return fileName.toLowerCase().endsWith('.glb')
        ? 'model/gltf-binary'
        : 'model/gltf+json';
};

const isSupportedModelFile = (fileName) => {
    const lowerName = fileName.toLowerCase();
    return MODEL_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
};

const createNewComponent = (position, index) => {
    const id = `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
        id,
        name: `Component ${index + 1}`,
        description: '',
        specs: [],
        position
    };
};

const InfoCard = ({ component }) => {
    if (!component) {
        return null;
    }

    return (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[360px] p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur">
            <h3 className="text-sm font-semibold text-cyan-300 mb-2">{component.name}</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{component.description || 'No description.'}</p>

            {component.specs.length > 0 ? (
                <div className="mt-3 space-y-1 text-xs text-slate-200">
                    {component.specs.map((spec, index) => (
                        <div key={`${spec.key}-${index}`} className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1">
                            <span className="text-slate-400">{spec.key || `Spec ${index + 1}`}</span>
                            <span>{spec.value || '-'}</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

function App() {
    const [project, setProject] = useState(() => createEmptyProject());
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [editMode, setEditMode] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Ready. Upload a model or start pinning the default drone.');
    const [errorMessage, setErrorMessage] = useState('');
    const [modelError, setModelError] = useState('');
    const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
    const [isTransformDragging, setIsTransformDragging] = useState(false);

    const uploadInputRef = useRef(null);
    const importInputRef = useRef(null);
    const uploadedModelUrlRef = useRef(null);
    const uploadedModelNameRef = useRef('');

    const selectedComponent = useMemo(
        () => project.components.find((component) => component.id === selectedComponentId) || null,
        [project.components, selectedComponentId]
    );

    useEffect(() => {
        const savedProjectRaw = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (!savedProjectRaw) {
            return;
        }

        try {
            const parsed = JSON.parse(savedProjectRaw);
            const validation = validateProjectData(parsed);

            if (!validation.valid) {
                setErrorMessage(`Saved project ignored: ${validation.errors.join(' ')}`);
                return;
            }

            setProject(validation.project);
            setSelectedComponentId(validation.project.components[0]?.id || null);

            if (validation.project.model.fileName !== DEFAULT_MODEL.fileName) {
                setStatusMessage(`Project restored. Re-upload model file "${validation.project.model.fileName}" to match the saved metadata.`);
            } else {
                setStatusMessage('Autosaved project restored.');
                setModelUrl(DEFAULT_MODEL_URL);
            }
        } catch (error) {
            setErrorMessage(`Saved project could not be parsed: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
    }, [project]);

    useEffect(() => {
        if (!selectedComponentId) {
            return;
        }

        const exists = project.components.some((component) => component.id === selectedComponentId);
        if (!exists) {
            setSelectedComponentId(null);
        }
    }, [project.components, selectedComponentId]);

    useEffect(() => {
        return () => {
            if (uploadedModelUrlRef.current) {
                URL.revokeObjectURL(uploadedModelUrlRef.current);
            }
        };
    }, []);

    const updateProject = (updater) => {
        setProject((previousProject) => {
            const nextProject = typeof updater === 'function' ? updater(previousProject) : updater;
            return {
                ...nextProject,
                meta: {
                    ...nextProject.meta,
                    updatedAt: nowIso()
                }
            };
        });
    };

    const patchSelectedComponent = (patcher) => {
        if (!selectedComponentId) {
            return;
        }

        updateProject((previousProject) => ({
            ...previousProject,
            components: previousProject.components.map((component) => {
                if (component.id !== selectedComponentId) {
                    return component;
                }

                return patcher(component);
            })
        }));
    };

    const handleModelUpload = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        if (!isSupportedModelFile(file.name)) {
            setErrorMessage('Unsupported model format. Please upload a .glb or .gltf file.');
            return;
        }

        if (uploadedModelUrlRef.current) {
            URL.revokeObjectURL(uploadedModelUrlRef.current);
            uploadedModelUrlRef.current = null;
        }

        const objectUrl = URL.createObjectURL(file);
        uploadedModelUrlRef.current = objectUrl;
        uploadedModelNameRef.current = file.name;

        setModelUrl(objectUrl);
        setModelError('');
        setErrorMessage('');
        setStatusMessage(`Model uploaded: ${file.name}`);

        updateProject((previousProject) => ({
            ...previousProject,
            model: {
                fileName: file.name,
                mimeType: getModelMimeType(file.name, file.type)
            }
        }));
    };

    const handleAddComponent = (position) => {
        const newComponent = createNewComponent(position, project.components.length);

        updateProject((previousProject) => ({
            ...previousProject,
            components: [...previousProject.components, newComponent]
        }));

        setSelectedComponentId(newComponent.id);
        setStatusMessage(`Pin added at [${position.join(', ')}].`);
        setErrorMessage('');
    };

    const handleMoveComponent = (componentId, position) => {
        updateProject((previousProject) => ({
            ...previousProject,
            components: previousProject.components.map((component) =>
                component.id === componentId
                    ? { ...component, position }
                    : component
            )
        }));
    };

    const handleDeleteSelectedComponent = () => {
        if (!selectedComponentId) {
            return;
        }

        updateProject((previousProject) => ({
            ...previousProject,
            components: previousProject.components.filter((component) => component.id !== selectedComponentId)
        }));

        setSelectedComponentId(null);
        setStatusMessage('Pin deleted.');
    };

    const handleCreateNewProject = () => {
        if (uploadedModelUrlRef.current) {
            URL.revokeObjectURL(uploadedModelUrlRef.current);
            uploadedModelUrlRef.current = null;
            uploadedModelNameRef.current = '';
        }

        setProject(createEmptyProject());
        setSelectedComponentId(null);
        setModelUrl(DEFAULT_MODEL_URL);
        setEditMode(true);
        setErrorMessage('');
        setModelError('');
        setStatusMessage('New project created.');
    };

    const handleExportProject = () => {
        const fileName = `${project.meta.name || 'drone-project'}-${Date.now()}.json`;
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = fileName.replace(/\s+/g, '-');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        setStatusMessage(`Project exported: ${link.download}`);
    };

    const handleImportProject = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        try {
            const raw = await file.text();
            const parsed = JSON.parse(raw);
            const validation = validateProjectData(parsed);

            if (!validation.valid) {
                setErrorMessage(`Import failed: ${validation.errors.join(' ')}`);
                return;
            }

            const importedProject = validation.project;
            setProject(importedProject);
            setSelectedComponentId(importedProject.components[0]?.id || null);
            setErrorMessage('');
            setModelError('');

            if (importedProject.model.fileName === DEFAULT_MODEL.fileName) {
                setModelUrl(DEFAULT_MODEL_URL);
                setStatusMessage('Project imported with default model.');
                return;
            }

            if (
                uploadedModelUrlRef.current &&
                uploadedModelNameRef.current === importedProject.model.fileName
            ) {
                setModelUrl(uploadedModelUrlRef.current);
                setStatusMessage(`Project imported and linked to current uploaded model: ${importedProject.model.fileName}`);
                return;
            }

            setModelUrl(DEFAULT_MODEL_URL);
            setStatusMessage(`Project imported. Re-upload model file "${importedProject.model.fileName}" to match saved metadata.`);
        } catch (error) {
            setErrorMessage(`Import failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <input
                ref={uploadInputRef}
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                onChange={handleModelUpload}
            />
            <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportProject}
            />

            <header className="border-b border-slate-800 px-4 py-3 md:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">FPV 3D Model Pin Editor</h1>
                        <p className="text-xs text-slate-400">
                            Upload a drone model, place component pins in 3D, then switch to viewer mode for info display.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => uploadInputRef.current?.click()}
                            className="toolbar-button"
                        >
                            Upload Model
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode((previous) => !previous)}
                            className={`toolbar-button ${editMode ? 'toolbar-button-active' : ''}`}
                        >
                            {editMode ? 'Edit Mode: ON' : 'Edit Mode: OFF'}
                        </button>
                        <button
                            type="button"
                            onClick={() => importInputRef.current?.click()}
                            className="toolbar-button"
                        >
                            Import JSON
                        </button>
                        <button
                            type="button"
                            onClick={handleExportProject}
                            className="toolbar-button"
                        >
                            Export JSON
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateNewProject}
                            className="toolbar-button"
                        >
                            New Project
                        </button>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="status-chip">Model: {project.model.fileName}</span>
                    <span className="status-chip">Pins: {project.components.length}</span>
                    <span className="status-chip">Version: {project.version}</span>
                </div>

                {statusMessage ? <p className="mt-2 text-xs text-emerald-300">{statusMessage}</p> : null}
                {errorMessage ? <p className="mt-1 text-xs text-red-300">{errorMessage}</p> : null}
                {modelError ? <p className="mt-1 text-xs text-red-300">{modelError}</p> : null}
            </header>

            <main className="p-4 md:p-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="relative h-[52vh] min-h-[420px] lg:h-[calc(100vh-190px)]">
                        <ModelErrorBoundary resetKey={modelUrl} onError={setModelError}>
                            <ModelViewer
                                modelUrl={modelUrl}
                                editMode={editMode}
                                components={project.components}
                                selectedComponentId={selectedComponentId}
                                orbitEnabled={!isTransformDragging}
                                onSelectComponent={setSelectedComponentId}
                                onAddComponent={handleAddComponent}
                                onMoveComponent={handleMoveComponent}
                                onTransformDragging={setIsTransformDragging}
                            />
                        </ModelErrorBoundary>

                        {!editMode && selectedComponent ? <InfoCard component={selectedComponent} /> : null}
                    </section>

                    <aside className="panel-scroll rounded-xl border border-slate-800 bg-slate-900/70 p-4 h-[42vh] min-h-[360px] lg:h-[calc(100vh-190px)]">
                        <div className="space-y-4">
                            <section>
                                <label htmlFor="project-name" className="panel-label">Project Name</label>
                                <input
                                    id="project-name"
                                    type="text"
                                    value={project.meta.name}
                                    onChange={(event) => {
                                        const nextName = event.target.value;
                                        updateProject((previousProject) => ({
                                            ...previousProject,
                                            meta: {
                                                ...previousProject.meta,
                                                name: nextName
                                            }
                                        }));
                                    }}
                                    className="panel-input"
                                />
                            </section>

                            <section>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold">Components</h2>
                                    <span className="text-xs text-slate-400">{project.components.length}</span>
                                </div>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {project.components.map((component) => (
                                        <button
                                            key={component.id}
                                            type="button"
                                            onClick={() => setSelectedComponentId(component.id)}
                                            className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                                                component.id === selectedComponentId
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                                                    : 'border-slate-700 bg-slate-800/40 text-slate-200 hover:border-slate-500'
                                            }`}
                                        >
                                            {component.name}
                                        </button>
                                    ))}

                                    {project.components.length === 0 ? (
                                        <p className="text-xs text-slate-400">
                                            {editMode
                                                ? 'Click on the 3D model to add your first component pin.'
                                                : 'No pins yet. Enable edit mode to add components.'}
                                        </p>
                                    ) : null}
                                </div>
                            </section>

                            {selectedComponent ? (
                                <section className="space-y-3 border-t border-slate-800 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-semibold">Selected Component</h2>
                                        <button type="button" onClick={handleDeleteSelectedComponent} className="danger-button">
                                            Delete
                                        </button>
                                    </div>

                                    <div>
                                        <label className="panel-label">Name</label>
                                        <input
                                            type="text"
                                            value={selectedComponent.name}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                patchSelectedComponent((component) => ({ ...component, name: value }));
                                            }}
                                            className="panel-input"
                                        />
                                    </div>

                                    <div>
                                        <label className="panel-label">Description</label>
                                        <textarea
                                            value={selectedComponent.description}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                patchSelectedComponent((component) => ({ ...component, description: value }));
                                            }}
                                            className="panel-input min-h-20 resize-y"
                                        />
                                    </div>

                                    <div>
                                        <label className="panel-label">Position (X / Y / Z)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedComponent.position.map((coordinate, index) => (
                                                <input
                                                    key={index}
                                                    type="number"
                                                    step="0.01"
                                                    value={coordinate}
                                                    onChange={(event) => {
                                                        const numericValue = Number(event.target.value);
                                                        patchSelectedComponent((component) => {
                                                            const nextPosition = [...component.position];
                                                            nextPosition[index] = Number.isFinite(numericValue) ? numericValue : 0;
                                                            return { ...component, position: nextPosition };
                                                        });
                                                    }}
                                                    className="panel-input"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="panel-label">Specs</label>
                                            <button
                                                type="button"
                                                className="toolbar-button"
                                                onClick={() => {
                                                    patchSelectedComponent((component) => ({
                                                        ...component,
                                                        specs: [...component.specs, { key: '', value: '' }]
                                                    }));
                                                }}
                                            >
                                                Add Spec
                                            </button>
                                        </div>

                                        <div className="mt-2 space-y-2">
                                            {selectedComponent.specs.map((spec, index) => (
                                                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={spec.key}
                                                        onChange={(event) => {
                                                            const value = event.target.value;
                                                            patchSelectedComponent((component) => ({
                                                                ...component,
                                                                specs: component.specs.map((item, specIndex) =>
                                                                    specIndex === index ? { ...item, key: value } : item
                                                                )
                                                            }));
                                                        }}
                                                        placeholder="Key"
                                                        className="panel-input"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={spec.value}
                                                        onChange={(event) => {
                                                            const value = event.target.value;
                                                            patchSelectedComponent((component) => ({
                                                                ...component,
                                                                specs: component.specs.map((item, specIndex) =>
                                                                    specIndex === index ? { ...item, value } : item
                                                                )
                                                            }));
                                                        }}
                                                        placeholder="Value"
                                                        className="panel-input"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="danger-button h-9 px-2"
                                                        onClick={() => {
                                                            patchSelectedComponent((component) => ({
                                                                ...component,
                                                                specs: component.specs.filter((_, specIndex) => specIndex !== index)
                                                            }));
                                                        }}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <section className="border-t border-slate-800 pt-4">
                                    <p className="text-xs text-slate-400">
                                        Select a pin from the list or click one in the 3D view to edit its metadata.
                                    </p>
                                </section>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default App;
