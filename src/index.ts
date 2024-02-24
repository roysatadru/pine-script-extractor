import { app } from './app';

app()
  .then(() => {
    console.log('Done!');
  })
  .catch((error) => {
    console.error(error);
  });
