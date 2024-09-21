interface RawFormData {
  [key: string]: string | boolean | number | ''; // Include empty string as a possible type
}

const retrieveFormData = (formData: FormData): RawFormData => {
  const rawFormData: RawFormData = {};

  formData.forEach((value, key) => {
    if (!key.startsWith('$')) {
      // Exclude keys starting with $
      if (value === 'on') {
        // Replace "on" with true
        rawFormData[key] = true;
      } else if (value !== '') {
        // Convert numeric strings to numbers if not empty
        rawFormData[key] = isNaN(Number(value))
          ? value.toString()
          : Number(value);
      } else {
        rawFormData[key] = ''; // Keep empty strings as empty strings
      }
    }
  });

  return rawFormData;
};

export default retrieveFormData;
