export const addInfoData = (
  data: Record<string, any>,
  options: {
    keys?: string[];
    prefix?: string;
  } = {},
) => {
  const { keys = Object.keys(data), prefix = '##$' } = options;
  let header = '';
  for (const key of keys) {
    header +=
      typeof data[key] === 'object'
        ? `${prefix}${key}=${JSON.stringify(data[key])}\n`
        : `${prefix}${key}=${data[key]}\n`;
  }
  return header;
};
