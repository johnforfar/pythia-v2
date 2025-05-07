export type CoreServices = {
  name: string
  isFree: boolean
  chain: string
  description: string
}

export type Xnode = {
  id: string
  name: string
  description: string
  useCase: string
  status: string
  consoleNodes: string
  consoleEdges: string
  openmeshExpertUserId: string
  createdAt: string
  location: string
  updatedAt: string
  validatorSignature: string
}

type Stats = {
  totalValidators: number
  totalStakeAmount: number
  totalAverageReward: number
  averagePayoutPeriod: string
}

export type XnodeValidatorsStats = {
  stats: Stats
  nodes: Xnode[]
}

export type XnodeWithValidatorsStats = {
  node: Xnode
  stats: Stats
  nodes: Xnode[]
}
