export declare function initDb(): Promise<void>;
export interface Doctor {
    id: number;
    name: string;
    max_patients_per_day: number;
    work_days: string;
}
export interface Patient {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    date_of_birth: string;
    department?: string;
}
export interface Appointment {
    id: number;
    patient_id: number;
    appointment_date: string;
    studies: string[];
    department?: string;
    created_at: string;
    patient?: Patient;
}
export declare function getAppointmentsByDate(date: string): Appointment[];
export declare function createAppointment(patientData: Omit<Patient, "id">, appointmentDate: string, studies: string[]): Appointment;
export declare function updateAppointment(id: number, studies: string[]): Appointment | null;
export declare function deleteAppointment(id: number): boolean;
export declare function getDoctors(): Doctor[];
export declare function createDoctor(name: string, maxPatientsPerDay: number, workDays: number[]): Doctor;
export declare function updateDoctor(id: number, name: string, maxPatientsPerDay: number, workDays: number[]): Doctor | null;
export declare function deleteDoctor(id: number): boolean;
export interface DoctorException {
    id: number;
    doctor_id: number;
    date_from: string;
    date_to: string;
    type: "vacation" | "sick" | "substitution";
    substitute_doctor_id: number | null;
    max_patients: number | null;
}
export declare function getDoctorExceptions(doctorId: number, month: number, year: number): DoctorException[];
export declare function getAllDoctorExceptions(month: number, year: number): DoctorException[];
export declare function createDoctorException(doctorId: number, dateFrom: string, dateTo: string, type: "vacation" | "sick" | "substitution", substituteDoctorId?: number, maxPatients?: number): DoctorException;
export declare function deleteDoctorException(id: number): boolean;
