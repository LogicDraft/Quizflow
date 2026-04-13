const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:/Users/gowda/Downloads/Anti Neo Project/Quizflow/client/src');

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Replace Neon Cyan (6,247,217) with Soft Sage (172,200,162)
            content = content.replace(/rgba\(\s*6\s*,\s*247\s*,\s*217\s*/g, 'rgba(172,200,162');
            
            // Replace Neon Violet (124,92,252) with Dark Sage (104,138,93)
            content = content.replace(/rgba\(\s*124\s*,\s*92\s*,\s*252\s*/g, 'rgba(104,138,93');
            
            // Replace Neon Pink (255,61,110) with Muted Red (169,90,90) - Error states
            content = content.replace(/rgba\(\s*255\s*,\s*61\s*,\s*110\s*/g, 'rgba(169,90,90');
            
            // Replace Neon Green (13,242,160) with Muted Green (135,185,125) - Correct states
            content = content.replace(/rgba\(\s*13\s*,\s*242\s*,\s*160\s*/g, 'rgba(163,196,152');

            // ANSWER_COLORS Hex Replacement in HostDashboard and PlayerScreen
            content = content.replace(/bg:\s*"#ff3d6e"/g, 'bg: "#A95A5A"'); // Red -> Earthy Red
            content = content.replace(/bg:\s*"#06f7d9"/g, 'bg: "#ACC8A2"'); // Cyan -> Sage
            content = content.replace(/bg:\s*"#ffb938"/g, 'bg: "#CDB07B"'); // Amber -> Mustard
            content = content.replace(/bg:\s*"#0df2a0"/g, 'bg: "#6B8E5F"'); // Green -> Forest Green
            
            // Replace Podium colors Hex
            content = content.replace(/color:\s*"#ffb938"/g, 'color: "#D5B978"'); // 1st
            content = content.replace(/color:\s*"#94a3b8"/g, 'color: "#A2AAA2"'); // 2nd
            content = content.replace(/color:\s*"#cd7c30"/g, 'color: "#A98E6C"'); // 3rd

            // Leaderboard hardcoded colors
            content = content.replace(/rgba\(255,185,56/g, 'rgba(213,185,120');
            content = content.replace(/rgba\(200,200,220/g, 'rgba(162,170,162');
            content = content.replace(/rgba\(176,120,60/g, 'rgba(169,142,108');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated theme in:', fullPath);
            }
        }
    });
}

traverse(srcDir);
