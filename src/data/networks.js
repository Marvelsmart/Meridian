/** Mobile top-up catalogue using a fictional U.S. carrier set. */
export const AIRTIME_PRESETS = [25, 50, 75, 100, 150, 250, 500, 1000]
export const AIRTIME_MIN = 10
export const AIRTIME_MAX = 2500

export const DATA_PLANS = {
  verizon: [
    { id: 'veriz_1', label: '5GB', validity: '30 days', amount: 40, tag: null },
    { id: 'veriz_2', label: '15GB', validity: '30 days', amount: 80, tag: 'Popular' },
    { id: 'veriz_3', label: '30GB', validity: '30 days', amount: 120, tag: 'Best value' },
  ],
  att: [
    { id: 'att_1', label: '5GB', validity: '30 days', amount: 35, tag: null },
    { id: 'att_2', label: '15GB', validity: '30 days', amount: 75, tag: 'Popular' },
    { id: 'att_3', label: '40GB', validity: '30 days', amount: 110, tag: 'Best value' },
  ],
  tmobile: [
    { id: 'tmob_1', label: '6GB', validity: '30 days', amount: 40, tag: null },
    { id: 'tmob_2', label: '18GB', validity: '30 days', amount: 85, tag: 'Popular' },
    { id: 'tmob_3', label: '35GB', validity: '30 days', amount: 125, tag: 'Best value' },
  ],
  uscellular: [
    { id: 'usc_1', label: '4GB', validity: '30 days', amount: 30, tag: null },
    { id: 'usc_2', label: '12GB', validity: '30 days', amount: 65, tag: 'Popular' },
    { id: 'usc_3', label: '25GB', validity: '30 days', amount: 95, tag: 'Best value' },
  ],
}

export function dataPlansFor(networkId) {
  return DATA_PLANS[networkId] ?? []
}

/** Frequently topped-up numbers, offered as one-tap chips. */
export const SAVED_PHONE_NUMBERS = [
  { id: 'ph_01', phone: '+1 (415) 555-0182', label: 'My line', network: 'verizon' },
  { id: 'ph_02', phone: '+1 (646) 555-0149', label: 'Maya', network: 'att' },
  { id: 'ph_03', phone: '+1 (310) 555-0167', label: 'Jordan', network: 'tmobile' },
  { id: 'ph_04', phone: '+1 (206) 555-0174', label: 'Chris', network: 'uscellular' },
]

/** Best-effort network detection from a U.S. mobile prefix. */
const PREFIX_MAP = {
  verizon: ['415', '646', '212', '718', '917', '310', '213', '805', '626'],
  att: ['206', '206', '303', '512', '214', '972', '214', '817', '281'],
  tmobile: ['206', '253', '425', '801', '385', '702', '702', '480'],
  uscellular: ['312', '773', '847', '708', '630', '262', '414', '608'],
}

export function detectNetwork(rawPhone) {
  const digits = String(rawPhone ?? '').replace(/\D/g, '')
  const local = digits.length >= 10 ? digits.slice(-10) : digits
  const prefix = local.slice(0, 3)
  const match = Object.entries(PREFIX_MAP).find(([, prefixes]) => prefixes.includes(prefix))
  return match ? match[0] : null
}

export const NETWORKS = [
  { id: 'verizon', name: 'Verizon', color: '#E00027', textOnColor: '#FFFFFF' },
  { id: 'att', name: 'AT&T', color: '#0A66FF', textOnColor: '#FFFFFF' },
  { id: 'tmobile', name: 'T-Mobile', color: '#5A2DFF', textOnColor: '#FFFFFF' },
  { id: 'uscellular', name: 'U.S. Cellular', color: '#0E8A5E', textOnColor: '#FFFFFF' },
]
