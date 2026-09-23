/**
 * Single entry point for the mock-data layer.
 * Pages/contexts never import the raw files directly — only `lib/api.js` does,
 * so swapping this folder for real API calls stays a one-file change.
 */
export * from './banks'
export * from './users'
export * from './transactions'
export * from './beneficiaries'
export * from './cards'
export * from './notifications'
export * from './bills'
export * from './security'
