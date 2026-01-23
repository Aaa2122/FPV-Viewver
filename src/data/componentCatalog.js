// Component Catalog for FPV Build Configurator
// This database contains various components that users can swap in the configurator

export const componentCatalog = {
    frames: [
        {
            id: 'gep-mark4',
            name: 'GEP-MARK4',
            brand: 'GEPRC',
            size: '5"',
            material: 'Carbon T700',
            wheelbase: '225mm',
            weight: 102,
            armThickness: '5mm',
            price: 45,
            color: '#334155',
            features: ['Squashed-X geometry', 'Integrated GoPro mount', 'Low center of gravity', '7075 camera protection'],
            compatibility: {
                motorSize: ['2207', '2306'],
                stackSize: ['30.5x30.5', '20x20']
            },
            inStock: true
        },
        {
            id: 'source-one-v5',
            name: 'Source One V5',
            brand: 'TBS',
            size: '5"',
            material: 'Carbon T700',
            wheelbase: '220mm',
            weight: 98,
            armThickness: '5mm',
            price: 35,
            color: '#1e293b',
            features: ['Open source design', 'Modular arms', 'TPU parts available', 'Budget friendly'],
            compatibility: {
                motorSize: ['2207', '2306', '2208'],
                stackSize: ['30.5x30.5', '20x20']
            },
            inStock: true
        },
        {
            id: 'apex-5',
            name: 'Apex 5"',
            brand: 'ImpulseRC',
            size: '5"',
            material: 'Carbon T800',
            wheelbase: '227mm',
            weight: 115,
            armThickness: '6mm',
            price: 89,
            color: '#0f172a',
            features: ['Premium carbon', 'Reinforced arms', 'Racing optimized', 'Dual VTX mount'],
            compatibility: {
                motorSize: ['2207', '2306', '2208'],
                stackSize: ['30.5x30.5']
            },
            inStock: true
        }
    ],

    motors: [
        {
            id: 'xing2-2207-1855',
            name: 'XING2 2207 1855KV',
            brand: 'iFlight',
            size: '2207',
            kv: 1855,
            configuration: '12N14P',
            shaftDiameter: '4mm',
            shaftMaterial: 'Titanium',
            weight: 30.5,
            price: 25,
            pricePerSet: 100,
            color: '#3b82f6',
            maxThrust: 1850, // grams per motor
            features: ['NSK 9x4x4 bearings', 'IP53 protection', 'N52H Arc magnets', 'Dynamic balancing'],
            recommendedBattery: ['4S', '6S'],
            recommendedProps: ['5.1"', '5"'],
            inStock: true
        },
        {
            id: 'xing2-2207-2450',
            name: 'XING2 2207 2450KV',
            brand: 'iFlight',
            size: '2207',
            kv: 2450,
            configuration: '12N14P',
            shaftDiameter: '4mm',
            shaftMaterial: 'Titanium',
            weight: 30.5,
            price: 25,
            pricePerSet: 100,
            color: '#3b82f6',
            maxThrust: 2100,
            features: ['NSK bearings', 'IP53 protection', 'High KV for racing', 'Unibell design'],
            recommendedBattery: ['4S'],
            recommendedProps: ['5.1"', '5"'],
            inStock: true
        },
        {
            id: 'emax-eco-2306',
            name: 'EMAX ECO II 2306 1700KV',
            brand: 'EMAX',
            size: '2306',
            kv: 1700,
            configuration: '12N14P',
            shaftDiameter: '5mm',
            shaftMaterial: 'Steel',
            weight: 32,
            price: 18,
            pricePerSet: 72,
            color: '#8b5cf6',
            maxThrust: 1680,
            features: ['Budget friendly', 'Efficient for cruising', 'Good for 6S', 'Durable'],
            recommendedBattery: ['4S', '5S', '6S'],
            recommendedProps: ['5.1"', '5"'],
            inStock: true
        },
        {
            id: 't-motor-f60-pro-iv',
            name: 'T-Motor F60 PRO IV 2207 1750KV',
            brand: 'T-Motor',
            size: '2207',
            kv: 1750,
            configuration: '12N14P',
            shaftDiameter: '5mm',
            shaftMaterial: 'Titanium',
            weight: 34,
            price: 32,
            pricePerSet: 128,
            color: '#ef4444',
            maxThrust: 2050,
            features: ['Premium bearings', 'Ultra smooth', 'Long range optimized', 'Low noise'],
            recommendedBattery: ['4S', '6S'],
            recommendedProps: ['5.1"', '5"', '6"'],
            inStock: true
        }
    ],

    stacks: [
        {
            id: 'speedybee-f7-v3',
            name: 'SpeedyBee F7 V3',
            brand: 'SpeedyBee',
            mcu: 'STM32F722',
            gyro: 'BMI270',
            escCurrent: 50,
            escProtocol: 'BLHeli_32',
            mountingSize: '30.5x30.5',
            weight: 25,
            price: 95,
            color: '#eab308',
            features: ['Bluetooth configuration', '500MB Blackbox', 'Integrated barometer', 'WS2812 LED support'],
            hasBarometer: true,
            hasBlacbox: true,
            blackboxSize: '500MB',
            inStock: true
        },
        {
            id: 'mamba-f722-mk3',
            name: 'Mamba F722 MK3',
            brand: 'Diatone',
            mcu: 'STM32F722',
            gyro: 'MPU6000',
            escCurrent: 60,
            escProtocol: 'BLHeli_32',
            mountingSize: '30.5x30.5',
            weight: 28,
            price: 105,
            color: '#f59e0b',
            features: ['60A ESC', 'Dual gyro support', 'RGB LED strip', 'OSD'],
            hasBarometer: false,
            hasBlacbox: true,
            blackboxSize: '16MB',
            inStock: true
        },
        {
            id: 'kakute-h7',
            name: 'Kakute H7 V2',
            brand: 'Holybro',
            mcu: 'STM32H743',
            gyro: 'ICM42688P',
            escCurrent: 55,
            escProtocol: 'BLHeli_32',
            mountingSize: '30.5x30.5',
            weight: 27,
            price: 115,
            color: '#f97316',
            features: ['H7 processor', 'Fast gyro', 'Dual BEC', 'OSD'],
            hasBarometer: true,
            hasBlacbox: true,
            blackboxSize: '128MB',
            inStock: true
        }
    ],

    cameras: [
        {
            id: 'dji-o3',
            name: 'DJI O3 Air Unit',
            brand: 'DJI',
            type: 'digital',
            sensor: '1/1.7" CMOS',
            fov: '155°',
            latency: 28,
            maxRange: 10000, // meters
            recordingResolution: '4K60',
            transmissionResolution: '1080p60',
            weight: 35,
            price: 229,
            color: '#ec4899',
            features: ['RockSteady stabilization', '20GB internal storage', 'Canvas OSD', 'Auto-focus'],
            inStock: true
        },
        {
            id: 'walksnail-avatar-hd',
            name: 'Walksnail Avatar HD',
            brand: 'Caddx',
            type: 'digital',
            sensor: '1/2" CMOS',
            fov: '150°',
            latency: 35,
            maxRange: 6000,
            recordingResolution: '1080p60',
            transmissionResolution: '1080p60',
            weight: 28,
            price: 159,
            color: '#a855f7',
            features: ['60fps recording', 'Gyro data', 'OSD', 'Affordable digital'],
            inStock: true
        },
        {
            id: 'caddx-ratel-2',
            name: 'Caddx Ratel 2',
            brand: 'Caddx',
            type: 'analog',
            sensor: '1/1.8" CMOS',
            fov: '160°',
            latency: 10,
            maxRange: 2000,
            recordingResolution: '1080p30',
            transmissionResolution: '720p',
            weight: 12,
            price: 45,
            color: '#06b6d4',
            features: ['Low latency', 'Lightweight', 'WDR', 'Budget friendly'],
            inStock: true
        }
    ],

    batteries: [
        {
            id: 'cnhl-black-6s-1300',
            name: 'CNHL Black 6S 1300mAh',
            brand: 'CNHL',
            cells: 6,
            voltage: 22.2,
            capacity: 1300,
            cRating: 120,
            connector: 'XT60',
            weight: 185,
            price: 32,
            color: '#ef4444',
            features: ['High density cells', 'AWG12 wires', 'Low internal resistance', 'Compact format'],
            dimensions: { length: 72, width: 36, height: 38 },
            inStock: true
        },
        {
            id: 'tattu-r-line-6s-1550',
            name: 'Tattu R-Line 6S 1550mAh',
            brand: 'Tattu',
            cells: 6,
            voltage: 22.2,
            capacity: 1550,
            cRating: 120,
            connector: 'XT60',
            weight: 215,
            price: 42,
            color: '#dc2626',
            features: ['Racing optimized', 'High discharge', 'Graphene technology', 'Premium cells'],
            dimensions: { length: 78, width: 38, height: 42 },
            inStock: true
        },
        {
            id: 'cnhl-6s-1800',
            name: 'CNHL MiniStar 6S 1800mAh',
            brand: 'CNHL',
            cells: 6,
            voltage: 22.2,
            capacity: 1800,
            cRating: 120,
            connector: 'XT60',
            weight: 245,
            price: 38,
            color: '#f87171',
            features: ['Long flight time', 'Budget friendly', 'Reliable', 'Good for cruising'],
            dimensions: { length: 85, width: 42, height: 45 },
            inStock: true
        },
        {
            id: 'cnhl-black-4s-1300',
            name: 'CNHL Black 4S 1300mAh',
            brand: 'CNHL',
            cells: 4,
            voltage: 14.8,
            capacity: 1300,
            cRating: 120,
            connector: 'XT60',
            weight: 125,
            price: 22,
            color: '#fca5a5',
            features: ['Lightweight', '4S build', 'High discharge', 'Efficient'],
            dimensions: { length: 72, width: 36, height: 26 },
            inStock: true
        }
    ]
};

