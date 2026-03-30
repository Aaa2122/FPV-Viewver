export const PROJECT_VERSION = 1;

export const DEFAULT_MODEL = {
    fileName: 'fpv.glb',
    mimeType: 'model/gltf-binary'
};

export const DEFAULT_MODEL_URL = '/fpv.glb';
export const PROJECT_STORAGE_KEY = 'fpv-viewer-project-v2';

export const nowIso = () => new Date().toISOString();

const BASE_COMPONENTS = [
    {
        id: 'fpv-camera',
        name: 'FPV Camera',
        description: 'Wide-angle digital FPV camera module.',
        position: [0.0056, 0.152, -0.6008],
        specs: [
            { key: 'Resolution', value: '1200TVL' },
            { key: 'Latency', value: '<10ms' },
            { key: 'FOV', value: '150deg' }
        ]
    },
    {
        id: 'motor-1',
        name: 'Front-Left Motor',
        description: 'Brushless motor, front-left arm.',
        position: [-0.7472, 0.1808, -0.5864],
        specs: [
            { key: 'KV', value: '1950' },
            { key: 'Rotation', value: 'CW' },
            { key: 'Thrust', value: '1.8kg' }
        ]
    },
    {
        id: 'motor-2',
        name: 'Front-Right Motor',
        description: 'Brushless motor, front-right arm.',
        position: [0.7408, 0.1776, -0.5856],
        specs: [
            { key: 'KV', value: '1950' },
            { key: 'Rotation', value: 'CCW' },
            { key: 'Thrust', value: '1.8kg' }
        ]
    },
    {
        id: 'motor-3',
        name: 'Rear-Left Motor',
        description: 'Brushless motor, rear-left arm.',
        position: [-0.7352, 0.1808, 0.5752],
        specs: [
            { key: 'KV', value: '1950' },
            { key: 'Rotation', value: 'CCW' },
            { key: 'Thrust', value: '1.8kg' }
        ]
    },
    {
        id: 'motor-4',
        name: 'Rear-Right Motor',
        description: 'Brushless motor, rear-right arm.',
        position: [0.7488, 0.1808, 0.5808],
        specs: [
            { key: 'KV', value: '1950' },
            { key: 'Rotation', value: 'CW' },
            { key: 'Thrust', value: '1.8kg' }
        ]
    },
    {
        id: 'fc',
        name: 'Flight Controller',
        description: 'Main FC stack in the center frame.',
        position: [-0.0032, 0.164, -0.0016],
        specs: [
            { key: 'CPU', value: 'STM32F722' },
            { key: 'Gyro', value: 'MPU6000' },
            { key: 'Loop', value: '8kHz' }
        ]
    },
    {
        id: 'battery',
        name: 'Battery 6S',
        description: 'Top-mounted LiPo battery pack.',
        position: [0.0088, 0.4376, 0.0312],
        specs: [
            { key: 'Capacity', value: '1300mAh' },
            { key: 'Voltage', value: '22.2V' },
            { key: 'C-Rating', value: '120C' }
        ]
    }
];

const cloneBaseComponents = () =>
    BASE_COMPONENTS.map((component) => ({
        ...component,
        position: [...component.position],
        specs: component.specs.map((spec) => ({ ...spec }))
    }));

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
        components: cloneBaseComponents()
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
