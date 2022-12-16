const connection = require('./config');

class DB {
  constructor(connection) {
    this.connection = connection;
  }
  //departmments
  addDepartment(payload) {
    this.connection.query("INSERT INTO department SET ?", payload);
  }

  removeDepartment(payload) {
    return this.connection.query("DELETE FROM department WHERE id = ?", payload)
  }

  viewDepartments() {
    return this.connection.query("SELECT * FROM department");
  }
  //roles
  viewRoles() {
    return this.connection.query("SELECT role.id, title, salary, department.name FROM role LEFT JOIN department on role.department_id = department.id");
  }

  addRole(payload) {
    this.connection.query("INSERT INTO role SET ?", payload);
  }

  removeRole(payload) {
    return this.connection.query("DELETE FROM role WHERE id = ?", payload)
  }

  viewAllEmployees() {
    return this.connection.query(
      `SELECT 
      employee.id, 
      employee.first_name, 
      employee.last_name, 
      role.title, 
      department.name as department, 
      CONCAT (manager.first_name, ' ', manager.last_name) 
      AS manager FROM employee 
      LEFT JOIN role on employee.role_id = role.id 
      LEFT JOIN department on role.department_id = department.id 
      LEFT JOIN employee manager on employee.manager_id = manager.id`);
  }

  addEmployee(payload) {
    return this.connection.query("INSERT INTO employee SET ?", payload);
  }

  removeEmployee(payload){
    return this.connection.query("DELETE FROM employee WHERE id = ?", payload);
  }

  viewEmployeesByDepartment(payload){
    return this.connection.query(`
    SELECT 
    employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title 
    FROM employee 
    LEFT JOIN role on employee.role_id = role.id 
    LEFT JOIN department department on role.department_id = department.id 
    WHERE department.id = ${payload}`)

  }

  viewEmployeesByManager(payload){
    return this.connection.query("SELECT * FROM employee LEFT JOIN role on employee.role_id = role.id WHERE manager_id = ?", payload)
  }

  updateEmployeeRole(payload){
    return this.connection.query("UPDATE employee SET ? WHERE ?", payload);
  }

  updateEmployeeManager(payload){
    return this.connection.query("UPDATE employee SET ? WHERE ?", payload);
  }
}

module.exports = new DB(connection);