export interface PythiaInputProps {
  id: string
  userMessage: string
  response: string
  pythiaChatId: string
  badResponseFeedback: boolean
  chart?: string
  createdAt: string
  updatedAt: string
}

export interface PythiaChatProps {
  id: string
  name: string
  openmeshExpertUserId: string
  PythiaInputs: PythiaInputProps[]
  createdAt: string
  updatedAt: string
}
