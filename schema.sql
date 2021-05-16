DROP DATABASE IF EXISTS employeeTracker_DB;
CREATE DATABASE employeeTracker_DB;

USE employeeTracker_DB;

CREATE TABLE department(
    id NOT NULL INT AUTO_INCREMENT,
    department_name VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE employee_role(
    id NOT NULL INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (departent_id) REFERENCES department(id) ON DELETE CASCADE
);

CREATE TABLE employee(
    id NOT NULL INT AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES employee_role(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE CASCADE
);