import { Device } from '../models/index.js'

export async function requireValidatedDevice(req, res, next) {
  const device = await Device.findOne({ owner: req.user._id, deviceId: req.deviceId }).lean()
  if (!device?.trusted) return res.status(403).json({ code: 'device_not_validated', error: 'New device identified', message: 'Contact customer care to validate device.' })
  req.device = device
  return next()
}