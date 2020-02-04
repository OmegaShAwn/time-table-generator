const CONFIG = require('./config');
const path = require('path');
const fs = require('fs');

// variables to record the timetables into.
const timetable = {};
let days = [];
const times = [];

// records the files into the variables.
const readFilePromise = (file) => {
    const filename = file.split(' ').reverse()[0];
    const subject = filename.substring(0, filename.length - 4);
    file = __dirname + '\\' + CONFIG.ttFolder + '\\' + file;
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, contents) => {
            if (err) reject();

            const lines = contents.split('\r\n');
            
            // prevents fetching the date each iteration.
            if (days.length === 0) {
                days = lines.shift().split(',');
                days.shift();
            } else lines.shift();

            lines.forEach(line => {
                const words = line.split(',');
                const time = words.shift();

                // adds the class timings into times.
                if (!times.includes(time)) times.push(time);

                // records the timetable into the timetable variable.
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

const generateClassWiseTT = () => {
    // creates folder to write into
    if (!fs.existsSync(CONFIG.generatedTTFolder)){
        fs.mkdirSync(CONFIG.generatedTTFolder);
    }

    // writes the class wise timeTables
    Object.keys(timetable).forEach(std => {

        // creates the csv
        let data = '--,' + days.join(',') + '\r\n';
        data += times.map(time => {
            return time + ',' + days.map(day => timetable[std][day][time] || '').join(',');    
        }).join('\r\n');

        // writes into the file
        fs.writeFile(`./${CONFIG.generatedTTFolder}/${std}.csv`, data, (err) => {
            if (err) console.log(err)
        });
    });
}

const compute = async() => {
    console.log('Reading the existing time tables...');

    //joining path of directory 
    const directoryPath = path.join(__dirname, CONFIG.ttFolder);

    //passsing directoryPath and callback function
    const files = fs.readdirSync(directoryPath)

    const promises = [];
    
    //listing all files using forEach
    files.forEach(file => promises.push(readFilePromise(file)));

    await Promise.all(promises);

    console.log('Generating the class wise time tables...');

    generateClassWiseTT();
}

compute();
