var mysql = require("mysql");
var inquirer = require("inquirer");
var promisemysql = require("promise-mysql");
const { start } = require("node:repl");
require("console.table");

var connectProp = {
    host: "localhost",
    port: 3000,
    User: "default",
    password: "default",
    database: "employeetracker_db"
};

var connection = mysql.createConnection(connectProp);

connection.connect(function(err) {
    if (err) throw err;
    start();
})

function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "startOptions",
            message: "What would you like to do?",
            choices: [
                "Add New Department",
                "Add New Employee Role",
                "add New Employee",
                "View all Departments",
                "View all Employee Roles",
                "View All Employees",
                "Change the job of the employee",
                "Exit program"
            ]
        }
    ])

    .then(answers => {
        switch(answers.startOptions){
            
            case "add New Department Type" :
                addDepartment();
                break;

            case "Add New Employee Role" :
                addEmployeeRole();
                break;

            case "Add New Employee" :
                addEmployee();
                break;

            case "View all Departments" :
                viewDepartments();
                break;

            case "View all Employee Roles" :
                viewEmployeeRoles();
                break;

            case "View all Employees" :
                viewEmployees();
                break;

            case "Change job of employee" :
                changeJob();
                break;

            default:
                console.log("See you later...");
                process.exit();
        };

    });

};

function addDepartment() {
    inquirer.prompt ([
        {
            type: "input",
            name: "department",
            message: "Add Department: "
        }
    ]).then(answers => {
        connection.query(
            "INSERT INTO department SET ?",
            {
                department_nmae: answers.department,
            },
            function(err) {
                if (err) throw err;
                console.log("New Department added!");

                start();
            }
        );
    });
};

function addEmployeeRole() {

    let departmentName = []

    promisemysql.createConnection(connectProp)
    .then((dbconnection) => {
            return Promise.all([
                dbconnection.query("SELECT * FROM department"),
            ]);
    })
    .then(([department]) => {

        for (var i = 0; i <department.length; i++) {
            departmentName.push(department[i].department_name);
        }

        return Promise.all([department]);

    }).then(([department]) => {
        
        inquirer.prompt([
            {
                type: "input",
                name: "role",
                message: "Add Employee Role: ",
                validate: function(input){
                    if (input === ""){
                        console.log("Employee Role Required");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "salary",
                message: "Employee Role Salary: ",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                type: "list",
                name: "department",
                message: "Department for this Role: ",
                choices: departmentName
            }

        ]).then(answers=>{
            
            let departmentId;

            for (var i = 0; i < department.length; i++) {
                if (answers.department == department[i].department_name) {
                    departmentId = department[i].id;
                }
            }

            connection.query(
                "INSERT INTO employee_role SET ?",

                {
                    title: answers.role,
                    salary: answers.salary,
                    department_id: departmentId
                },
                function(err) {
                    if (err) throw err;
                    console.log ("Employee Role added!");

                    start();
                }
            );
        })
    })
};

funciton addEmployee() {
    let employeeRole = [];
    let employees = [];

    promisemysql.createConnection(connectProp)
    .then((dbconnection) => {
        return Promise.all([

            dbconnection.query("SELECT * FROM employee_role"),

            dbconnection.query("SELECT employee.id, concat(employee.first_name, ' ' , employee.last_name) AS fullName FROM employee ORDER BY fullName ASC")
        ]);

    })
    .then(([role,name]) => {
        for (var i = 0, i < role.length; i++) {
            employeeRole.push(role[i].title);
        }
        
        for (var i = 0; i < name.length; i++) {
            employees.push(name[i].fullName)
        }

        return Promise.all([role,name]);

    })
    .then(([role,name]) => {
        
        employees.push('null')

        inquirer.prompt([
            {
                type: "input",
                name: "firstname",
                message: "First Name: ",
                validate: function(input){
                    if (input === ""){
                        console.log("First Name Required");
                        return false;
                    }
                    else{
                        return true:
                    }
                }
            },
            {
                type: "list",
                name: "currentRole",
                message: "Role within the company: ",
                choices: employeeRole
            },
            {
                type: "list",
                name: "manager",
                message: "Name of their manager: ",
                choices: employees
            }
        ]).then(answers=> {

            let roleId;

            let managerId = null;

            for (var i = 0; i < role.length; i++) {
                if (answers.currentRole == role[i].title) {
                    roleId = role[i].id;
                }
            }

            for (var i = 0; i < name.length; i++) {
                if (answers.manager == name[i].fullName) {
                    managerId = name[i].id;
                }
            }

            connection.query(
                "INSERT INTO employee SET ?",
                {
                    fist_name: answers.firstname,
                    last_name: answers.lastname,
                    role_id: roleId,
                    manager_id: managerId
                },
                function(err) {
                    if (err) throw err;
                    console.log("Employee added!");

                    start();
                }
            );
        });
    })
};

function viewDepartments() {
    connection.query("SELECT department.id, department.department_name, SUM(employee_role.salary) AS utilized_budget FROM employee LEFT JOIN employee_role on employee.role_id = employee_role.id LEFT JOIN department on employee_role.department_id = department.id GROUP BY department.id, department.department_name;", function(err, results) {
        if(err) throw err;
        console.table(results);
        start();
    });
};

function viewEmployeeRoles() {
    connection.query("SELECT employee_role.id, employee_role.title, department.department_name AS department, employee_role.salary FROM employee_role LEFT JOIN department on employee_role.department_id = department.id;", function(err, results) {
        if (err) throw err;
        console.table(results);
        start();
    });
};

function changeJob() {
    let employees = [];
    let employeeRole = [];
    
    promisemysql.createConnection(connectProp)
    .then((dbconnection) => {
        return Promise.all([
            dbconnection.query("SELECT * FROM employee_role"),

            dbconnection.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS fullName FROM employee ORDER BY fullName ASC")

        ]);

    })
    .then(([role,name]) => {
        for (var i = 0; i < role.length; i++) {
            employeeRole.push(role[i].title);
        }

        for (var i = 0; i < name.length; i++) {
            employees.push(name[i].fullName);
        }

        return Promise.all([role,name]);

    })
    .then(([role,name]) => {
        inquirer.prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Employee Name: ",
                choices: employees
            },
            {
                type: "list",
                name: "currentRole",
                message: "New Role: ",
                choices: employeeRole
            }
        ]).then(answers => {

            let roleId;

            let employeeId;

            for (var i = 0; i < role.length; i++) {
                if (answers.currentRole == role[i].title) {
                    roleId = role[i].id;
                }

            }

            for (var i = 0; i < name.length; i++) {
                if (answers.employeeName == name[i].fullName) {
                    employeeId = name[i].id;
                }
            }

            connection.query(
                `UPDATE employee set role_id = ${roleId} WHERE id = ${employeeId}`,
                function(err) {
                    if (err) throw err;
                    console.log("Employee role changed!");

                    start();
                }
            );
        });
    })
};