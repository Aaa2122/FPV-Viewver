/**
 * Performance Calculator for FPV Drone Builds
 * 
 * This utility calculates various performance metrics based on selected components.
 * All calculations are estimates based on real-world FPV data.
 */

/**
 * Calculate total weight of the build in grams
 * @param {Object} components - Selected components {frame, motors, stack, camera, battery}
 * @returns {number} Total weight in grams
 */
export function calculateTotalWeight(components) {
    let totalWeight = 0;

    if (components.frame) totalWeight += components.frame.weight;
    if (components.motors) totalWeight += components.motors.weight * 4; // 4 motors
    if (components.stack) totalWeight += components.stack.weight;
    if (components.camera) totalWeight += components.camera.weight;
    if (components.battery) totalWeight += components.battery.weight;

    // Add estimated weight for additional components not in catalog
    const additionalWeight = {
        props: 20,        // 4x props ~5g each
        screws: 10,       // Screws and hardware
        wiring: 15,       // XT60, wires, connectors
        receiver: 8,      // RX for radio
        antennas: 5,      // VTX/RX antennas
        straps: 5,        // Battery strap
        gopro: 0          // Optional, user can add manually
    };

    totalWeight += Object.values(additionalWeight).reduce((sum, w) => sum + w, 0);

    return Math.round(totalWeight);
}

/**
 * Calculate thrust-to-weight ratio
 * Higher is better (>5 for freestyle, >8 for racing)
 * 
 * @param {Object} components - Selected components
 * @returns {Object} { ratio: number, rating: string, description: string }
 */
export function calculateThrustToWeight(components) {
    const totalWeight = calculateTotalWeight(components);
    const motor = components.motors;

    if (!motor) {
        return { ratio: 0, rating: 'unknown', description: 'No motor selected' };
    }

    // Total thrust = thrust per motor * 4 motors
    const totalThrust = motor.maxThrust * 4;
    const ratio = totalThrust / totalWeight;

    // Rating based on typical FPV standards
    let rating, description;
    if (ratio < 3) {
        rating = 'poor';
        description = 'Underpowered - Not suitable for FPV';
    } else if (ratio < 5) {
        rating = 'acceptable';
        description = 'Good for cinematic/long range';
    } else if (ratio < 8) {
        rating = 'good';
        description = 'Great for freestyle flying';
    } else if (ratio < 12) {
        rating = 'excellent';
        description = 'Perfect for aggressive freestyle/racing';
    } else {
        rating = 'extreme';
        description = 'Extreme power - Racing optimized';
    }

    return {
        ratio: parseFloat(ratio.toFixed(2)),
        rating,
        description,
        totalThrust,
        totalWeight
    };
}

/**
 * Estimate flight time in minutes
 * Based on battery capacity, average current draw, and weight
 * 
 * Formula: Flight Time (min) = (Battery Capacity (mAh) / Average Current (mA)) * 60
 * Average current depends on flying style and weight
 * 
 * @param {Object} components - Selected components
 * @param {string} flyingStyle - 'cruising' | 'freestyle' | 'racing'
 * @returns {Object} Flight time estimates
 */
export function estimateFlightTime(components, flyingStyle = 'freestyle') {
    const battery = components.battery;
    const totalWeight = calculateTotalWeight(components);

    if (!battery) {
        return { min: 0, max: 0, avg: 0, style: flyingStyle };
    }

    // Estimate average current based on flying style and weight
    // These are empirical values from real FPV flying
    const currentMultipliers = {
        cruising: 0.08,    // 8A per 100g at cruise
        freestyle: 0.15,   // 15A per 100g freestyle
        racing: 0.25       // 25A per 100g racing
    };

    const avgCurrentPerGram = currentMultipliers[flyingStyle] || currentMultipliers.freestyle;
    const avgCurrent = totalWeight * avgCurrentPerGram; // in Amps

    // Flight time formula: (Capacity in Ah / Current in A) * 60 * efficiency
    const capacityAh = battery.capacity / 1000;
    const efficiency = 0.85; // 85% usable capacity (don't drain to 0%)

    const flightTimeMinutes = (capacityAh / avgCurrent) * 60 * efficiency;

    // Calculate range (min/max based on ±20% variance)
    const variance = 0.2;
    const minTime = flightTimeMinutes * (1 - variance);
    const maxTime = flightTimeMinutes * (1 + variance);

    return {
        min: parseFloat(minTime.toFixed(1)),
        max: parseFloat(maxTime.toFixed(1)),
        avg: parseFloat(flightTimeMinutes.toFixed(1)),
        style: flyingStyle,
        avgCurrent: Math.round(avgCurrent)
    };
}

/**
 * Estimate maximum speed in km/h
 * Based on motor KV, voltage, and prop size
 * 
 * This is a simplified calculation
 * Real speed depends on many factors (props, weight, aerodynamics)
 * 
 * @param {Object} components - Selected components
 * @returns {Object} Speed estimates
 */
