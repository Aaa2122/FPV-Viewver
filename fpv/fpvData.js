// Données FPV structurées pour le composant FPVSection
export const fpvData = {
    fr: {
        title: "Pilotage de Drone FPV",
        subtitle: "Passion pour le vol en immersion et construction de drones racing custom",
        specsTitle: "Spécifications",
        achievementsTitle: "Réalisations",
        videoPlaceholder: "Vidéo de vol FPV à venir",
    },
    en: {
        title: "FPV Drone Flying",
        subtitle: "Passion for immersive flight and custom racing drone building",
        specsTitle: "Specifications",
        achievementsTitle: "Achievements",
        videoPlaceholder: "FPV flight video coming soon",
    },
    specs: {
        "Type": "5\" Racing Drone",
        "Frame": "Carbon Fiber 220mm",
        "Motors": "2207 1800KV",
        "Battery": "6S 1300mAh LiPo",
        "Weight": "~650g (with battery)",
        "Flight Time": "4-6 minutes",
    },
    achievements: [
        "Construction complète d'un drone FPV custom",
        "Maîtrise du pilotage acrobatique (flips, rolls, power loops)",
        "Réalisation de vidéos cinématiques",
        "Connaissance approfondie en électronique et RF"
    ],
    video: null, // À ajouter plus tard
    components: [
        {
            id: 'frame',
            name: 'Châssis Carbon',
            icon: '🏗️',
            description: 'Châssis en fibre de carbone 5 pouces, ultra-léger et résistant aux chocs. Empattement de 220mm pour un excellent équilibre entre agilité et stabilité.',
            color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            specs: {
                'Matériau': 'Fibre de carbone',
                'Empattement': '220mm',
                'Poids': '85g',
                'Épaisseur': '5mm (bras)'
            },
            features: [
                'Design X-frame optimisé',
                'Protection des composants intégrée',
                'Montage facile et modulaire',
                'Compatible avec caméras GoPro'
            ]
        },
        {
            id: 'fc',
            name: 'Flight Controller',
            icon: '🧠',
            description: 'Contrôleur de vol F7 avec gyroscope haute précision et processeur puissant pour une stabilisation parfaite et des temps de réaction ultra-rapides.',
            color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            specs: {
                'Processeur': 'F7 (STM32F722)',
                'Gyroscope': 'MPU6000',
                'PID Loop': '8kHz',
                'Firmware': 'Betaflight 4.4'
            },
            features: [
                'Blackbox logging intégré',
                'OSD (On-Screen Display)',
                'Barometer et GPS ready',
                'Configuration via Betaflight'
            ]
        },
        {
            id: 'motor-fl',
            name: 'Moteur Avant-Gauche',
            icon: '⚙️',
            description: 'Moteur brushless haute performance 2207 1800KV, optimisé pour les batteries 6S. Excellent rapport poids/puissance.',
            color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            specs: {
                'Modèle': '2207 1800KV',
                'Voltage': '6S (22.2V)',
                'Thrust': '~1.8kg par moteur',
                'Poids': '32g'
            },
            features: [
                'Roulements japonais haute qualité',
                'Refroidissement optimisé',
                'Aimants N52H',
                'Montage T-Mount'
            ]
        },
        {
            id: 'motor-fr',
            name: 'Moteur Avant-Droit',
            icon: '⚙️',
            description: 'Moteur brushless haute performance 2207 1800KV, optimisé pour les batteries 6S. Excellent rapport poids/puissance.',
            color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            specs: {
                'Modèle': '2207 1800KV',
                'Voltage': '6S (22.2V)',
                'Thrust': '~1.8kg par moteur',
                'Poids': '32g'
            },
            features: [
                'Roulements japonais haute qualité',
                'Refroidissement optimisé',
                'Aimants N52H',
                'Montage T-Mount'
            ]
        },
        {
            id: 'motor-bl',
            name: 'Moteur Arrière-Gauche',
            icon: '⚙️',
            description: 'Moteur brushless haute performance 2207 1800KV, optimisé pour les batteries 6S. Excellent rapport poids/puissance.',
            color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            specs: {
                'Modèle': '2207 1800KV',
                'Voltage': '6S (22.2V)',
                'Thrust': '~1.8kg par moteur',
                'Poids': '32g'
            },
            features: [
                'Roulements japonais haute qualité',
                'Refroidissement optimisé',
                'Aimants N52H',
                'Montage T-Mount'
            ]
        },
        {
            id: 'motor-br',
            name: 'Moteur Arrière-Droit',
            icon: '⚙️',
            description: 'Moteur brushless haute performance 2207 1800KV, optimisé pour les batteries 6S. Excellent rapport poids/puissance.',
            color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            specs: {
                'Modèle': '2207 1800KV',
                'Voltage': '6S (22.2V)',
                'Thrust': '~1.8kg par moteur',
                'Poids': '32g'
            },
            features: [
                'Roulements japonais haute qualité',
                'Refroidissement optimisé',
                'Aimants N52H',
                'Montage T-Mount'
            ]
        },
        {
            id: 'camera',
            name: 'Caméra FPV',
            icon: '📹',
            description: 'Caméra analogique 1200TVL pour retour vidéo en temps réel. Objectif 2.1mm pour un large champ de vision. WDR pour une bonne image en toutes conditions.',
            color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            specs: {
                'Résolution': '1200TVL',
                'Objectif': '2.1mm',
                'WDR': 'Oui',
                'Latence': '<10ms'
            },
            features: [
                'Wide Dynamic Range (WDR)',
                'Angle de vue 150°',
                'Réglage d\'angle ajustable',
                'Faible latence pour le FPV'
            ]
        },
        {
            id: 'battery',
            name: 'Batterie LiPo 6S',
            icon: '🔋',
            description: 'Batterie Lithium Polymère 6S 1300mAh avec taux de décharge 120C. Fournit la puissance nécessaire pour des vols acrobatiques intenses.',
            color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            specs: {
                'Voltage': '6S (22.2V)',
                'Capacité': '1300mAh',
                'Décharge': '120C',
                'Poids': '185g'
            },
            features: [
                'Haute densité énergétique',
                'Connecteur XT60',
                'Balance charging',
                '4-6 minutes de vol'
            ]
        }
    ]
};
