import { useEffect } from 'react'
import io from 'socket.io-client'
import { parseCookies } from 'nookies'

export interface WebsocketI {
  workspaceId: string
  handleNewResponseMessage(message: string): void
}

const WebsocketComponent = ({
  workspaceId,
  handleNewResponseMessage,
}: WebsocketI) => {
  useEffect(() => {
    if (workspaceId) {
      console.log('trying connect with websocket')

      const { userSessionToken } = parseCookies()

      const socket = io('https://dpl-backend-homolog.up.railway.app', {
        query: {
          workspaceId,
        },
        extraHeaders: {
          'X-Parse-Session-Token': userSessionToken,
        },
      })

      socket.on('connect', () => {
        console.log('Conected to WebSocket')
      })

      socket.on('responseMessage', (message) => {
        handleNewResponseMessage(message)
      })

      socket.on('disconnect', () => {
        console.log('Disconected from workspace')
      })

      return () => {
        socket.off('personalMessage')
        socket.off('channelMessage')
        socket.disconnect()
      }
    }
  }, [workspaceId])

  return <></>
}

export default WebsocketComponent
