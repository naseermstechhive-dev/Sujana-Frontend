import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const EmployeeManagement = ({ user, employees, setEmployees, loading }) => {
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
      <p className="text-gray-600 mb-6">
        Create and manage employee accounts for the billing system.
      </p>

      {/* Create New Employee Form - Admin Only */}
      {user.role === 'admin' && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-4">Create New Employee</h3>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await authAPI.createEmployee(
                  newEmployee.name,
                  newEmployee.email,
                  newEmployee.password
                );
                setNewEmployee({ name: '', email: '', password: '' });
                // Refresh employees list - this would need to be passed as a prop
                alert('Employee created successfully!');
              } catch (error) {
                alert(error.message);
              }
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="email"
                placeholder="Employee Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <input
              type="password"
              placeholder="Employee Password"
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-300"
            >
              Create Employee Account
            </button>
          </form>
        </div>
      )}

      {/* Existing Employees List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Existing Employees</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No employees found. Create your first employee above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                    Name
                  </th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                    Email
                  </th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                    Created Date
                  </th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2 text-center text-xs md:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {employee.name}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {employee.email}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-center">
                      <button className="text-blue-500 hover:text-blue-700 mr-2">
                        <FaEdit />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              'Are you sure you want to delete this employee?'
                            )
                          ) {
                            try {
                              await authAPI.deleteEmployee(employee._id);
                              // Refresh employees list - this would need to be passed as a prop
                            } catch (error) {
                              alert(error.message);
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;