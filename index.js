const CONFIG = require('./config');

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

const timetable = {};

const readFilePromise = (file) => {
    const filename = file.split(' ').reverse()[0];
    const subject = filename.substring(0, filename.length - 4);
    file = __dirname + '\\' + CONFIG.ttFolder + '\\' + file;
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, contents) => {
            if (err) reject();
            
            const lines = contents.split('\r\n');
            let days = lines.shift().split(',');
            days.shift();
            lines.forEach(line => {
                const words = line.split(',');
                const time = words.shift();
                for (let j = 0; j < words.length; j++) {
                    const std = words[j].trim();
                    if (std === '') continue;
                    if (!timetable[std]) timetable[std] = {};
                    if (!timetable[std][days[j]]) timetable[std][days[j]] = {};
                    timetable[std][days[j]][time] = subject;
                }
            })
            resolve(true);
        });
    });
}

//joining path of directory 
const directoryPath = path.join(__dirname, CONFIG.ttFolder);

//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {

    //handling error
    if (err) return console.log('Unable to scan directory: ' + err);

    const promises = [];
    
    //listing all files using forEach
    files.forEach(file => promises.push(readFilePromise(file)));
    Promise.all(promises).then(() => {
        console.log(timetable)
    });
});