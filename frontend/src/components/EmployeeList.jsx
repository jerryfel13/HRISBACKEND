import { useState, useEffect } from 'react';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../api/employees';
import EmployeeForm from './EmployeeForm';

/**
 * EmployeeList - Demo component for employee CRUD
 * Maps employees from API and provides Create, Read, Update, Delete
 */
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // which row is being edited
  const [showAddForm, setShowAddForm] = useState(false);

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(employee) {
    try {
      await createEmployee(employee);
      setShowAddForm(false);
      loadEmployees();
    } catch (err) {
      throw err; // let form handle display
    }
  }

  async function handleUpdate(id, employee) {
    try {
      await updateEmployee(id, employee);
      setEditingId(null);
      loadEmployees();
    } catch (err) {
      throw err;
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete');
    }
  }

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="employee-list">
      <h1>Employees</h1>

      {!showAddForm ? (
        <button onClick={() => setShowAddForm(true)}>Add Employee</button>
      ) : (
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Create"
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Hire Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              {editingId === emp.id ? (
                <td colSpan="6">
                  <EmployeeForm
                    initial={emp}
                    onSubmit={(data) => handleUpdate(emp.id, data)}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save"
                  />
                </td>
              ) : (
                <>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department || '-'}</td>
                  <td>{emp.position || '-'}</td>
                  <td>{emp.hireDate || '-'}</td>
                  <td>
                    <button onClick={() => setEditingId(emp.id)}>Edit</button>
                    <button onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {employees.length === 0 && !showAddForm && (
        <p>No employees yet. Click &quot;Add Employee&quot; to create one.</p>
      )}
    </div>
  );
}
