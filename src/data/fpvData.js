// Données FPV structurées pour le composant FPVSection
export const fpvData = {
    fr: {
        title: "GEP-MARK4",
        subtitle: "Configuration Freestyle & Cinématique Compétitive",
        specsTitle: "Spécifications",
        achievementsTitle: "Réalisations",
        videoPlaceholder: "Vidéo de vol FPV à venir",
    },
    en: {
        title: "GEP-MARK4",
        subtitle: "Competitive Freestyle & Cinematic Build",
        specsTitle: "Specifications",
        achievementsTitle: "Achievements",
        videoPlaceholder: "FPV flight video coming soon",
    },
    specs: {
        "Type": "5\" Freestyle",
        "Frame": "GEP-MARK4",
        "Motors": "XING2 2207",
        "Stack": "SpeedyBee F7 V3",
        "VTX": "DJI O3 Air Unit",
        "Weight": "650g AUW",
    },
    achievements: [
        "Construction intégrale custom",
        "Tuning PID & Filtres Blackbox",
        "Vols Long Range (>2km)",
        "Dive Building & Powerloops"
    ],
    video: null,
    components: [
        {
            id: 'frame',
            name: 'Frame GEP-MARK4',
            description: 'Châssis 5 pouces en fibre de carbone T700. Géométrie Squashed-X pour un meilleur champ de vision sans hélices dans l\'image.',
            color: '#334155',
            specs: {
                'Matériau': 'Carbone T700',
                'Empattement': '225mm',
                'Poids': '102g',
                'Armes': '5mm'
            },
            features: [
                'Carbone haute rigidité',
                'Support GoPro intégré',
                'Centre de gravité bas',
                'Protection caméra 7075'
            ]
        },
        {
            id: 'fc',
            name: 'SpeedyBee F7 V3',
            description: 'Stack de contrôle de vol haute performance. Processeur F722 et ESC 50A BLHeli_32 capable de gérer des courants de pointe énormes.',
            color: '#eab308',
            specs: {
                'MCU': 'STM32F722',
                'Gyro': 'BMI270',
                'ESC': '50A 4-in-1',
                'Bluetooth': 'Intégré'
            },
            features: [
                'Configuration sans fil',
                'Blackbox 500MB',
                'Baromètre intégré',
                'Support LED WS2812'
            ]
        },
        {
            id: 'motor-fl',
            name: 'XING2 2207 (Av-G)',
            description: 'Moteurs légendaires pour leur fluidité et durabilité. Arbre en alliage de titane et cloche unibody 7075.',
            color: '#3b82f6',
            specs: {
                'KV': '1855KV',
                'Config': '12N14P',
                'Arbre': 'Titane 4mm',
                'Poids': '30.5g'
            },
            features: [
                'Roulements NSK 9x4x4',
                'Protection IP53',
                'Aimants N52H Arc',
                'Équilibrage dynamique'
            ]
        },
        {
            id: 'motor-fr',
            name: 'XING2 2207 (Av-D)',
            description: 'Moteurs légendaires pour leur fluidité et durabilité. Arbre en alliage de titane et cloche unibody 7075.',
            color: '#3b82f6',
            specs: {
                'KV': '1855KV',
                'Config': '12N14P',
                'Arbre': 'Titane 4mm',
                'Poids': '30.5g'
            },
            features: [
                'Roulements NSK 9x4x4',
                'Protection IP53',
                'Aimants N52H Arc',
                'Équilibrage dynamique'
            ]
        },
        {
            id: 'motor-bl',
            name: 'XING2 2207 (Ar-G)',
            description: 'Moteurs légendaires pour leur fluidité et durabilité. Arbre en alliage de titane et cloche unibody 7075.',
            color: '#3b82f6',
            specs: {
                'KV': '1855KV',
                'Config': '12N14P',
                'Arbre': 'Titane 4mm',
                'Poids': '30.5g'
            },
            features: [
                'Roulements NSK 9x4x4',
                'Protection IP53',
                'Aimants N52H Arc',
                'Équilibrage dynamique'
            ]
        },
        {
            id: 'motor-br',
            name: 'XING2 2207 (Ar-D)',
            description: 'Moteurs légendaires pour leur fluidité et durabilité. Arbre en alliage de titane et cloche unibody 7075.',
            color: '#3b82f6',
            specs: {
                'KV': '1855KV',
                'Config': '12N14P',
                'Arbre': 'Titane 4mm',
                'Poids': '30.5g'
            },
            features: [
                'Roulements NSK 9x4x4',
                'Protection IP53',
                'Aimants N52H Arc',
                'Équilibrage dynamique'
            ]
        },
        {
            id: 'camera',
            name: 'DJI O3 Air Unit',
            description: 'Système de transmission vidéo numérique nouvelle génération. Enregistre en 4K/60fps tout en transmettant en 1080p avec latence <30ms.',
            color: '#ec4899',
            specs: {
                'Capteur': '1/1.7" CMOS',
                'FOV': '155°',
                'Latence': '28ms',
                'Portée': '10km'
            },
            features: [
                'Stabilisation RockSteady',
                'Mémoire interne 20GB',
                'Mode Canvas OSD',
                'Auto-focus'
            ]
        },
        {
            id: 'battery',
            name: 'CNHL Black 6S',
            description: 'La source d\'énergie. LiPo 6S 1300mAh avec un taux de décharge de 120C pour des appels de courant instantanés.',
            color: '#ef4444',
            specs: {
                'Voltage': '22.2V (6S)',
                'Capacité': '1300mAh',
                'C-Rate': '120C',
                'Connecteur': 'XT60'
            },
            features: [
                'Cellules haute densité',
                'Câbles AWG12',
                'Résistance interne faible',
                'Format compact'
            ]
        }
    ]
};
