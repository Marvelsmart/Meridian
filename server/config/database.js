import mongoose from 'mongoose'

export function connectDatabase(uri) {
  return mongoose.connect(uri)
}

export function disconnectDatabase() {
  return mongoose.disconnect()
}