const fetchData = async (url: string, options: {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { data: data, ok: response.ok };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default fetchData;
