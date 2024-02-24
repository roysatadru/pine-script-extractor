import path from 'node:path';

export const getDirname = () => {
  const __dirname = path.resolve(path.dirname(''));
  return __dirname;
};