// Default build configuration (current GEP-MARK4)
export const defaultBuild = {
    id: 'gep-mark4-freestyle',
    name: 'GEP-MARK4 Freestyle Build',
    frame: 'gep-mark4',
    motors: 'xing2-2207-1855',
    stack: 'speedybee-f7-v3',
    camera: 'dji-o3',
    battery: 'cnhl-black-6s-1300',
    props: '5.1" (not in catalog yet)',
    notes: 'Optimized for freestyle and cinematic flying'
};

// Compatibility rules
export const compatibilityRules = {
    // Check if motor size is compatible with frame
    checkMotorFrameCompatibility: (motor, frame) => {
        if (!frame.compatibility?.motorSize) return true;
        return frame.compatibility.motorSize.includes(motor.size);
    },

    // Check if stack mounting size is compatible with frame
    checkStackFrameCompatibility: (stack, frame) => {
        if (!frame.compatibility?.stackSize) return true;
        return frame.compatibility.stackSize.includes(stack.mountingSize);
    },

    // Check if battery voltage is appropriate for motor KV
    checkBatteryMotorCompatibility: (battery, motor) => {
        const batteryType = battery.cells === 4 ? '4S' : battery.cells === 6 ? '6S' : `${battery.cells}S`;
        return motor.recommendedBattery?.includes(batteryType) ?? true;
    },

    // Warning for heavy batteries
    checkBatteryWeightWarning: (battery) => {
        return battery.weight > 200 ? {
            level: 'warning',
            message: 'Heavy battery may reduce agility for freestyle'
        } : null;
    },

    // Digital camera requires digital VTX (not analog)
    checkCameraTypeWarning: (camera) => {
        if (camera.type === 'analog') {
            return {
                level: 'info',
                message: 'Analog camera requires separate VTX (not included in catalog yet)'
            };
        }
        return null;
    }
};
