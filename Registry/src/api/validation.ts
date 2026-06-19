export interface ValidationError {
  field: string;
  message: string;
}

export function validateCreateAppointment(body: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.lastName || typeof body.lastName !== "string" || !body.lastName.trim()) {
    errors.push({ field: "lastName", message: "Фамилия обязательна" });
  }
  if (!body.firstName || typeof body.firstName !== "string" || !body.firstName.trim()) {
    errors.push({ field: "firstName", message: "Имя обязательно" });
  }
  if (!body.dateOfBirth || typeof body.dateOfBirth !== "string") {
    errors.push({ field: "dateOfBirth", message: "Дата рождения обязательна" });
  }
  if (!body.appointmentDate || typeof body.appointmentDate !== "string") {
    errors.push({ field: "appointmentDate", message: "Дата приёма обязательна" });
  }
  if (!Array.isArray(body.studies) || body.studies.length === 0) {
    errors.push({ field: "studies", message: "Выберите хотя бы одно исследование" });
  }

  return errors;
}

export function validateUpdateAppointment(body: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(body.studies) || body.studies.length === 0) {
    errors.push({ field: "studies", message: "Выберите хотя бы одно исследование" });
  }

  return errors;
}

export function validateCreateDoctor(body: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push({ field: "name", message: "Имя врача обязательно" });
  }

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): { error: string; details: ValidationError[] } {
  return {
    error: errors.map((e) => e.message).join("; "),
    details: errors,
  };
}