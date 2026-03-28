export const PROJECT_VERSION = 1;

export const DEFAULT_MODEL = {
    fileName: 'fpv.glb',
    mimeType: 'model/gltf-binary'
};

export const DEFAULT_MODEL_URL = '/fpv.glb';
export const PROJECT_STORAGE_KEY = 'fpv-viewer-project-v1';

export const nowIso = () => new Date().toISOString();

export function createEmptyProject() {
    const now = nowIso();
    return {
        version: PROJECT_VERSION,
        meta: {
            name: 'Untitled Drone Project',
            createdAt: now,
            updatedAt: now
        },
        model: {
            ...DEFAULT_MODEL
        },
        components: []
    };
}

const isString = (value) => typeof value === 'string';
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const normalizeSpec = (spec, index) => {
    if (!spec || typeof spec !== 'object') {
        return {
            key: `Spec ${index + 1}`,
            value: ''
        };
    }

    return {
        key: isString(spec.key) ? spec.key : '',
        value: isString(spec.value) ? spec.value : ''
    };
};

const normalizeComponent = (component, index) => {
    const fallbackId = `component-${index + 1}`;

    const position = Array.isArray(component?.position)
        ? component.position.slice(0, 3).map((value) => (isFiniteNumber(value) ? value : 0))
        : [0, 0, 0];

    while (position.length < 3) {
        position.push(0);
    }

    const specs = Array.isArray(component?.specs)
        ? component.specs.map((spec, specIndex) => normalizeSpec(spec, specIndex))
        : [];

    return {
        id: isString(component?.id) && component.id.trim() ? component.id : fallbackId,
        name: isString(component?.name) && component.name.trim() ? component.name : `Component ${index + 1}`,
        description: isString(component?.description) ? component.description : '',
        specs,
        position
    };
};

export function validateProjectData(input) {
    const errors = [];

    if (!input || typeof input !== 'object') {
        return {
            valid: false,
            errors: ['Project data must be an object.']
        };
    }

    if (input.version !== PROJECT_VERSION) {
        errors.push(`Unsupported project version: ${String(input.version)}.`);
    }

    const meta = input.meta && typeof input.meta === 'object' ? input.meta : {};
    const model = input.model && typeof input.model === 'object' ? input.model : {};

    if (!isString(meta.name) || !meta.name.trim()) {
        errors.push('meta.name is required and must be a string.');
    }

    if (!isString(meta.createdAt) || !meta.createdAt.trim()) {
        errors.push('meta.createdAt is required and must be a string.');
    }

    if (!isString(meta.updatedAt) || !meta.updatedAt.trim()) {
        errors.push('meta.updatedAt is required and must be a string.');
    }

    if (!isString(model.fileName) || !model.fileName.trim()) {
        errors.push('model.fileName is required and must be a string.');
    }

    if (!isString(model.mimeType) || !model.mimeType.trim()) {
        errors.push('model.mimeType is required and must be a string.');
    }

    if (!Array.isArray(input.components)) {
        errors.push('components must be an array.');
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors
        };
    }

    const components = input.components.map((component, index) => normalizeComponent(component, index));

    return {
        valid: true,
        project: {
            version: PROJECT_VERSION,
            meta: {
                name: meta.name,
                createdAt: meta.createdAt,
                updatedAt: meta.updatedAt
            },
            model: {
                fileName: model.fileName,
                mimeType: model.mimeType
            },
            components
        }
    };
}
