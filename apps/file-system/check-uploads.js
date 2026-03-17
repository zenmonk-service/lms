const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    
    if (files.length === 0) {
    } else {
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
        });
    }
}

const publicDir = path.join(process.cwd(), 'public');

if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    
    if (files.length === 0) {
    } else {
        files.forEach(file => {
            const filePath = path.join(publicDir, file);
            fs.statSync(filePath);
        });
    }
}
