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
    const [editTool, setEditTool] = useState('select');

    const uploadedModelUrlRef = useRef(null);
    const uploadedModelNameRef = useRef('');
    const viewerShellRef = useRef(null);
    const cardRef = useRef(null);
    const clipboardRef = useRef(null);

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

    const actionsRef = useRef({});
    actionsRef.current.deleteSelected = () => {
        if (!selectedComponentId) return;
        setProject((prev) => ({
            ...prev,
            meta: { ...prev.meta, updatedAt: nowIso() },
            components: prev.components.filter((c) => c.id !== selectedComponentId)
        }));
        setSelectedComponentId(null);
        setStatusMessage('Pin deleted.');
    };
    actionsRef.current.copy = () => {
        if (!selectedComponent) return;
        clipboardRef.current = { ...selectedComponent, specs: [...selectedComponent.specs] };
        setStatusMessage('Component copied.');
    };
    actionsRef.current.paste = () => {
        const src = clipboardRef.current;
        if (!src) return;
        const comp = createNewComponent(src.position.map((v) => v + 0.15), 0);
        comp.name = `${src.name} (copy)`;
        comp.description = src.description;
        comp.specs = [...src.specs];
        setProject((prev) => ({
            ...prev,
            meta: { ...prev.meta, updatedAt: nowIso() },
            components: [...prev.components, comp]
        }));
        setSelectedComponentId(comp.id);
        setStatusMessage('Component pasted.');
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                actionsRef.current.deleteSelected();
                return;
            }
            if (e.key === 'Escape') {
                setSelectedComponentId(null);
                setEditTool('select');
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                actionsRef.current.copy();
                e.preventDefault();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                actionsRef.current.paste();
                e.preventDefault();
                return;
            }
            if (e.key === 'v' || e.key === 'V') { setEditTool('select'); return; }
            if (e.key === 'a' || e.key === 'A') { setEditTool('add'); return; }
            if (e.key === 'h' || e.key === 'H') { setEditTool('hand'); return; }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

    const handleDeleteSelectedComponent = () => actionsRef.current.deleteSelected();

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
                                editTool={editTool}
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

                        <div className="viewer-mode-toggle">
                            <button
                                type="button"
                                className={`vmode ${editMode ? 'active' : ''}`}
                                onClick={() => { setEditMode(true); setEditTool('select'); }}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className={`vmode ${!editMode ? 'active' : ''}`}
                                onClick={() => setEditMode(false)}
                            >
                                View
                            </button>
                        </div>

                        {editMode ? (
                            <div className="viewer-toolbar">
                                <button
                                    type="button"
                                    className={`vtool ${editTool === 'hand' ? 'active' : ''}`}
                                    onClick={() => setEditTool('hand')}
                                    title="Navigate (H)"
                                >
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1.5v4.5M5.5 4v6a2.5 2.5 0 005 0V5" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round"/><path d="M3.5 6.5v3a4.5 4.5 0 009 0v-4" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round"/></svg>
                                </button>
                                <button
                                    type="button"
                                    className={`vtool ${editTool === 'select' ? 'active' : ''}`}
                                    onClick={() => setEditTool('select')}
                                    title="Select (V)"
                                >
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 1l8 6-4 1-2 5z" fill="currentColor"/></svg>
                                </button>
                                <button
                                    type="button"
                                    className={`vtool ${editTool === 'add' ? 'active' : ''}`}
                                    onClick={() => setEditTool('add')}
                                    title="Add Pin (A)"
                                >
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                                </button>
                                <span className="vtool-sep" />
                                <button
                                    type="button"
                                    className="vtool"
                                    onClick={handleDeleteSelectedComponent}
                                    disabled={!selectedComponentId}
                                    title="Delete (Del)"
                                >
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M3 4h10M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" fill="none" strokeWidth="1.3"/></svg>
                                </button>
                            </div>
                        ) : null}

                        {selectedComponent && !editMode ? (() => {
                            const cardStyle = {};
                            if (pinScreenPos && viewerShellRef.current) {
                                const shellW = viewerShellRef.current.clientWidth;
                                const onRight = pinScreenPos.x < shellW * 0.5;
                                cardStyle.left = `${pinScreenPos.x}px`;
                                cardStyle.top = `${pinScreenPos.y}px`;
                                cardStyle.transform = onRight
                                    ? 'translate(40px, -50%)'
                                    : 'translate(calc(-100% - 40px), -50%)';
                            }
                            return (
                                <article
                                    key={selectedComponent.id}
                                    className="component-card"
                                    ref={cardRef}
                                    style={cardStyle}
                                >
                                    <div className="card-header">
                                        <h2>{selectedComponent.name.toUpperCase()}</h2>
                                    </div>
                                    {selectedComponent.description ? (
                                        <p className="card-desc">{selectedComponent.description}</p>
                                    ) : null}

                                    {detailSpecs.length > 0 ? (
                                        <div className="card-specs">
                                            {detailSpecs.map((spec, index) => (
                                                <div key={`${spec.key}-${index}`} className="card-spec-row">
                                                    <span className="card-spec-key">{spec.key || `Spec ${index + 1}`}</span>
                                                    <span className="card-spec-dots" />
                                                    <strong className="card-spec-val">{spec.value || '-'}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="card-meters">
                                        <div className="card-meter">
                                            <span>Efficiency</span>
                                            <div className="meter-track">
                                                <span className="meter-fill" style={{ width: `${metrics.efficiency}%` }} />
                                            </div>
                                        </div>
                                        <div className="card-meter">
                                            <span>Thrust</span>
                                            <div className="meter-track">
                                                <span className="meter-fill" style={{ width: `${metrics.thrust}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })() : null}

                        {selectedComponent && !editMode && pinScreenPos && cardRef.current && viewerShellRef.current ? (() => {
                            const shellRect = viewerShellRef.current.getBoundingClientRect();
                            const cardRect = cardRef.current.getBoundingClientRect();
                            const startX = pinScreenPos.x < shellRect.width * 0.5
                                ? cardRect.left - shellRect.left
                                : cardRect.right - shellRect.left;
                            const startY = cardRect.top + cardRect.height / 2 - shellRect.top;
                            const endX = pinScreenPos.x;
                            const endY = pinScreenPos.y;
                            const dx = endX - startX;
                            const cpX = startX + dx * 0.45;
                            return (
                                <svg className="connector-svg">
                                    <path
                                        d={`M ${startX} ${startY} C ${cpX} ${startY} ${cpX} ${endY} ${endX} ${endY}`}
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="1.2"
                                        fill="none"
                                        strokeDasharray="5 4"
                                    />
                                    <circle cx={endX} cy={endY} r="3.5" fill="rgba(255,255,255,0.3)" />
                                    <circle cx={endX} cy={endY} r="1.5" fill="rgba(255,255,255,0.7)" />
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
