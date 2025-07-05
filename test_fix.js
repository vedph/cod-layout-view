// Quick test to verify the fixes work
import { ITCodLayoutFormulaService } from './src/it-cod-layout-formula.service.js';

const service = new ITCodLayoutFormulaService();

// Test formula from the first image (IT formula)
const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [5 / 50 / 5* (20) 5 / 40] 5 / 15";
console.log("Testing formula:", formula);

try {
    const parsed = service.parseFormula(formula);
    console.log("Parsed successfully:", parsed);
    
    if (parsed) {
        const svg = service.buildSvg(parsed, {
            showVertical: true,
            showHorizontal: true,
            showValueLabels: true
        });
        
        console.log("SVG generated successfully");
        console.log("SVG contains bottom line:", svg.includes('stroke="#000" stroke-width="1"'));
        console.log("SVG contains vertical labels with rotation:", svg.includes('transform="rotate(-90'));
        console.log("SVG length:", svg.length);
    }
} catch (error) {
    console.error("Error:", error);
}
