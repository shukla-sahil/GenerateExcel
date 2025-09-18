const express = require('express');
const ExcelJS = require('exceljs');
const faker = require('@faker-js/faker');
const cors = require('cors');

const app = express();
const port = 3000;
// app.use(cors());

const corsOptions = {
  origin: 'https://generate-excel-five.vercel.app' // <-- IMPORTANT: Use your Vercel URL here
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Helper function to generate a valid SSN (No changes here) ---
const generateValidSSN = () => {
    let area, group, serial;
    do {
        area = faker.datatype.number({ min: 1, max: 899 }).toString().padStart(3, '0');
    } while (area === '000' || area === '666');
    do {
        group = faker.datatype.number({ min: 1, max: 99 }).toString().padStart(2, '0');
    } while (group === '00');
    do {
        serial = faker.datatype.number({ min: 1, max: 9999 }).toString().padStart(4, '0');
    } while (serial === '0000');
    return `${area}${group}${serial}`;
};

// --- Data Generation Logic (No changes here) ---
const generateEmployeeData = (numEmployees) => {
    const allRecords = [];
    const classIds = ['FT-SA', 'FT-HR', 'PT-SA', 'HR-PT'];
    for (let i = 0; i < numEmployees; i++) {
        const employeeId = faker.datatype.number({ min: 100, max: 999 });
        let lastName = faker.name.lastName().replace(/'/g, '');
        let firstNameEmployee = faker.name.firstName().replace(/'/g, '');
        const hireDate = faker.date.past(5);
        const salary = faker.finance.amount(30000, 90000, 0);
        const employee = {
            eeId: employeeId, lastName: lastName, firstName: firstNameEmployee,
            email: `${faker.internet.userName(firstNameEmployee, lastName)}@yopmail.com`,
            memberType: 'Employee', ssn: generateValidSSN(), dob: faker.date.past(50, new Date('2000-01-01')),
            gender: faker.helpers.randomize(['M', 'F']), disabled: 'N', dateOfHire: hireDate, salary: salary,
            classId: faker.random.arrayElement(classIds),
        };
        allRecords.push(employee);
        let firstNameSpouse = faker.name.firstName().replace(/'/g, '');
        const spouse = {
            eeId: employeeId, lastName: lastName, firstName: firstNameSpouse,
            email: `${faker.internet.userName(firstNameSpouse, lastName)}@yopmail.com`,
            memberType: 'Spouse', ssn: generateValidSSN(), dob: faker.date.past(50, new Date('2000-01-01')),
            gender: faker.helpers.randomize(['M', 'F']), disabled: 'N',
        };
        allRecords.push(spouse);
        let firstNameChild = faker.name.firstName().replace(/'/g, '');
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        const child = {
            eeId: employeeId, lastName: lastName, firstName: firstNameChild,
            email: `${faker.internet.userName(firstNameChild, lastName)}@yopmail.com`,
            memberType: 'Child', ssn: generateValidSSN(), dob: faker.date.past(30, eighteenYearsAgo),
            gender: faker.helpers.randomize(['M', 'F']), disabled: 'N',
        };
        allRecords.push(child);
    }
    return allRecords;
};

// --- API Endpoint (Simplified to generate ONE file) ---
app.post('/generate-excel', async (req, res) => {
    try {
        const { numEmployees = 10 } = req.body;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`Employee Data`);
        
        sheet.addRow(['Presented to : Frankenstein LLC']);
        sheet.mergeCells('A1:W1');
        sheet.getCell('A1').font = { bold: true };
        sheet.addRow([]);
        sheet.addRow(['', 'EE ID', 'Last Name', 'First Name', 'Email', 'Member Type', 'SSN', 'DOB', 'Age', 'Gender', 'Disabled', 'Date of Hire', 'Salary', 'Class Id', 'Address Line 1', 'Apt/Floor # Line 2', 'City', 'Zip Code', 'State', 'Mailing Same as Home (Yes/No)', 'Paperless (Yes/No)', 'Contribution Start Date']);
        const data = generateEmployeeData(parseInt(numEmployees, 10));
        data.forEach(record => {
            const dob = record.dob ? new Date(record.dob) : null;
            const age = dob ? Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000)) : '';
            sheet.addRow(['', record.eeId, record.lastName, record.firstName, record.email, record.memberType, record.ssn, record.dob, age, record.gender, record.disabled, record.dateOfHire, record.salary, record.classId, '1 Main Street', '', 'Hartford', '06106', 'Connecticut', 'Y', 'N', new Date('2025-10-01')]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=employee_data.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Failed to generate Excel file:", error);
        res.status(500).send("Error generating file");
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});