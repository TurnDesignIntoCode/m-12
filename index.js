const inquirer = require('inquirer');
const conn = require('./db/config');

const selector = () => {
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'options',
				message: 'What would you like to do?',
				choices: [
					{
						name: 'View All Departments',
						value: 'VIEW_DEPARTMENTS',
					},
					{
						name: 'Add Department',
						value: 'ADD_DEPARTMENT',
					},
					{
						name: 'Remove Department',
						value: 'REMOVE_DEPARTMENT',
					},
					{
						name: 'View All Employees',
						value: 'VIEW_EMPLOYEES',
					},
					{
						name: 'Add Employee',
						value: 'ADD_EMPLOYEE',
					},
					{
						name: 'Remove Employee',
						value: 'REMOVE_EMPLOYEE',
					},
					{
						name: 'Update Employee Role',
						value: 'UPDATE_EMPLOYEE_ROLE',
					},
					{
						name: 'View All Roles',
						value: 'VIEW_ROLES',
					},
					{
						name: 'Add Role',
						value: 'ADD_ROLE',
					},
					{
						name: 'Remove Role',
						value: 'REMOVE_ROLE',
					},
					{
						name: 'Quit',
						value: 'QUIT',
					},
				],
			},
		])
		.then(answers => {
			switch (answers.options) {
				case 'VIEW_DEPARTMENTS':
					return viewDepartments();
				case 'ADD_DEPARTMENT':
					return addDepartment();
				case 'REMOVE_DEPARTMENT':
					return removeDepartment();
				case 'VIEW_ROLES':
					return viewRoles();
				case 'ADD_ROLE':
					return addRole();
				case 'REMOVE_ROLE':
					return removeRole();
				case 'VIEW_EMPLOYEES':
					return viewEmployees();
				case 'ADD_EMPLOYEE':
					return addEmployee();
				case 'REMOVE_EMPLOYEE':
					return removeEmployee();
				case 'UPDATE_EMPLOYEE_ROLE':
					return updateEmployeeRole();
				default:
					return exit();
			}
		});
};

const exit = () => {
	console.log('Have a wonderful day!');
	process.exit();
};

const viewDepartments = () => {
	let sqlQuery = 'SELECT name as DEPARTMENT FROM department';
	conn.query(sqlQuery, function (error, results) {
		if (error) throw error;
		console.table(results, ['DEPARTMENT']);
		conn.end();
	});
};

const addDepartment = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Please, insert a name of new department',
			},
		])
		.then(response => {
			let sqlQuery = 'INSERT INTO department SET ?';
			conn.query(sqlQuery, response, function (error, results) {
				if (error) throw error;
				console.log('New department has been successfully created!');
				conn.end();
			});
		});
};

const removeDepartment = () => {
	conn.query('SELECT * FROM department', function (error, results) {
		let departments = [];
		if (error) throw error;
		departments = results.map(result => ({
			id: result.id,
			name: result.name,
		}));
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'id',
					message: 'Which department would you like to remove?',
					choices: departments.map(dep => ({
						name: dep.name,
						value: dep.id,
					})),
				},
			])
			.then(response => {
				let sqlQuery = 'DELETE FROM department where id = ?';
				let depId = response.id;
				conn.query(sqlQuery, depId, function (error, results) {
					if (error) throw error;
					console.log('Department has been destroyed!');
					conn.end();
				});
			});
	});
};

const viewRoles = () => {
	let sqlQuery =
		'SELECT * FROM role LEFT JOIN department on role.department_id = department.id';
	conn.query(sqlQuery, function (error, results) {
		if (error) throw error;
		console.table(results);
		conn.end();
	});
};

const addRole = () => {
	let sqlQuery = 'SELECT * FROM department';
	conn.query(sqlQuery, function (error, results) {
		let departments = [];
		if (error) throw error;
		departments = results.map(result => ({
			id: result.id,
			name: result.name,
		}));
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'title',
					message: 'Please, insert a role title',
				},
				{
					type: 'input',
					name: 'salary',
					message: 'Please, insert a salary for this role',
				},
				{
					type: 'list',
					name: 'id',
					message: 'Which department this role belongs to?',
					choices: departments.map(dep => ({
						name: dep.name,
						value: dep.id,
					})),
				},
			])
			.then(response => {
				let sqlQuery = 'INSERT INTO role SET ?';
				let newRole = {
					title: response.title,
					salary: response.salary,
					department_id: response.id,
				};
				conn.query(sqlQuery, newRole, function (error, results) {
					if (error) throw error;
					console.log('Role has been added');
					conn.end();
				});
			});
	});
};

