import type { Appointment, Doctor, PatientFormData, DoctorFormData } from "../types";

const API_BASE = "http://localhost:3456/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Appointments
export function fetchAppointmentsByDate(date: string): Promise<Appointment[]> {
  return request<Appointment[]>(`/appointments?date=${date}`);
}

export function createAppointment(
  data: PatientFormData & { appointmentDate: string; department: string }
): Promise<Appointment> {
  return request<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAppointment(
  id: number,
  data: Partial<PatientFormData>
): Promise<Appointment> {
  return request<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAppointment(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/appointments/${id}`, {
    method: "DELETE",
  });
}

// Doctors
export function fetchDoctors(): Promise<Doctor[]> {
  return request<Doctor[]>("/doctors");
}

export function createDoctor(data: DoctorFormData): Promise<Doctor> {
  return request<Doctor>("/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDoctor(
  id: string,
  data: DoctorFormData
): Promise<Doctor> {
  return request<Doctor>(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDoctor(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/doctors/${id}`, {
    method: "DELETE",
  });
}