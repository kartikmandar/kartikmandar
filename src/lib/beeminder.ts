// Beeminder API utility functions

export interface BeeminderUser {
  username: string
  timezone: string
  updated_at: number
  urgency_load: number
  deadbeat: boolean
  goals: string[] | BeeminderGoal[]
}

export interface BeeminderGoal {
  slug: string
  updated_at: number
  title: string
  fineprint: string
  yaxis: string
  goaldate: number | null
  goalval: number | null
  rate: number | null
  runits: string
  svg_url: string
  graph_url: string
  thumb_url: string
  autodata: string | null
  goal_type: string
  losedate: number
  urgencykey: string
  queued: boolean
  secret: boolean
  datapublic: boolean
  numpts: number
  pledge: number
  initday: number
  initval: number
  curday: number
  curval: number
  currate: number
  lastday: number
  yaw: number
  dir: number
  lane: number
  limsum: string
  kyoom: boolean
  odom: boolean
  aggday: string
  steppy: boolean
  rosy: boolean
  movingav: boolean
  aura: boolean
  frozen: boolean
  won: boolean
  lost: boolean
  maxflux?: number
  contract: {
    amount: number
    stepdown_at: number | null
  } | null
  rah: number
  delta: number
  delta_text: string
  safebuf: number
  safebump: number
  autoratchet: number | null
  id: string
  callback_url: string | null
  description: string
  graphsum: string
  lanewidth: number
  deadline: number
  leadtime: number
  alertstart: number
  plotall: boolean
  integery: boolean
  gunits: string
  hhmmformat: boolean
  todayta: boolean
  weekends_off: boolean
  tmin: string | null
  tmax: string | null
  tags: string[]
  datapoints?: BeeminderDatapoint[]
}

export interface BeeminderDatapoint {
  id: string
  timestamp: number
  daystamp: string
  value: number
  comment: string
  updated_at: number
  requestid?: string
  origin: string
  creator: string | null
  is_dummy: boolean
  is_initial: boolean
  created_at: number
}

export interface BeeminderUserResponse {
  user: BeeminderUser
}

export interface BeeminderGoalsResponse {
  goals: BeeminderGoal[]
}

class BeeminderAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'BeeminderAPIError'
  }
}

// Client-side API functions that call our Next.js API routes
export async function getBeeminderUser(): Promise<BeeminderUser> {
  const response = await fetch('/api/beeminder/user')
  
  if (!response.ok) {
    const error = await response.json()
    throw new BeeminderAPIError(error.error || 'Failed to fetch user', response.status)
  }
  
  const data = await response.json()
  return data
}

export async function getBeeminderGoals(): Promise<BeeminderGoal[]> {
  const response = await fetch('/api/beeminder/goals')
  
  if (!response.ok) {
    const error = await response.json()
    throw new BeeminderAPIError(error.error || 'Failed to fetch goals', response.status)
  }
  
  const data = await response.json()
  return data
}

export async function getBeeminderArchivedGoals(): Promise<BeeminderGoal[]> {
  const response = await fetch('/api/beeminder/goals/archived')
  
  if (!response.ok) {
    const error = await response.json()
    throw new BeeminderAPIError(error.error || 'Failed to fetch archived goals', response.status)
  }
  
  const data = await response.json()
  return data
}

export async function getBeeminderGoal(slug: string): Promise<BeeminderGoal> {
  const response = await fetch(`/api/beeminder/goals/${encodeURIComponent(slug)}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new BeeminderAPIError(error.error || 'Failed to fetch goal', response.status)
  }
  
  const data = await response.json()
  return data
}

// Utility functions for data processing
export function formatGoalDeadline(losedate: number): string {
  const now = Date.now() / 1000
  const daysLeft = Math.max(0, Math.ceil((losedate - now) / (24 * 60 * 60)))
  
  if (daysLeft === 0) {
    return 'Due today'
  } else if (daysLeft === 1) {
    return '1 day left'
  } else if (daysLeft <= 7) {
    return `${daysLeft} days left`
  } else {
    return new Date(losedate * 1000).toLocaleDateString()
  }
}

export function getDotColor(safebuf: number): string {
  if (safebuf < 1) return 'red'
  if (safebuf < 2) return 'orange'
  if (safebuf < 3) return 'blue'
  if (safebuf < 7) return 'green'
  return 'gray'
}

export function getGoalProgress(goal: BeeminderGoal): number {
  if (!goal.goalval || !goal.initval) return 0
  
  const totalProgress = goal.goalval - goal.initval
  const currentProgress = goal.curval - goal.initval
  
  if (totalProgress === 0) return 100
  
  return Math.max(0, Math.min(100, (currentProgress / totalProgress) * 100))
}

export function getUrgentGoals(goals: BeeminderGoal[]): BeeminderGoal[] {
  return goals
    .filter(goal => !goal.frozen && !goal.won && !goal.lost)
    .filter(goal => goal.safebuf < 3)
    .sort((a, b) => a.losedate - b.losedate)
}

export function getGoalStats(goals: BeeminderGoal[], archivedGoals: BeeminderGoal[] = []) {
  const activeGoals = goals.filter(goal => !goal.frozen && !goal.won && !goal.lost)
  const frozenGoals = goals.filter(goal => goal.frozen)
  const completedGoals = goals.filter(goal => goal.won)
  const derailedGoals = goals.filter(goal => goal.lost)
  
  const totalPledged = activeGoals.reduce((sum, goal) => sum + goal.pledge, 0)
  const urgentGoals = getUrgentGoals(goals).length
  
  const goalTypes = activeGoals.reduce((acc, goal) => {
    acc[goal.goal_type] = (acc[goal.goal_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    active: activeGoals.length,
    frozen: frozenGoals.length,
    completed: completedGoals.length,
    derailed: derailedGoals.length,
    archived: archivedGoals.length,
    totalPledged,
    urgent: urgentGoals,
    goalTypes
  }
}

export function formatPledgeAmount(amount: number): string {
  if (amount === 0) return 'Free'
  return `$${amount}`
}

export function getGoalTypeLabel(goalType: string): string {
  const typeMap: Record<string, string> = {
    hustler: 'Do More',
    biker: 'Odometer',
    fatloser: 'Weight Loss',
    gainer: 'Gain Weight',  
    inboxer: 'Inbox Fewer',
    drinker: 'Do Less',
    custom: 'Custom'
  }
  
  return typeMap[goalType] || goalType
}

export { BeeminderAPIError }