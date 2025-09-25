import './config/env';
import app from './app';
import logger from './logger';

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
