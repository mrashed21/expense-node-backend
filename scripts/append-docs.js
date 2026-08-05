const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, '../docs/api-audit.md');
const masterPath = path.join(__dirname, '../docs/mobile-app.md');

const auditContent = fs.readFileSync(auditPath, 'utf8');
let masterContent = fs.readFileSync(masterPath, 'utf8');

// Replace the "Next Steps" section at the end of mobile-app.md
masterContent = masterContent.replace('Before implementing UI (Sprint 02), a full audit of the existing backend API must be performed and documented here.', 'The full API Audit (Sprint 02) has been completed and is documented below.\n\n---\n\n' + auditContent);

fs.writeFileSync(masterPath, masterContent);
console.log('Appended api-audit.md to mobile-app.md');
