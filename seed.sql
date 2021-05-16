INSERT INTO department (id, department_name)
VALUES
(1, "Executivies"),
(2, "Research & Development"),
(3, "Marketing"),
(4, "Sales"),
(5, "Customer Service"),
(6, "Logistics");

INSERT INTO employee_role (id, title, salary, departmetn_id)
VALUES
(1, "President", 1000000, 1),
(2, "Product Engineer", 100000, 2),
(3, "Quality Engineer", 95000, 2),
(4, "Product Manager", 110000, 3),
(5, "Assistant Product Manager", 65000, 3),
(6, "Account Manager", 110000, 4),
(7, "Customer Service Representative", 55000, 5),
(8, "Supply Chain Manager", 98000, 6);

INSERT INTO employee (id, first_name, last_name, role_id)
VALUES 
(1, "Syed", "Tirmizi", 1),
(2, "Zinnia", "Ali", 2),
(3, "Aniyah", "Tirmizi", 3),
(4, "Aliyah", "Tirmizi", 4),
(5, "Bushra", "Khan", 5),
(6, "Saba", "Anjum", 6),
(7, "Bruce", "Wayne", 7),
(8, "Harry", "Potter", 8);