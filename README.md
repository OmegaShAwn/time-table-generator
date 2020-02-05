# Time Table Generator
Time Table Generator using Node.js. Uses the timetable CSVs in the timetables folder to
1) generate timetables for classes.
2) generate co-teacher timetables such that no teacher is idle at any point in time.
3) computes the minimum number of extra co-teachers required to keep all classes occupied.

## Compatibility
Uses Node.js version v10.16.3

## Usage
- Just run node index.js
- The timetables are already placed in the timetables folder.
- The newly generated timetables will be produced in the generated folder.
- folder 1 consists of the timetables for each class.
- folder 2 consists of the co-teacher timetables for the class as well as the new teachers time tables.
- The minimum number of extra co-teachers required is logged in the console.
