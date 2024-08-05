const getQuery = (req: Request): { [key: string]: string } => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return query;
};

export default getQuery;
