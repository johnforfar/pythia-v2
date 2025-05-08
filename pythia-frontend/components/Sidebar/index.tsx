/* eslint-disable no-useless-return */
/* eslint-disable no-unused-vars */
import { useContext, useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { AccountContext } from '@/contexts/AccountContext'
import nookies, { parseCookies, setCookie } from 'nookies'
import {
  changeChatName,
  deleteUserChat,
  getUserChats,
} from '@/utils/api-pythia'
import { PythiaChatProps } from '@/types/pythia'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  isToday,
  isWithinInterval,
  subDays,
  startOfDay,
  isBefore,
} from 'date-fns'

/* eslint-disable react/no-unescaped-entities */
const Sidebar = ({ onValueChange }) => {
  const [categoriesOptions, setCategoriesOptions] = useState([])
  const [presetId, setPresetId] = useState(0)
  const { user, pythiaChat, pythiaUpdated, sidebarOpen, setSidebarOpen } =
    useContext(AccountContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [pythiaChats, setPythiaChats] = useState<PythiaChatProps[]>()
  const [isChatMenuOpen, setIsChatMenuOpen] = useState<PythiaChatProps | null>()
  const [pythiaChatHovered, setPythiaChatHovered] =
    useState<PythiaChatProps | null>()
  const [pythiaChatRename, setPythiaChatRename] =
    useState<PythiaChatProps | null>()
  const [pythiaChatName, setPythiaChatName] = useState<string>('www')
  const [inputValue, setInputValue] = useState<string>('')
  const { push } = useRouter()
  const [allPythiaChats, setAllPythiaChats] = useState<PythiaChatProps[]>()

  const menuRef = useRef(null)
  const chatNameRef = useRef(null)

  const preSetsOptionsUser = [
    {
      icon: '/images/lateralNavBar/new-home.png',
      iconStyle: 'w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]',
      title: 'Home',
    },
    {
      icon: '/images/lateralNavBar/new-profile.png',
      iconStyle: 'w-[10px]  md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]',
      title: 'Profile',
    },
  ]

  const preSetsOptions = [
    {
      icon: '/images/lateralNavBar/new-home.png',
      iconStyle: 'w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]',
      title: 'Home',
    },
  ]

  function sendToChat(id: string) {
    push(
      `${
        process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
          ? `/pythia/chat/${id}`
          : `/chat/${id}`
      }`
    )
  }

  async function getData() {
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    try {
      const res = await getUserChats(userSessionToken)
      setAllPythiaChats(res)
      setPythiaChats(res)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      getData()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      getData()
    }
  }, [pythiaUpdated])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsChatMenuOpen(null)
      }
    }

    if (isChatMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChatMenuOpen])

  const pythiaChatNameRef = useRef(pythiaChatName)

  useEffect(() => {
    pythiaChatNameRef.current = pythiaChatName
  }, [pythiaChatName])

  async function handleDeletePythiaChat(chat: PythiaChatProps) {
    const { userSessionToken } = parseCookies()

    const data = {
      id: chat.id,
    }

    try {
      const res = await deleteUserChat(data, userSessionToken)
      push(
        `${process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD' ? `/pythia` : `/`}`
      )
      window.location.reload()
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  async function handleSaveNewChatName() {
    console.log(pythiaChatNameRef.current)
    setIsLoading(true)
    const { userSessionToken } = parseCookies()

    if (
      pythiaChatNameRef?.current?.length === 0 ||
      !pythiaChatNameRef.current ||
      !pythiaChatRename
    ) {
      return
    }

    const idToSet = pythiaChatRename.id

    const data = {
      id: idToSet,
      chatName: pythiaChatNameRef.current,
    }

    try {
      const newPythiaChat = [...pythiaChats]

      const indexP = newPythiaChat.findIndex((chat) => chat.id === idToSet)
      newPythiaChat[indexP].name = pythiaChatNameRef.current
      setPythiaChats(newPythiaChat)
      setPythiaChatRename(null)
      setPythiaChatName('')
      setIsChatMenuOpen(null)
      const res = await changeChatName(data, userSessionToken)
    } catch (err) {
      console.log(err)
      toast.error(`Error: ${err.response.data.message}`)
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (
      event.key === 'Enter' &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      handleSaveNewChatName()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatNameRef.current && !chatNameRef.current.contains(event.target)) {
        setPythiaChatRename(null)
      }
    }

    if (pythiaChatRename) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [pythiaChatRename])

  const validateDate = (chats) => {
    const categorizedChats = {
      today: [],
      lastSevenDays: [],
      older: [],
    }

    chats.forEach((chat) => {
      const createdAt = new Date(chat.createdAt)
      if (isToday(createdAt)) {
        categorizedChats.today.push(chat)
      } else if (
        isWithinInterval(createdAt, {
          start: subDays(startOfDay(new Date()), 7),
          end: new Date(),
        })
      ) {
        categorizedChats.lastSevenDays.push(chat)
      } else {
        categorizedChats.older.push(chat)
      }
    })

    return categorizedChats
  }

  useEffect(() => {
    let filteredChats = allPythiaChats
    if (inputValue.length > 0) {
      filteredChats = allPythiaChats?.filter((chat) => {
        if (!chat?.name) {
          return `Chat ${chat.id}`
            .toLowerCase()
            .includes(inputValue.toLowerCase())
        } else {
          return chat?.name?.toLowerCase().includes(inputValue.toLowerCase())
        }
      })
    }
    setPythiaChats(filteredChats)
  }, [inputValue, allPythiaChats])

  const hasChatsForFilter = (filter) => {
    return pythiaChats?.some((chat) => validateDateChat(filter, chat))
  }
  const arrayDateFilters = ['Today', 'Previous 7 days', 'Previous']
  function validateDateChat(date: string, chat: PythiaChatProps) {
    const createdAt = new Date(chat.createdAt)
    if (date === 'Today') {
      return isToday(createdAt)
    } else if (date === 'Previous 7 days') {
      return isWithinInterval(createdAt, {
        start: subDays(startOfDay(new Date()), 7),
        end: subDays(new Date(), 1),
      })
    } else if (date === 'Previous') {
      return isBefore(createdAt, subDays(startOfDay(new Date()), 7))
    }
  }
  return (
    <>
      <div
        onMouseLeave={() => setSidebarOpen(false)}
        onMouseEnter={() => setSidebarOpen(true)}
        className={`relative !z-10 mt-[50px] h-full !bg-white shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)] md:mt-0 md:!block ${
          !sidebarOpen && 'hidden'
        }`}
      >
        <div
          className={`!z-20 flex  flex-col items-start !bg-white ${
            sidebarOpen ? 'w-[300px] md:w-[280px]' : 'md:flex md:w-[150px]'
          }`}
        >
          <div className='mb-[14.5px] ml-[16px] mt-[24.5px]  flex flex-row items-center  justify-between !bg-white lg:mb-[29px] lg:ml-[32px] lg:mt-[49px]'>
            <div className='absolute top-[10px] flex w-[10.5px] cursor-pointer flex-col items-center lg:top-[38px] lg:w-[21.5px]'>
              <img
                onClick={() => setSidebarOpen(false)}
                src={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? process.env.NEXT_PUBLIC_BASE_PATH
                    : ''
                }/images/lateralNavBar/nav.svg`}
                className='hidden md:block'
                alt='image'
              />
              <a
                href={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? `/pythia/`
                    : '/'
                }`}
                className='absolute -top-[8px] left-[0px] flex w-[100px] cursor-pointer flex-col items-center lg:-top-[22px] lg:left-[50px] lg:w-[100px] '
              >
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/logo/pythia.svg`}
                  alt='image'
                  className={`w-[100px] md:w-[40px] lg:w-[300px] ${
                    sidebarOpen ? '' : 'hidden'
                  }`}
                />
              </a>
            </div>
            <div className='absolute top-[60px] flex h-[25px] w-[10.5px] items-center gap-x-[20px] lg:top-[92px] lg:w-[21.5px]'>
              <img
                src={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? process.env.NEXT_PUBLIC_BASE_PATH
                    : ''
                }/images/logo/search.svg`}
                className='hidden md:block'
                alt='image'
              />
              {sidebarOpen && (
                <input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                  }}
                  placeholder='Search chat'
                  className='h-[25px] w-[200px] rounded-[5px] border border-[#9e9e9e50] bg-transparent px-2 text-[13px] text-[#000] placeholder-body-color outline-none focus:border-primary md:w-[160px]'
                />
              )}
            </div>
          </div>
          <div className='!z-30 mt-[100px] grid gap-y-[10px] px-[22px] text-[13px] text-[#000]'>
            {arrayDateFilters &&
              arrayDateFilters.map((filter, index) => {
                if (hasChatsForFilter(filter)) {
                  return (
                    <div key={index} className=''>
                      <div className='text-[#000000a8]'>{filter}</div>
                      <div className='mb-[5px] mt-[5px] grid gap-y-[5px]'>
                        {pythiaChats &&
                          pythiaChats.map((chat, index) => {
                            if (validateDateChat(filter, chat)) {
                              return (
                                <div
                                  onMouseEnter={() => {
                                    setPythiaChatHovered(chat)
                                  }}
                                  onMouseLeave={() => {
                                    setPythiaChatHovered(null)
                                  }}
                                  className={`${
                                    pythiaChat && pythiaChat.id === chat.id
                                      ? 'bg-[#e2e2e25d]'
                                      : ''
                                  }  relative   rounded-md hover:bg-[#e2e2e25d] ${
                                    validateDateChat(filter, chat)
                                      ? ''
                                      : 'hidden'
                                  }`}
                                  key={index}
                                >
                                  {pythiaChatRename?.id === chat.id ? (
                                    <input
                                      ref={chatNameRef}
                                      value={pythiaChatName}
                                      onChange={(e) => {
                                        console.log(e.target.value)
                                        setPythiaChatName(e.target.value)
                                        console.log('pythia chat name')
                                        console.log(pythiaChatName)
                                      }}
                                      className={`cursor-pointer overflow-hidden bg-white ${
                                        sidebarOpen
                                          ? 'w-[240px]'
                                          : 'max-w-[110px]'
                                      } truncate text-ellipsis whitespace-nowrap p-[10px]`}
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      className={`${
                                        pythiaChat && pythiaChat.id === chat.id
                                          ? 'bg-[#e2e2e25d]'
                                          : ''
                                      } cursor-pointer overflow-hidden ${
                                        sidebarOpen
                                          ? 'w-[240px]'
                                          : 'max-w-[110px]'
                                      } truncate text-ellipsis whitespace-nowrap p-[10px]`}
                                      onClick={() => {
                                        sendToChat(chat.id)
                                      }}
                                    >
                                      {chat.name
                                        ? chat.name
                                        : `Chat ${chat.id}`}
                                    </div>
                                  )}

                                  {pythiaChatHovered?.id === chat.id && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setIsChatMenuOpen(chat)
                                      }}
                                      className='absolute right-0 top-0 flex h-full cursor-pointer bg-[#e2e2e25d] px-[10px] text-[10px] backdrop-blur-sm'
                                    >
                                      <img
                                        src={`${
                                          process.env
                                            .NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                                            ? process.env.NEXT_PUBLIC_BASE_PATH
                                            : ''
                                        }/images/pythia/dots.svg`}
                                        alt='image'
                                        className='my-auto w-[16px] cursor-pointer'
                                      />
                                    </div>
                                  )}
                                  {isChatMenuOpen?.id === chat.id && (
                                    <div
                                      ref={menuRef}
                                      className='absolute right-0 top-0 !z-[999999] translate-x-[105%]  rounded-md border-[0.5px] bg-[#F9F9F9] py-[5px]'
                                    >
                                      <div
                                        onClick={() => {
                                          setPythiaChatRename(chat)
                                          setPythiaChatName(chat.name)
                                          setIsChatMenuOpen(null)
                                        }}
                                        className='flex cursor-pointer gap-x-[7px] rounded-sm px-[10px] py-[5px] hover:bg-[#e2e2e25d]'
                                      >
                                        <img
                                          src={`${
                                            process.env
                                              .NEXT_PUBLIC_ENVIRONMENT ===
                                            'PROD'
                                              ? process.env
                                                  .NEXT_PUBLIC_BASE_PATH
                                              : ''
                                          }/images/pythia/pencil.svg`}
                                          alt='image'
                                          className='my-auto w-[18px]'
                                        />
                                        <div className='text-[#000000b7]'>
                                          Rename
                                        </div>
                                      </div>
                                      <div
                                        onClick={() => {
                                          handleDeletePythiaChat(chat)
                                        }}
                                        className='flex  cursor-pointer gap-x-[14px] rounded-sm px-[10px] py-[5px] hover:bg-[#e2e2e25d]'
                                      >
                                        <img
                                          src={`${
                                            process.env
                                              .NEXT_PUBLIC_ENVIRONMENT ===
                                            'PROD'
                                              ? process.env
                                                  .NEXT_PUBLIC_BASE_PATH
                                              : ''
                                          }/images/pythia/garbage.svg`}
                                          alt='image'
                                          className='my-auto w-[12px]'
                                        />
                                        <div className='text-[#000000b7]'>
                                          Delete
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            } else {
                              return null
                            }
                          })}{' '}
                      </div>
                    </div>
                  )
                } else {
                  return null
                }
              })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
