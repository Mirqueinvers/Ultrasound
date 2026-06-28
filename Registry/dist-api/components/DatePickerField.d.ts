import React from "react";
interface DatePickerFieldProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}
/** Парсит дату из формата "дд.мм.гггг" или "гггг-мм-дд" */
declare function parseDate(value: string): Date | null;
declare const DatePickerField: React.FC<DatePickerFieldProps>;
export { DatePickerField, parseDate };
export default DatePickerField;
