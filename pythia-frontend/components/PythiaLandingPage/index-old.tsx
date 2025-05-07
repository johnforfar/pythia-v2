/* eslint-disable no-unreachable */
'use client'
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */

import Footer from '../Footer'
import { useEffect, useState, useContext } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css' // import styles
import './react-quill.css'
import { AccountContext } from '../../contexts/AccountContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import nookies, { parseCookies, setCookie } from 'nookies'
import { createUserChat } from '@/utils/api-pythia'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const PythiaLandingPage = () => {
  const [newMessageHtml, setNewMessageHtml] = useState('')

  const { user, pythiaUpdated, setPythiaUpdated } = useContext(AccountContext)

  const { push } = useRouter()

  function handleChangeNewMessage(value) {
    if (newMessageHtml.length < 5000) {
      setNewMessageHtml(value)
    }
  }

  async function handleCreateChat() {
    const { userSessionToken } = parseCookies()
    const data = {
      userInput: newMessageHtml,
    }

    try {
      setNewMessageHtml('')
      const res = await createUserChat(data, userSessionToken)
      console.log('user to push')
      push(
        `${
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
            ? `/pythia/chat/${res.id}`
            : `/chat/${res.id}`
        }`,
      )
      setPythiaUpdated(!pythiaUpdated)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
  }

  function newMessageSave() {
    if (!user) {
      setNewMessageHtml('')
      toast.error('Login to chat with Pythia')
    } else {
      handleCreateChat()
    }
  }

  const handleKeyPress = (event) => {
    if (
      event.key === 'Enter' &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      newMessageSave()
    }
  }

  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener('keydown', handleKeyPress)

    // Remove o event listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [newMessageHtml])

  return (
    <>
      <div className="flex h-full max-h-[calc(100vh-6rem)] flex-1 flex-col justify-between px-[50px]  pb-16 text-[16px] text-[#C5C4C4] md:pb-20  lg:pb-8  2xl:text-[18px]">
        <div className="mt-auto flex h-full w-full rounded-xl bg-[#F9F9F9] px-[40px] pb-[50px] shadow-md">
          <div className="mt-auto w-full  px-[40px]">
            {' '}
            <QuillNoSSRWrapper
              value={newMessageHtml}
              onChange={handleChangeNewMessage}
              // disabled={isLoading}
              className="my-quill mx-auto mt-2 w-full max-w-[900px] rounded-md border-[1px] border-[#EAEAEA] bg-[#fff] bg-[#787ca536] text-base font-normal text-[#fff] outline-0 2xl:max-w-[1000px]"
              placeholder="Type your query"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default PythiaLandingPage
