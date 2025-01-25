export default (date1: Date, date2: Date) => {
  const date1Ms = new Date(date1).getTime();
  const date2Ms = new Date(date2).getTime();

  return date2Ms - date1Ms;
};