export function estimateMaxSpeed(components) {
    const motor = components.motors;
    const battery = components.battery;

    if (!motor || !battery) {
        return { maxSpeed: 0, cruiseSpeed: 0, unit: 'km/h' };
    }

    // Simplified formula: RPM = KV * Voltage
    // Speed (km/h) = (RPM * Prop Pitch * 60) / 1,000,000 * π
    // We'll use empirical approximations instead

    const kv = motor.kv;
    const voltage = battery.voltage;

    // Empirical formula based on real FPV data
    // Speed roughly scales with KV and voltage
    const baseSpeed = (kv * voltage) / 180; // Approximation factor

    // Adjust for weight (heavier = slightly slower)
    const totalWeight = calculateTotalWeight(components);
    const weightFactor = 1 - ((totalWeight - 500) / 5000); // Penalty for weight over 500g

    const maxSpeed = baseSpeed * weightFactor;
    const cruiseSpeed = maxSpeed * 0.6; // Cruise is typically 60% of max

    return {
        maxSpeed: Math.round(maxSpeed),
        cruiseSpeed: Math.round(cruiseSpeed),
        unit: 'km/h',
        note: 'Estimated - Actual speed varies with props and conditions'
    };
}

/**
 * Calculate total cost of the build
 * @param {Object} components - Selected components
 * @returns {Object} Cost breakdown
 */
export function calculateTotalCost(components) {
    let total = 0;
    const breakdown = {};

    if (components.frame) {
        breakdown.frame = components.frame.price;
        total += components.frame.price;
    }

    if (components.motors) {
        const motorCost = components.motors.pricePerSet || (components.motors.price * 4);
        breakdown.motors = motorCost;
        total += motorCost;
    }

    if (components.stack) {
        breakdown.stack = components.stack.price;
        total += components.stack.price;
    }

    if (components.camera) {
        breakdown.camera = components.camera.price;
        total += components.camera.price;
    }

    if (components.battery) {
        breakdown.battery = components.battery.price;
        total += components.battery.price;
    }

    // Estimate additional costs
    const additionalCosts = {
        props: 12,        // Set of props
        hardware: 8,      // Screws, standoffs
        receiver: 25,     // RX
        antennas: 15,     // Various antennas
        misc: 20          // Straps, wire, connectors
    };

    breakdown.additional = Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
    total += breakdown.additional;

    return {
        total: Math.round(total),
        breakdown,
        currency: '€',
        note: 'Prices are estimates and may vary'
    };
}

/**
 * Check component compatibility and return warnings/errors
 * @param {Object} components - Selected components
 * @param {Object} compatibilityRules - Rules from componentCatalog
 * @returns {Array} Array of compatibility issues
 */
export function checkCompatibility(components, compatibilityRules) {
    const issues = [];

    // Check motor-frame compatibility
    if (components.motors && components.frame && compatibilityRules.checkMotorFrameCompatibility) {
        if (!compatibilityRules.checkMotorFrameCompatibility(components.motors, components.frame)) {
            issues.push({
                type: 'error',
                components: ['motors', 'frame'],
                message: `Motor size ${components.motors.size} may not fit ${components.frame.name} frame`
            });
        }
    }

    // Check stack-frame compatibility
    if (components.stack && components.frame && compatibilityRules.checkStackFrameCompatibility) {
        if (!compatibilityRules.checkStackFrameCompatibility(components.stack, components.frame)) {
            issues.push({
                type: 'error',
                components: ['stack', 'frame'],
                message: `Stack mounting size ${components.stack.mountingSize} incompatible with frame`
            });
        }
    }

    // Check battery-motor compatibility
    if (components.battery && components.motors && compatibilityRules.checkBatteryMotorCompatibility) {
        if (!compatibilityRules.checkBatteryMotorCompatibility(components.battery, components.motors)) {
            const batteryType = `${components.battery.cells}S`;
            issues.push({
                type: 'warning',
                components: ['battery', 'motors'],
                message: `${batteryType} battery not recommended for ${components.motors.kv}KV motors`
            });
        }
    }

    // Check battery weight warning
    if (components.battery && compatibilityRules.checkBatteryWeightWarning) {
        const warning = compatibilityRules.checkBatteryWeightWarning(components.battery);
        if (warning) {
            issues.push({
                type: warning.level,
                components: ['battery'],
                message: warning.message
            });
        }
    }

    // Check camera type info
    if (components.camera && compatibilityRules.checkCameraTypeWarning) {
        const info = compatibilityRules.checkCameraTypeWarning(components.camera);
        if (info) {
            issues.push({
                type: info.level,
                components: ['camera'],
                message: info.message
            });
        }
    }

    return issues;
}

/**
 * Generate a comprehensive performance report
 * @param {Object} components - Selected components
 * @param {Object} compatibilityRules - Compatibility rules
 * @returns {Object} Complete performance analysis
 */
export function generatePerformanceReport(components, compatibilityRules) {
    return {
        weight: calculateTotalWeight(components),
        thrustToWeight: calculateThrustToWeight(components),
        flightTime: {
            cruising: estimateFlightTime(components, 'cruising'),
            freestyle: estimateFlightTime(components, 'freestyle'),
            racing: estimateFlightTime(components, 'racing')
        },
        speed: estimateMaxSpeed(components),
        cost: calculateTotalCost(components),
        compatibility: checkCompatibility(components, compatibilityRules),
        generatedAt: new Date().toISOString()
    };
}

/**
 * Get a text summary of the build for display
 * @param {Object} report - Performance report from generatePerformanceReport
 * @returns {string} Human-readable summary
 */
export function getPerformanceSummary(report) {
    const { thrustToWeight, flightTime, speed, cost } = report;

    return `
Build Performance Summary:
- Weight: ${report.weight}g
- Thrust/Weight: ${thrustToWeight.ratio}:1 (${thrustToWeight.rating})
- Flight Time: ${flightTime.freestyle.avg} min (freestyle)
- Max Speed: ~${speed.maxSpeed} km/h
- Total Cost: ${cost.total}${cost.currency}
- Rating: ${thrustToWeight.description}
    `.trim();
}
