import { promises as fs, createReadStream, createWriteStream } from 'node:fs';

// const generateCustomValues = (params: {
//   fileName: string;
//   progress: number;
//   total: number;
// }) => {
//   const { fileName, progress, total } = params;

//   const percentage = ((progress / total) * 100).toFixed(0);

//   return {
//     afterDescIcon: fileName,
//     endOfLineContent: `${percentage}% | ${progress === total ? `All` : `${progress}/${total}`} segments combined`,
//   } as DynamicCustomValues;
// };

export const combineFiles = async (
  filesToCombine: string[],
  targetFile: string,
  options?: {
    keepOriginalFiles?: boolean;
    hideCliProgress?: boolean;
    [key: string]: unknown;
  },
) => {
  const { keepOriginalFiles } = options ?? {};
  const asyncCalls: Promise<void>[] = [];

  // const fileName = path.basename(targetFile);

  return new Promise<void>((resolve, reject) => {
    const writeStream = createWriteStream(targetFile);

    // Function to handle piping of each file
    const pipeFile = async (i: number) => {
      if (i >= filesToCombine.length) {
        writeStream.end();
        await Promise.all(asyncCalls);
        resolve();

        return;
      }

      const readStream = createReadStream(filesToCombine[i]);
      readStream.on('end', () => {
        // Once a file is done, move to the next
        pipeFile(i + 1);

        if (!keepOriginalFiles) {
          // Remove the file that was combined
          asyncCalls.push(fs.unlink(filesToCombine[i]));
        }
      });
      readStream.on('error', (error) => {
        writeStream.close();
        asyncCalls.push(fs.unlink(targetFile));
        reject(error);
      });

      // Pipe current file's content to the target file
      readStream.pipe(writeStream, { end: false });
    };

    // Start the process with the first file
    pipeFile(0);
  });
};
