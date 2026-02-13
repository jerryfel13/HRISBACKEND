import { useState } from 'react';

/**
 * EmployeeForm - Reusable form for Create and Update
 * Maps form fields to API payload: firstName, lastName, email, department, position, hireDate
 */
export default function EmployeeForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [lastName, setLastName] = useState(initial?.lastName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [hireDate, setHireDate] = useState(initial?.hireDate ?? '');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      department: department.trim() || undefined,
      position: position.trim() || undefined,
      hireDate: hireDate || undefined,
    };
    if (!payload.firstName || !payload.lastName || !payload.email) {
      setError('First name, last name, and email are required.');
      return;
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      {error && <p className="error">{error}</p>}
      <div>
        <label>First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Department</label>
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </div>
      <div>
        <label>Position</label>
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
      </div>
      <div>
        <label>Hire Date</label>
        <input
          type="date"
          value={hireDate}
          onChange={(e) => setHireDate(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit">{submitLabel}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
