require('dotenv').config();

const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const util = require('util');

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employeeTracker_DB'
});

connection.query = util.promisify(connection.query);

connection.connect(function (err) {
    if (err) throw err;
    initialAction();
})

const initialAction = async () => {
    try {
        let answer = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'Please select action.',
            choices: [
                'View Employees',
                'View Departments',
                'View Roles',
                'Add Employees',
                'Add Departments',
                'Add Roles',
                'Update Employee Role',
                'Exit'
            ]
        });
        switch (answer.action) {
            case 'View Employees':
                employeeView();
                break;

            case 'View Departments':
                departmentView();
                break;

            case 'View Roles':
                roleView();
                break;

            case 'Add Employees':
                employeeAdd();
                break

            case 'Add Departments':
                departmentAdd();
                break

            case 'Add Roles':
                roleAdd();
                break

            case 'Update Employee Role':
                employeeUpdate();
                break

            case 'Exit':
                connection.end();
                break;
        };
    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const employeeView = async () => {
    console.log('List of Employee');
    try {
        let query = 'SELECT * FROM employee';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let employeeArray = [];
            res.forEach(employee => employeeArray.push(employee));
            console.table(employeeArray);
            initialAction();
        });
    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const departmentView = async () => {
    console.log('List of Department');
    try {
        let query = 'SELECT * FROM department';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let departmentArray = [];
            res.forEach(department => departmentArray.push(department));
            console.table(departmentArray);
            initialAction();
        });
    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const roleView = async () => {
    console.log('List of Roles');
    try {
        let query = 'SELECT * FROM employee_role';
        connection.query(query, function (err, res) {
            if (err) throw err;
            let roleArray = [];
            res.forEach(role => roleArray.push(role));
            console.table(roleArray);
            initialAction();
        });
    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const employeeAdd = async () => {
    try {
        console.log('Add Employee');

        let roles = await connection.query("SELECT * FROM employee_role");

        let managers = await connection.query("SELECT * FROM employee");

        let answer = await inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: "What is the Employee's first name?"
            },
            {
                name: 'lastName',
                type: 'input',
                message: "What is the Employee's last name?"
            },
            {
                name: 'employeeRole',
                type: 'list',
                choices: roles.map((role) => {
                    return {
                        name: role.title,
                        value: role.id
                    }
                }),
                message: "What is this Employee's role?"
            },
            {
                name: 'employeeManager',
                type: 'list',
                choices: managers.map((manager) => {
                    return {
                        name: manager.first_name + " " + manager.last_name,
                        value: manager.id
                    }
                }),
                message: "Who is the Employee's Manager"
            }
        ])

        let result = await connection.query("INSERT INTO employee SET ?", {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: (answer.employeeRole),
            manager_id: (answer.employeeManager)
        });

        console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
        initialAction();

    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const departmentAdd = async () => {
    try {
        console.log('Add Department');

        let answer = await inquirer.prompt([
            {
                name: 'departmentName',
                type: 'input',
                message: "What is the department's name?"
            }
        ]);

        let result = await connection.query("INSERT INTO department SET ?", {
            department_name: answer.departmentName
        });

        console.log(`${answer.departmentName} added successfully to departments.\n`)
        initialAction();

    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const roleAdd = async () => {
    try {
        console.log('Add Role');

        let departments = await connection.query("SELECT * FROM department")

        let answer = await inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: "What is the role's name?"
            },
            {
                name: 'salary',
                type: 'input',
                message: "What is the role's salary?"
            },
            {
                name: 'departmentName',
                type: 'list',
                choices: departments.map((departmentName) => {
                    return {
                        name: departmentName.department_name,
                        value: departmentName.id
                    }
                }),
                message: "What department does the role belong to?",
            }
        ]);
        
        let chosenDepartment;
        for (i = 0; i < departments.length; i++) {
            if(departments[i].department_id === answer.choice) {
                chosenDepartment = departments[i];
            };
        }
        let result = await connection.query("INSERT INTO role SET ?", {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentName
        })

        console.log(`${answer.title} role has been added successfully!\n`)
        initialAction();

    } catch (err) {
        console.log(err);
        initialAction();
    };
}

const employeeUpdate = async () => {
    try {
        console.log('Employee Update');
        
        let employees = await connection.query("SELECT * FROM employee");

        let employeeSelection = await inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                choices: employees.map((employeeName) => {
                    return {
                        name: employeeName.first_name + " " + employeeName.last_name,
                        value: employeeName.id
                    }
                }),
                message: 'Please select an an employee to update.'
            }
        ]);

        let roles = await connection.query("SELECT * FROM employee_role");

        let roleSelection = await inquirer.prompt([
            {
                name: 'role',
                type: 'list',
                choices: roles.map((roleName) => {
                    return {
                        name: roleName.title,
                        value: roleName.id
                    }
                }),
                message: 'Please select the new role for employee.'
            }
        ]);

        let result = await connection.query("UPDATE employee SET ? WHERE ?", [{ role_id: roleSelection.role }, { id: employeeSelection.employee }]);

        console.log(`The role has been successfully updated!\n`);
        initialAction();

    } catch (err) {
        console.log(err);
        initialAction();
    };
}