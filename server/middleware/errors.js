export function notFound(req, res) { res.status(404).json({ error: 'Resource not found' }) }
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'validation_error',
      fields: Object.fromEntries(error.issues.map((issue) => [issue.path.join('.') || 'form', issue.message])),
    })
  }
  if (error.code === 11000) return res.status(409).json({ error: 'A record with that value already exists' })
  if (error.name === 'ValidationError') return res.status(400).json({ error: 'Validation failed', fields: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message])) })
  console.error(error)
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' })
}