export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).render('error', {
    title: 'Error',
    error: {
      statusCode,
      message,
    },
  });
}
