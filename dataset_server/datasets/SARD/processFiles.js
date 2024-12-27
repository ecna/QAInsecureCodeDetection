const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'source_files');
const sardFilePath = path.join(__dirname, 'dataset_server', 'datasets', 'SARD_source.JSON');
const sardData = JSON.parse(fs.readFileSync(sardFilePath, 'utf8'));

function getRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function processFile(filePath) {
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    let goodCode = '';
    let badCode = '';

    const lines = fileContent.split('\n');
    let currentGroup = '';
    let currentFunction = '';

    for (let line of lines) {
        line = line.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''); // Remove comments
        line = line.replace(/printLine\(.*?\);/g, ''); // Replace printLine calls with empty strings

        if (line.includes('main(')) {
            currentGroup = ''; // Skip main function
            continue;
        }

        const functionMatch = line.match(/void\s+(\w+)\s*\(/);
        if (functionMatch) {
            currentFunction = getRandomString(10);
            line = line.replace(functionMatch[1], currentFunction);

            if (functionMatch[1].includes('good')) {
                currentGroup = 'good';
            } else if (functionMatch[1].includes('bad')) {
                currentGroup = 'bad';
            } else {
                currentGroup = '';
            }
        }

        if (currentGroup === 'good') {
            goodCode += line + '\n';
        } else if (currentGroup === 'bad') {
            badCode += line + '\n';
        }
    }

    sardData[fileName] = {
        goodCode: goodCode.trim(),
        badCode: badCode.trim(),
        result: ''
    };
}

fs.readdirSync(sourceDir).forEach(file => {
    if (path.extname(file) === '.cpp') {
        processFile(path.join(sourceDir, file));
    }
});

fs.writeFileSync(sardFilePath, JSON.stringify(sardData, null, 4));
console.log('SARD_source.JSON updated successfully.');