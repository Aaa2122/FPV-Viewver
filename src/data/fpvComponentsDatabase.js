/**
 * Curated FPV Components Database
 * 
 * This is a manually curated list of real, popular FPV components
 * Based on community favorites from RotorBuilds, Reddit, and FPV forums
 * 
 * This serves as the seed data that will be enriched with:
 * - Images (via automated scraping)
 * - Prices (via automated price comparison)
 */

const fpvComponentsDatabase = {
    frames: [
        {
            name: "GEPRC GEP-MARK4 HD",
            manufacturer: "GEPRC",
            size: "5\"",
            wheelbase: "225mm",
            weight: 102,
            material: "Carbon T700",
            armThickness: "5mm",
            category: "Freestyle"
        },
        {
            name: "TBS Source One V5",
            manufacturer: "Team BlackSheep",
            size: "5\"",
            wheelbase: "220mm",
            weight: 98,
            material: "Carbon",
            armThickness: "5mm",
            category: "Freestyle/Budget"
        },
        {
            name: "ImpulseRC Apex",
            manufacturer: "ImpulseRC",
            size: "5\"",
            wheelbase: "227mm",
            weight: 115,
            material: "Carbon T800",
            armThickness: "6mm",
            category: "Racing"
        },
        {
            name: "iFlight Nazgul5 V2",
            manufacturer: "iFlight",
            size: "5\"",
            wheelbase: "227mm",
            weight: 110,
            material: "Carbon",
            armThickness: "5mm",
            category: "Freestyle"
        },
        {
            name: "Armattan Chameleon Ti",
            manufacturer: "Armattan",
            size: "5\"",
            wheelbase: "220mm",
            weight: 120,
            material: "Titanium + Carbon",
            armThickness: "6mm",
            category: "Durable/Freestyle"
        }
    ],

    motors: [
        {
            name: "iFlight XING2 2207 1855KV",
            manufacturer: "iFlight",
            size: "2207",
            kv: 1855,
            weight: 30.5,
            configuration: "12N14P",
            shaft: "Titanium 4mm",
            recommendedBattery: ["4S", "6S"],
            category: "Freestyle"
        },
        {
            name: "iFlight XING2 2207 2450KV",
            manufacturer: "iFlight",
            size: "2207",
            kv: 2450,
            weight: 30.5,
            configuration: "12N14P",
            shaft: "Titanium 4mm",
            recommendedBattery: ["4S"],
            category: "Racing"
        },
        {
            name: "EMAX ECO II 2306 1700KV",
            manufacturer: "EMAX",
            size: "2306",
            kv: 1700,
            weight: 32,
            configuration: "12N14P",
            shaft: "Steel 5mm",
            recommendedBattery: ["4S", "6S"],
            category: "Budget/Cruising"
        },
        {
            name: "T-Motor F60 PRO IV 2207 1750KV",
            manufacturer: "T-Motor",
            size: "2207",
            kv: 1750,
            weight: 34,
            configuration: "12N14P",
            shaft: "Titanium 5mm",
            recommendedBattery: ["4S", "6S"],
            category: "Premium/Long Range"
        },
        {
            name: "BrotherHobby Avenger 2306 2450KV",
            manufacturer: "BrotherHobby",
            size: "2306",
            kv: 2450,
            weight: 31,
            configuration: "12N14P",
            shaft: "Steel 5mm",
            recommendedBattery: ["4S"],
            category: "Racing"
        }
    ],

    stacks: [
        {
            name: "SpeedyBee F7 V3 50A",
            manufacturer: "SpeedyBee",
            fc: "F7",
            mcu: "STM32F722",
            gyro: "BMI270",
            escCurrent: 50,
            escProtocol: "BLHeli_32",
            mountingSize: "30.5x30.5",
            weight: 25,
            features: ["Bluetooth", "Blackbox 500MB", "Barometer"]
        },
        {
            name: "Mamba F722 MK3 60A",
            manufacturer: "Diatone",
            fc: "F7",
            mcu: "STM32F722",
            gyro: "MPU6000",
            escCurrent: 60,
            escProtocol: "BLHeli_32",
            mountingSize: "30.5x30.5",
            weight: 28,
            features: ["Dual Gyro", "RGB LED", "OSD"]
        },
        {
            name: "Holybro Kakute H7 V2 55A",
            manufacturer: "Holybro",
            fc: "H7",
            mcu: "STM32H743",
            gyro: "ICM42688P",
            escCurrent: 55,
            escProtocol: "BLHeli_32",
            mountingSize: "30.5x30.5",
            weight: 27,
            features: ["H7 Processor", "Dual BEC", "Blackbox 128MB"]
        },
        {
            name: "JHEMCU GHF722AIO",
            manufacturer: "JHEMCU",
            fc: "F7",
            mcu: "STM32F722",
            gyro: "ICM42688P",
            escCurrent: 40,
            escProtocol: "BLHeli_S",
            mountingSize: "20x20",
            weight: 18,
            features: ["All-in-One", "Budget", "Compact"]
        }
    ],

    cameras: [
        {
            name: "DJI O3 Air Unit",
            manufacturer: "DJI",
            type: "Digital HD",
            sensor: "1/1.7\" CMOS",
            fov: 155,
            latency: 28,
            recording: "4K60",
            transmission: "1080p60",
            weight: 35,
            range: 10000,
            features: ["RockSteady", "20GB Storage", "Auto-focus"]
        },
        {
            name: "Walksnail Avatar HD",
            manufacturer: "Caddx",
            type: "Digital HD",
            sensor: "1/2\" CMOS",
            fov: 150,
            latency: 35,
            recording: "1080p60",
            transmission: "1080p60",
            weight: 28,
            range: 6000,
            features: ["Gyro Data", "OSD", "Affordable"]
        },
        {
            name: "Caddx Ratel 2",
            manufacturer: "Caddx",
            type: "Analog",
            sensor: "1/1.8\" CMOS",
            fov: 160,
            latency: 10,
            recording: "1080p30",
            transmission: "480p",
            weight: 12,
            range: 2000,
            features: ["Low Latency", "WDR", "Budget"]
        },
        {
            name: "RunCam Phoenix 2",
            manufacturer: "RunCam",
            type: "Analog",
            sensor: "1/2\" CMOS",
            fov: 155,
            latency: 12,
            recording: "1080p30",
            transmission: "480p",
            weight: 14,
            range: 1500,
            features: ["Nano Sized", "OSD", "Switchable Latency"]
        }
    ],

    batteries: [
        {
            name: "CNHL Black Series 6S 1300mAh 120C",
            manufacturer: "CNHL",
            cells: 6,
            voltage: 22.2,
            capacity: 1300,
            cRating: 120,
            connector: "XT60",
            weight: 185,
            dimensions: "72x36x38mm",
            category: "Freestyle"
        },
        {
            name: "Tattu R-Line 6S 1550mAh 120C",
            manufacturer: "Tattu",
            cells: 6,
            voltage: 22.2,
            capacity: 1550,
            cRating: 120,
            connector: "XT60",
            weight: 215,
            dimensions: "78x38x42mm",
            category: "Racing"
        },
        {
            name: "CNHL MiniStar 6S 1800mAh 120C",
            manufacturer: "CNHL",
            cells: 6,
            voltage: 22.2,
            capacity: 1800,
            cRating: 120,
            connector: "XT60",
            weight: 245,
            dimensions: "85x42x45mm",
            category: "Long Range"
        },
        {
            name: "GNB 4S 1300mAh 120C",
            manufacturer: "GNB",
            cells: 4,
            voltage: 14.8,
            capacity: 1300,
            cRating: 120,
            connector: "XT60",
            weight: 125,
            dimensions: "72x36x26mm",
            category: "4S Build"
        },
        {
            name: "Tattu R-Line 4S 1550mAh 120C",
            manufacturer: "Tattu",
            cells: 4,
            voltage: 14.8,
            capacity: 1550,
            cRating: 120,
            connector: "XT60",
            weight: 145,
            dimensions: "78x38x28mm",
            category: "4S Racing"
        }
    ],

    props: [
        {
            name: "HQProp 5.1x4.1x3 V1S",
            manufacturer: "HQProp",
            size: "5.1\"",
            pitch: 4.1,
            blades: 3,
            weight: 5.2,
            material: "Polycarbonate",
            category: "Freestyle"
        },
        {
            name: "Gemfan Hurricane 51466",
            manufacturer: "Gemfan",
            size: "5.1\"",
            pitch: 4.6,
            blades: 3,
            weight: 5.5,
            material: "Polycarbonate",
            category: "Racing"
        },
        {
            name: "DAL Cyclone T5046C",
            manufacturer: "DAL",
            size: "5\"",
            pitch: 4.6,
            blades: 3,
            weight: 5.0,
            material: "Polycarbonate",
            category: "Durable"
        }
    ],

    receivers: [
        {
            name: "TBS Crossfire Nano RX",
            manufacturer: "Team BlackSheep",
            protocol: "CRSF",
            range: 50000,
            latency: 12,
            weight: 1.2,
            features: ["Long Range", "Telemetry", "900MHz"]
        },
        {
            name: "ExpressLRS EP1/EP2",
            manufacturer: "ExpressLRS",
            protocol: "ELRS",
            range: 30000,
            latency: 5,
            weight: 0.8,
            features: ["Ultra Low Latency", "Open Source", "2.4GHz"]
        },
        {
            name: "FrSky XM+",
            manufacturer: "FrSky",
            protocol: "SBUS/F.Port",
            range: 1500,
            latency: 9,
            weight: 3.8,
            features: ["Budget", "Reliable", "2.4GHz"]
        }
    ]
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = fpvComponentsDatabase;
}

// Export for ES6
export default fpvComponentsDatabase;
