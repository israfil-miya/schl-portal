export const mapFormDataToFields = (formData: {
  [k: string]: FormDataEntryValue;
}): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const key of Object.keys(formData)) {
    fields[key] = formData[key].toString();
  }
  return fields;
};

export const extractDbErrorMessages = (error: any): string[] => {
  return Object.values(error.errors).map((err: any) => err.message);
};

export const parseFormData = (
  data: FormData,
  arrayFields: string[] = [],
): Record<string, any> => {
  const parsed: Record<string, any> = {};

  data.forEach((value, key) => {
    // Check if the field should always be an array
    if (arrayFields.includes(key)) {
      if (parsed[key]) {
        parsed[key].push(value);
      } else {
        parsed[key] = [value]; // Initialize as an array
      }
    } else {
      if (parsed[key]) {
        // Handle the case where a field has multiple values
        if (Array.isArray(parsed[key])) {
          parsed[key].push(value);
        } else {
          parsed[key] = [parsed[key], value];
        }
      } else {
        parsed[key] = value;
      }
    }
  });

  return parsed;
};
