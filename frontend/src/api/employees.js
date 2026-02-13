import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Create axios instance for the employees API
const api = axios.create({
  baseURL: `${API_URL}/employees`,
  headers: { 'Content-Type': 'application/json' },
});


export async function fetchEmployees() {
  const { data } = await api.get('/');
  return data;
}

export async function fetchEmployee(id) {
  const { data } = await api.get(`/${id}`);
  return data;
}

export async function createEmployee(employee) {
  const { data } = await api.post('/', employee);
  return data;
}

// PUT update employee
export async function updateEmployee(id, employee) {
  const { data } = await api.put(`/${id}`, employee);
  return data;
}

// DELETE employee
export async function deleteEmployee(id) {
  await api.delete(`/${id}`);
}
