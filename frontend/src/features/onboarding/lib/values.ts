/** Las selecciones múltiples viven en el formulario como "a,b,c". */
export const parseMulti = (value?: string): string[] => (value ? value.split(',').filter(Boolean) : []);
export const joinMulti = (items: string[]): string => items.join(',');