const removeRole = () => {
	conn.query('SELECT * FROM role', function (error, results) {
		let roles = [];
		if (error) throw error;
		roles = results.map(result => ({
			id: result.id,
			title: result.title,
		}));
		roles.unshift({
			title: 'None',
			value: null,
		});
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'id',
					message: 'Which role would you like to remove?',
					choices: roles.map(role => ({
						name: role.title,
						value: role.id,
					})),
				},
			])
			.then(response => {
				let sqlQuery = 'DELETE FROM role where id = ?';
				let roleId = response.id;
				conn.query(sqlQuery, roleId, function (error, results) {
					if (error) throw error;
					console.log('Role has been removed');
					conn.end();
				});
			});
	});
};

const viewEmployees = () => {
	let sqlQuery = `SELECT 
      employee.id, 
      employee.first_name, 
      employee.last_name, 
      CONCAT (employee.first_name, ' ', employee.last_name) 
      as NAME,
      role.title as ROLE, 
      department.name as DEPARTMENT, 
      CONCAT (manager.first_name, ' ', manager.last_name) 
      AS MANAGER FROM employee 
      LEFT JOIN role on employee.role_id = role.id 
      LEFT JOIN department on role.department_id = department.id 
      LEFT JOIN employee manager on employee.manager_id = manager.id`;
	conn.query(sqlQuery, function (error, results) {
		if (error) throw error;
		console.table(results, ['NAME', 'ROLE', 'DEPARTMENT', 'MANAGER']);
		conn.end();
	});
};

const addEmployee = () => {
	const sqlQuery = 'INSERT INTO employee SET ?';
	const roleQuery = 'SELECT * FROM role';
	conn.query(roleQuery, function (error, results) {
		let roles = [];
		if (error) throw error;
		roles = results.map(result => ({
			id: result.id,
			title: result.title,
		}));

		inquirer
			.prompt([
				{
					type: 'input',
					name: 'first_name',
					message: 'Please, insert a employee first name',
				},
				{
					type: 'input',
					name: 'last_name',
					message: 'Please, insert a employee last name',
				},
				{
					type: 'list',
					name: 'role_id',
					message: 'What is the new employee role?',
					choices: roles.map(role => ({
						name: role.title,
						value: role.id,
					})),
				},
			])
			.then(response => {
				conn.query(sqlQuery, response, function (error, results) {
					if (error) throw error;
					console.log('Welcome the new employee!');
					conn.end();
				});
			});
	});
};

const removeEmployee = () => {
	const sqlQuery = 'SELECT id, first_name, last_name FROM employee';

	conn.query(sqlQuery, function (error, results) {
		if (error) throw error;
		const employees = results.map(employee => ({
			name: `${employee.first_name} ${employee.last_name}`,
			value: employee.id,
		}));
		employees.unshift({
			name: 'None',
			value: null,
		});

		inquirer
			.prompt([
				{
					type: 'list',
					name: 'id',
					message: 'Which employee do you want to remove?',
					choices: employees,
				},
			])
			.then(response => {
				console.log(response);
				const sqlQuery = 'DELETE FROM employee where id = ?';
				conn.query(sqlQuery, response.id, function (error, results) {
					if (error) throw error;
					console.log('Employee has been removed');
					conn.end();
				});
			});
	});
};
const updateEmployeeRole = () => {
	const sqlQuery = 'SELECT id, first_name, last_name, role_id FROM employee';
	conn.query(sqlQuery, function (error, results) {
		if (error) throw error;
		const employees = results.map(employee => ({
			name: `${employee.first_name} ${employee.last_name}`,
			value: employee.id,
		}));
		employees.unshift({
			name: 'None',
			value: null,
		});
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'id',
					message: "Which employee's role do you want to update?",
					choices: employees,
				},
			])
			.then(({ id }) => {
				const roleQuery = 'SELECT * FROM role';
				conn.query(roleQuery, function (error, results) {
					if (error) throw error;
					console.log(results);
					const roles = results.map(result => ({
						name: result.title,
						value: result.id,
					}));

					inquirer
						.prompt([
							{
								type: 'list',
								name: 'role_id',
								message: 'Which is the new role for this employee employee?',
								choices: roles,
							},
						])
						.then(({ role_id }) => {
							const updateQuery = `UPDATE employee SET ? WHERE id = ${id}`;
							conn.query(updateQuery, { role_id }, function (error, results) {
								if (error) throw error;
								console.log("Updated employee's role");
								conn.end();
							});
						});
				});
			});
	});
};

selector();
/* 
Build a command-line application that at a minimum allows the user to:

* Add departments, roles, employees

* View departments, roles, employees

* Update employee roles

Bonus points if you're able to:

* Update employee managers

* View employees by manager

* Delete departments, roles, and employees

* View the total utilized budget of a department -- ie the combined salaries of all employees in that department

We can frame this challenge as follows: */
