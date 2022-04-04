import fs from 'fs/promises';

const loadString = async (path: string) => {
  try {
    return fs.readFile(
      `${__dirname}/../public/${path}`,
      'utf-8',
    );
  } catch (err) {
    return '';
  }
};

const loadJson = async (path: string) => {
  const file = await loadString(path);
  try {
    return JSON.parse(file);
  } catch (error) {
    return {};
  }
};

export {
  loadJson,
  loadString,
};
