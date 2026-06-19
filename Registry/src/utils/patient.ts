const DEPARTMENT_KEY = "registry_department";

export function getDepartment(): string {
  return localStorage.getItem(DEPARTMENT_KEY) || "Регистратура";
}

export function setDepartment(name: string) {
  localStorage.setItem(DEPARTMENT_KEY, name);
}