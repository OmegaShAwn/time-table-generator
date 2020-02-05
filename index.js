const CONFIG = require('./config');
const path = require('path');
const fs = require('fs');

// variables to record the timetables into.
const timetable = {};
const teachersTT = {};
let days = [];
const times = [];
const teachers = [];
const classes = [];

// records the files into the variables.
const recordTimeTable = (file) => {
    const filename = file.split(' ').reverse()[0];
    const teacher = filename.substring(0, filename.length - 4);

    teachers.push(teacher);

    file = __dirname + '\\' + CONFIG.ttFolder + '\\' + file;
    console.log(`Reading file ${file} ....`);

    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, contents) => {
            if (err) reject();

            if (!contents) throw 'The file address is invalid.'
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
                    
                    // records the classes.
                    if (!classes.includes(std)) classes.push(std);
                    
                    // records the class wise timetable
                    if (!timetable[std]) timetable[std] = {};
                    if (!timetable[std][days[j]]) timetable[std][days[j]] = {};
                    timetable[std][days[j]][time] = teacher;
                    
                    // records the teachers timetable.
                    if (!teachersTT[teacher]) teachersTT[teacher] = {};
                    if (!teachersTT[teacher][days[j]]) teachersTT[teacher][days[j]] = {};
                    teachersTT[teacher][days[j]][time] = std;
                }
            })
            resolve(true);
        });
    });
}

const generateClassWiseTT = () => {
    // creates folder for question 1.
    if (!fs.existsSync(CONFIG.generatedTTFolder + '/' + 1)){
        fs.mkdirSync(CONFIG.generatedTTFolder);
        fs.mkdirSync(CONFIG.generatedTTFolder + '/' + 1);
    }

    // writes the class wise timeTables
    classes.forEach(std => {

        // creates the csv
        let data = '--,' + days.join(',') + '\r\n';
        data += times.map(time => {
            return time + ',' + days.map(day => timetable[std][day][time] || '').join(',');    
        }).join('\r\n');

        // writes into the file
        fs.writeFile(`${CONFIG.generatedTTFolder}/1/${std}.csv`, data, (err) => {
            if (err) console.log(err)
        });
    });
}

//class wise co-teachers time table
const coTeachersCWTT = {};
const generateTTWithMaxUtilOfTeachers = () => {

    // assigns free teachers as co teachers.
    classes.forEach(std => {
        days.forEach(day => {
            times.forEach(time => {
                const teacher = timetable[std][day][time];
                if (!coTeachersCWTT[std]) coTeachersCWTT[std] = {};
                if (!coTeachersCWTT[std][day]) coTeachersCWTT[std][day] = {};
                const coTeacher = coTeachersCWTT[std][day][time];
                if (!coTeacher) {
                    teachers.find(t => {
                        if (t === teacher) return false;
                        if (!teachersTT[t][day][time]) {
                            coTeachersCWTT[std][day][time] = t;
                            teachersTT[t][day][time] = std;
                            return true;
                        }
                        return false;
                    })
                }
            })
        })
    })

    // creates folder for question 2.
    if (!fs.existsSync(CONFIG.generatedTTFolder + '/' + 2)){
        fs.mkdirSync(CONFIG.generatedTTFolder + '/' + 2);
    }

    // writes the class wise timeTables
    classes.forEach(std => {

        // creates the csv for the co-teachers.
        data = '--,' + days.join(',') + '\r\n';
        data += times.map(time => {
            return time + ',' + days.map(day => coTeachersCWTT[std][day][time] || '').join(',');    
        }).join('\r\n');

        // writes into the file
        fs.writeFile(`./${CONFIG.generatedTTFolder}/2/co-${std}.csv`, data, (err) => {
            if (err) console.log(err)
        });
    });

    // writes the teachers new time tables
    teachers.forEach(teacher => {

        // creates the csv
        let data = '--,' + days.join(',') + '\r\n';
        data += times.map(time => {
            return time + ',' + days.map(day => teachersTT[teacher][day][time] || '').join(',');    
        }).join('\r\n');

        // writes into the file
        fs.writeFile(`./${CONFIG.generatedTTFolder}/2/new-${teacher}.csv`, data, (err) => {
            if (err) console.log(err)
        });
    });
}

const calculateMinimumExtraCoTeachers = () => {
    
    let count = 0;

    // gets the count of extra teachers required.
    days.forEach(day => {
        times.forEach(time => {
            let countForTime = 0;
            classes.forEach(std => {
                if (!coTeachersCWTT[std][day][time]) countForTime++;
            })
            if (countForTime > count) count = countForTime;
        })
    })
    return count;
}

const compute = async() => {
    console.log('Reading the existing time tables...\n');

    //joining path of directory 
    const directoryPath = path.join(__dirname, CONFIG.ttFolder);

    //passsing directoryPath and callback function
    const files = fs.readdirSync(directoryPath)

    const promises = [];
    
    //listing all files using forEach
    files.forEach(file => promises.push(recordTimeTable(file)));

    await Promise.all(promises);

    console.log('Generating the class wise time tables...\n');

    generateClassWiseTT();

    console.log('Generating Time table where all teachers are utilized maximum...\n');

    generateTTWithMaxUtilOfTeachers();

    console.log('Calculating the minimum extra co Teachers required...\n');

    const count = calculateMinimumExtraCoTeachers();

    console.log(`Minimum number of extra co-teachers required is ${count}`);
}

compute();
