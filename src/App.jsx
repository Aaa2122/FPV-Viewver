import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const hashString = (value) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
};

const truncate = (value, max = 18) => {
    if (!value) {
        return '';
    }

    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

function App() {
    const [project, setProject] = useState(() => createEmptyProject());
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showComponentsPanel, setShowComponentsPanel] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Ready. Click a hotspot to inspect a component.');
    const [errorMessage, setErrorMessage] = useState('');
    const [modelError, setModelError] = useState('');
    const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
    const [isTransformDragging, setIsTransformDragging] = useState(false);
    const [pinScreenPos, setPinScreenPos] = useState(null);

    const uploadedModelUrlRef = useRef(null);
    const uploadedModelNameRef = useRef('');
    const viewerShellRef = useRef(null);
    const cardRef = useRef(null);

    const handlePinScreenPosition = useCallback((pos) => {
        setPinScreenPos(pos);
    }, []);

    const selectedComponent = useMemo(
        () => project.components.find((component) => component.id === selectedComponentId) || null,
        [project.components, selectedComponentId]
    );

    const detailSpecs = useMemo(() => {
        if (!selectedComponent) {
            return [];
        }

        if (selectedComponent.specs.length > 0) {
            return selectedComponent.specs;
        }

        const [x = 0, y = 0, z = 0] = selectedComponent.position || [];
        return [
            { key: 'X', value: x.toFixed(3) },
            { key: 'Y', value: y.toFixed(3) },
            { key: 'Z', value: z.toFixed(3) }
        ];
    }, [selectedComponent]);

    const metrics = useMemo(() => {
        const seed = hashString(selectedComponent?.id || 'default-seed');
        return {
            efficiency: 45 + (seed % 50),
            thrust: 52 + (seed % 38)
        };
    }, [selectedComponent]);

    const showEditorPanel = Boolean(editMode && selectedComponent);
    const hasRightRail = showComponentsPanel || showEditorPanel;

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
                setStatusMessage(`Project restored. Re-upload model file "${validation.project.model.fileName}" to match saved metadata.`);
            } else {
                setStatusMessage('Autosaved project restored. Click a hotspot to inspect a component.');
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
        setStatusMessage(`Model loaded: ${file.name}`);

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
        setEditMode(false);
        setErrorMessage('');
        setModelError('');
        setStatusMessage('New project created. Click a hotspot to inspect a component.');
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
        <div className="simple-ui-root">
            <header className="glass-panel top-glass-bar">
                <div className="brand-block">
                    <span className="brand-glyph">D</span>
                    <div>
                        <h1>Drone Configurator</h1>
                        <p>Model: {truncate(project.model.fileName, 28)}</p>
                    </div>
                </div>

                <div className="toolbar-center">
                    <div className="toolbar-actions">
                        <input
                            id="model-upload-input"
                            type="file"
                            accept=".glb,.gltf"
                            className="file-input-hidden"
                            onChange={handleModelUpload}
                        />
                        <label htmlFor="model-upload-input" className="glass-button file-action-label">
                            Upload Model
                        </label>

                        <input
                            id="project-import-input"
                            type="file"
                            accept="application/json,.json"
                            className="file-input-hidden"
                            onChange={handleImportProject}
                        />
                        <label htmlFor="project-import-input" className="glass-button file-action-label">
                            Import Project
                        </label>

                        <button type="button" className="glass-button" onClick={handleExportProject}>Export Project</button>
                        <button type="button" className="glass-button" onClick={handleCreateNewProject}>New</button>
                        <button
                            type="button"
                            className={`glass-button ${showComponentsPanel ? 'active-soft' : ''}`}
                            onClick={() => setShowComponentsPanel((previous) => !previous)}
                        >
                            {showComponentsPanel ? 'Hide Components' : 'Show Components'}
                        </button>
                    </div>
                    <p className="toolbar-help">
                        Upload Model: .glb/.gltf | Import Project: .json exported from this app
                    </p>
                </div>

                <div className="mode-toggle">
                    <button
                        type="button"
                        className={`mode-toggle-btn ${editMode ? 'active' : ''}`}
                        onClick={() => setEditMode(true)}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className={`mode-toggle-btn ${!editMode ? 'active' : ''}`}
                        onClick={() => setEditMode(false)}
                    >
                        View
                    </button>
                </div>
            </header>

            <main className={`page-stage ${hasRightRail ? '' : 'page-stage-full'}`}>
                <div className="stage-grid-overlay" aria-hidden />

                <section className="viewer-column">
                    <div className="viewer-shell" ref={viewerShellRef}>
                        <ModelErrorBoundary resetKey={modelUrl} onError={setModelError}>
                            <ModelViewer
                                modelUrl={modelUrl}
                                modelFileName={project.model.fileName}
                                editMode={editMode}
                                components={project.components}
                                selectedComponentId={selectedComponentId}
                                orbitEnabled={!isTransformDragging}
                                onSelectComponent={setSelectedComponentId}
                                onDeselectComponent={() => setSelectedComponentId(null)}
                                onAddComponent={handleAddComponent}
                                onMoveComponent={handleMoveComponent}
                                onTransformDragging={setIsTransformDragging}
                                onPinScreenPosition={handlePinScreenPosition}
                            />
                        </ModelErrorBoundary>

                        {selectedComponent ? (
                            <article className="component-white-sheet" ref={cardRef}>
                                <h2>{selectedComponent.name.toUpperCase()}</h2>
                                <p>{selectedComponent.description || 'No description provided for this component.'}</p>

                                <div className="sheet-specs">
                                    {detailSpecs.map((spec, index) => (
                                        <div key={`${spec.key}-${index}`} className="sheet-spec-row">
                                            <span className="sheet-icon" aria-hidden>?</span>
                                            <span className="sheet-key">{spec.key || `Spec ${index + 1}`}</span>
                                            <strong>{spec.value || '-'}</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="sheet-meters">
                                    <div>
                                        <span>Efficiency</span>
                                        <div className="meter-track">
                                            <span className="meter-fill" style={{ width: `${metrics.efficiency}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <span>Thrust</span>
                                        <div className="meter-track">
                                            <span className="meter-fill" style={{ width: `${metrics.thrust}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ) : null}

                        {selectedComponent && pinScreenPos && cardRef.current && viewerShellRef.current ? (() => {
                            const shellRect = viewerShellRef.current.getBoundingClientRect();
                            const cardRect = cardRef.current.getBoundingClientRect();
                            const startX = cardRect.right - shellRect.left;
                            const startY = cardRect.top + cardRect.height / 2 - shellRect.top;
                            const endX = pinScreenPos.x;
                            const endY = pinScreenPos.y;
                            const dx = endX - startX;
                            const cpX = startX + dx * 0.5;
                            return (
                                <svg className="connector-svg">
                                    <path
                                        d={`M ${startX} ${startY} C ${cpX} ${startY} ${cpX} ${endY} ${endX} ${endY}`}
                                        stroke="rgba(255,255,255,0.25)"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeDasharray="6 4"
                                    />
                                    <circle cx={endX} cy={endY} r="4" fill="rgba(255,255,255,0.4)" />
                                    <circle cx={endX} cy={endY} r="2" fill="rgba(255,255,255,0.8)" />
                                </svg>
                            );
                        })() : null}

                    </div>
                </section>

                {hasRightRail ? (
                    <aside className="right-rail">
                        {showComponentsPanel ? (
                            <section className="glass-panel component-list-panel">
                                <div className="panel-head">
                                    <h3>Components</h3>
                                    <button
                                        type="button"
                                        className="panel-mini-button"
                                        onClick={() => setShowComponentsPanel(false)}
                                    >
                                        Hide
                                    </button>
                                </div>
                                <div className="component-list-scroll">
                                    {project.components.map((component) => (
                                        <button
                                            key={component.id}
                                            type="button"
                                            className={`component-list-item ${component.id === selectedComponentId ? 'active' : ''}`}
                                            onClick={() => setSelectedComponentId(component.id)}
                                        >
                                            {truncate(component.name, 20)}
                                        </button>
                                    ))}

                                    {project.components.length === 0 ? (
                                        <p className="empty-note">No component yet. Click the drone in Edit mode.</p>
                                    ) : null}
                                </div>
                            </section>
                        ) : null}

                        {showEditorPanel ? (
                            <section className="glass-panel editor-panel">
                                <div className="editor-head">
                                    <h3>Edit Component</h3>
                                    <button type="button" className="glass-danger" onClick={handleDeleteSelectedComponent}>Delete</button>
                                </div>

                                <label className="field-label" htmlFor="component-name">Name</label>
                                <input
                                    id="component-name"
                                    type="text"
                                    className="field-input"
                                    value={selectedComponent.name}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        patchSelectedComponent((component) => ({ ...component, name: value }));
                                    }}
                                />

                                <label className="field-label" htmlFor="component-description">Description</label>
                                <textarea
                                    id="component-description"
                                    className="field-input field-textarea"
                                    value={selectedComponent.description}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        patchSelectedComponent((component) => ({ ...component, description: value }));
                                    }}
                                />

                                <label className="field-label">Position (X / Y / Z)</label>
                                <div className="coords-grid">
                                    {selectedComponent.position.map((coordinate, index) => (
                                        <input
                                            key={index}
                                            type="number"
                                            step="0.01"
                                            className="field-input"
                                            value={coordinate}
                                            onChange={(event) => {
                                                const numericValue = Number(event.target.value);
                                                patchSelectedComponent((component) => {
                                                    const nextPosition = [...component.position];
                                                    nextPosition[index] = Number.isFinite(numericValue) ? numericValue : 0;
                                                    return { ...component, position: nextPosition };
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </aside>
                ) : null}
            </main>

            <footer className="status-line">
                {statusMessage ? <span className="status-ok">{statusMessage}</span> : null}
                {errorMessage ? <span className="status-error">{errorMessage}</span> : null}
                {modelError ? <span className="status-error">{modelError}</span> : null}
            </footer>
        </div>
    );
}

export default App;
