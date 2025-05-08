/* eslint-disable no-unused-vars */
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import { UserCircle } from 'phosphor-react'
import * as Dialog from '@radix-ui/react-dialog'
import nookies, { parseCookies, destroyCookie, setCookie } from 'nookies'
import axios from 'axios'
import { AccountContext } from '../../contexts/AccountContext'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import 'react-toastify/dist/ReactToastify.css'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { hashObject } from '@/utils/functions'

const Header = () => {
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [userNavbarOpen, setUserNavbarOpen] = useState(false)
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [userConnected, setUserConnected] = useState()
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen)
  }

  const {
    user,
    setUser,
    next,
    setNext,
    nextFromScratch,
    finalNodes,
    setReviewYourBuild,
    reviewYourBuild,
    setIsWorkspace,
    tagXnode,
    projectName,
    setProjectName,
    setTagXnode,
    isEditingXnode,
    setIsEditingXnode,
    setNextFromScratch,
    projectDescription,
    setProjectDescription,
    setXnodeType,
    xnodeType,
    setFinalNodes,
    setUpdateDataNode,
    sidebarOpen,
    setSidebarOpen,
  } = useContext(AccountContext)

  const sidebarToggleHandler = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const [isEditing, setIsEditing] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const pathname = usePathname()
  const isFAQPage = pathname.includes('/faqs')
  const { push } = useRouter()

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken
  const userNavbarRef = useRef(null)

  const tagsOptions = [
    'Decentralized data infrastructure',
    'Dapps',
    'Analysis engine',
    'Research and development',
    'Validator',
  ]

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1)
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1)
    } else {
      setOpenIndex(index)
    }
  }

  function onClickTrans(element: string) {
    const taskStartElement = document.getElementById(element)
    taskStartElement.scrollIntoView({ behavior: 'smooth' })
  }

  function signOutUser() {
    destroyCookie(undefined, 'userSessionToken')
    setUser(null)
    disconnect()
    window.location.reload()
  }

  const features = [
    {
      label: 'Browse',
      isCurrentlyPage: false,
      href: `/`,
    },
    {
      label: 'Become a data provider',
      isCurrentlyPage: false,
      href: `/become`,
    },
    {
      label: 'FAQs',
      isCurrentlyPage: false,
      href: `/faqs`,
    },
  ]

  const headerItens = [
    {
      label: 'About',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/openmesh-overview`,
    },
    {
      label: 'Use cases',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/use-cases`,
    },
    {
      label: 'Innovation',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/vision-and-roadmap`,
    },
    {
      label: 'Docs',
      href: `https://openmesh.network/xnode/docs`,
    },
  ]

  const getUserData = useCallback(async () => {
    const { userSessionToken } = parseCookies()
    if (userSessionToken) {
      const config = {
        method: 'post' as const,
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/getCurrentUser`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': userSessionToken,
          'Content-Type': 'application/json',
        },
      }
      let dado

      await axios(config).then(function (response) {
        if (response.data) {
          dado = response.data
          setUser(dado)
        }
      })
    }
  }, [setUser])

  useEffect(() => {
    if (userHasAnyCookie) {
      try {
        console.log('getting the user data')
        getUserData()
      } catch (err) {
        console.log('eroror getting the user session token')
        destroyCookie(undefined, 'userSessionToken')
        setUser(null)
      }
    } else {
      localStorage.removeItem('@scalable: user-state-1.0.0')
      destroyCookie(undefined, 'userSessionToken')
      setUser(null)
    }

    const savedNodes = localStorage.getItem('nodes')
    const savedEdges = localStorage.getItem('edges')
    if (savedNodes && savedEdges) {
      setIsWorkspace(true)
    }

    const savedXnodeType = localStorage.getItem('xnodeType')
    setXnodeType(savedXnodeType)

    const isEditingX = localStorage.getItem('editingNode')
    if (isEditingX) {
      setIsEditingXnode(true)
    }

    if (savedNodes) {
      try {
        setFinalNodes(JSON.parse(savedNodes))
      } catch (e) {
        console.error('Failed to parse savedNodes from localStorage', e)
        setFinalNodes([])
      }
    } else {
      setFinalNodes([])
    }
  }, [
    userHasAnyCookie,
    getUserData,
    setUser,
    setIsWorkspace,
    setXnodeType,
    setIsEditingXnode,
    setFinalNodes,
  ])

  const getUserNonce = useCallback(async (userAddress: string) => {
    const config = {
      method: 'post' as const,
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/getUserNonce`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        address: userAddress,
      },
    }
    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
      }
    })
    return dado
  }, [])

  const loginWeb3User = useCallback(
    async (userAddress: string, signature: string) => {
      const config = {
        method: 'post' as const,
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/loginByWeb3Address`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        },
        data: {
          address: userAddress,
          signature,
        },
      }
      let dado

      await axios(config).then(function (response) {
        if (response.data) {
          dado = response.data
        }
      })
      return dado
    },
    [],
  )

  const { address, isConnected, chain } = useAccount()
  const { open } = useWeb3Modal()

  const getWeb3Login = useCallback(async () => {
    if (address && !user && !userHasAnyCookie) {
      try {
        let nonceUser = await getUserNonce(address)
        nonceUser = nonceUser || '0'
        const hash = hashObject(`${address}-${nonceUser}`)
        console.log('message to hash')
        console.log(hash)
        const finalHash = `0x${hash}`
        const signature = await signMessageAsync({
          account: address,
          message: finalHash,
        })
        const res = await loginWeb3User(address, signature)
        setCookie(null, 'userSessionToken', res.sessionToken)
        nookies.set(null, 'userSessionToken', res.sessionToken)
        setUser(res)
      } catch (err) {
        toast.error(err as any)
        console.log('error loging user')
      }
    }
  }, [
    address,
    user,
    userHasAnyCookie,
    getUserNonce,
    signMessageAsync,
    loginWeb3User,
    setUser,
  ])

  useEffect(() => {
    getWeb3Login()
  }, [getWeb3Login])

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       userNavbarRef.current &&
  //       !userNavbarRef.current.contains(event.target)
  //     ) {
  //       setUserNavbarOpen(false)
  //     }
  //   }

  //   // Adiciona o event listener ao document
  //   document.addEventListener('mousedown', handleClickOutside)

  //   // Cleanup function para remover o event listener
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //   }
  // }, [])

  async function saveEditingXnode() {
    setIsLoadingUpdate(true)

    const savedNodes = localStorage.getItem('nodes')
    const savedEdges = localStorage.getItem('edges')
    const nodeId = localStorage.getItem('editingNode')

    const finalData = {
      xnodeId: nodeId,
      name: projectName,
      description: projectDescription,
      useCase: tagXnode,
      status: 'Running',
      consoleNodes: savedNodes,
      consoleEdges: savedEdges,
    }

    if (user.sessionToken) {
      const config = {
        method: 'put' as const,
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/updateXnode`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json',
        },
        data: finalData,
      }

      try {
        await axios(config).then(function (response) {
          if (response.data) {
            console.log('set next false yes')
            setNext(false)
            setNextFromScratch(false)
            toast.success(`Success`)
            localStorage.clear()
            push(
              `${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? `/xnode/dashboard`
                  : `/dashboard`
              }`,
            )
          }
        })
      } catch (err) {
        toast.error(
          `Error during Xnode deployment: ${
            (err as any).response.data.message
          }`,
        )
      }
    } else {
      toast.error(`User nor found`)
      push(
        `${
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
            ? `/xnode/start-here`
            : `/start-here`
        }`,
      )
    }
    setIsLoadingUpdate(false)
  }

  return (
    <>
      <header className='left-0 top-0 z-40 mx-0 w-full items-center bg-[#fff] px-[17px] pt-[7px]  text-[#000000] xl:px-[43px] xl:pb-[16px] xl:pt-[20px]'>
        <div className='flex'>
          <div className='w-full justify-between px-[20px] py-[20px] md:px-[33px] lg:hidden'>
            <div className=''>
              {pathname.includes('/workspace') && !reviewYourBuild && (
                <div className='flex items-center'>
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? process.env.NEXT_PUBLIC_BASE_PATH
                        : ''
                    }/images/header/user.svg`}
                    alt='image'
                    className='w-[16px] md:w-[19.2px] lg:w-[22.4px] xl:w-[25.5px] 2xl:w-[23px]'
                  />
                  {isEditing ? (
                    <div className='mt-[20px]'>
                      <div className='flex gap-x-[10px]'>
                        <input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className='ml-[5px] bg-[#fff]'
                          autoFocus
                        />
                        <select
                          className='nodrag min-w-[104px] rounded-[6px] bg-[#fff] font-normal md:min-w-[124px] lg:min-w-[145px] xl:min-w-[167px] 2xl:min-w-[208px]'
                          onChange={(option) =>
                            setTagXnode(option.target.value)
                          }
                          value={tagXnode}
                          disabled={xnodeType === 'validator'}
                        >
                          {tagsOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='ml-[5px] mt-[10px] flex'>
                        <div> Description: </div>{' '}
                        <input
                          value={projectDescription}
                          onChange={(e) =>
                            setProjectDescription(e.target.value)
                          }
                          className=' ml-[10px] bg-[#fff] text-[#999]'
                          autoFocus
                        />{' '}
                      </div>
                    </div>
                  ) : (
                    <div className='ml-[5px] text-[8px] font-bold text-[#313131] md:ml-[6px] md:text-[9.6px] lg:ml-[7px] lg:text-[11.2px] xl:ml-[8px] xl:text-[13px] 2xl:ml-[10px] 2xl:text-[16px]'>
                      {projectName}
                    </div>
                  )}
                  {isEditing ? (
                    <div
                      onClick={() => setIsEditing(false)}
                      className='ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]'
                    >
                      Save
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditing(true)}
                      className='ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]'
                    >
                      Edit
                    </div>
                  )}
                  {isViewing ? (
                    <div
                      onClick={() => setIsViewing(false)}
                      className='ml-[7.5px] cursor-pointer text-[7.5px] font-medium  text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]'
                    >
                      Hide
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsViewing(true)}
                      className='ml-[7.5px] cursor-pointer text-[7.5px] font-medium text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]'
                    >
                      View
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={sidebarToggleHandler}
              id='navbarToggler'
              aria-label='Mobile Menu'
              className='absolute left-4 top-1 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2'
            >
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                  sidebarOpen ? ' top-[7px] rotate-45' : ' '
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[15px] bg-black transition-all duration-300 ${
                  sidebarOpen ? 'w-[30px] opacity-0' : ' '
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[10px] bg-black transition-all duration-300  ${
                  sidebarOpen ? ' top-[-8px] w-[30px] -rotate-45' : ' '
                }`}
              />
            </button>
            <button
              onClick={navbarToggleHandler}
              id='navbarToggler'
              aria-label='Mobile Menu'
              className='absolute right-4 top-1 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2'
            >
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                  navbarOpen ? ' top-[7px] rotate-45' : ' '
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 ${
                  navbarOpen ? 'opacity-0 ' : ' '
                }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                  navbarOpen ? ' top-[-8px] -rotate-45' : ' '
                }`}
              />
            </button>
            <nav
              id='navbarCollapse'
              className={`navbar absolute right-7 z-50 w-[200px] rounded border-[.5px] bg-[#e6e4e4] px-6  py-6 text-[13px] text-[#fff] duration-300  ${
                navbarOpen
                  ? 'visibility top-20 opacity-100'
                  : 'invisible top-20 opacity-0'
              }`}
            >
              <div className=' grid gap-y-[15px] text-[12px]  font-medium !leading-[19px]'>
                <div className='my-auto grid gap-y-[20px] text-center md:justify-center'>
                  {headerItens.map((option, index) => (
                    <a
                      key={index}
                      href={`${option.href}`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      <div className='text-[#313131]'>{option.label}</div>
                    </a>
                  ))}
                  <div className='grid gap-y-[12px] font-medium'>
                    {userHasAnyCookie ? (
                      <div className='my-auto'>
                        <img
                          src={
                            !user?.profilePictureHash
                              ? `${
                                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                                    ? process.env.NEXT_PUBLIC_BASE_PATH
                                    : ''
                                }/images/lateralNavBar/profile2.svg`
                              : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                          }
                          alt='image'
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserNavbarOpen(true)
                          }}
                          className={`my-auto mr-[25px] mt-[15px] w-[20px]`}
                        />
                        <nav
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          ref={userNavbarRef}
                          className={`navbar  absolute left-[0px] z-50 flex w-[150px] rounded-[8px] border-[.5px] bg-[#e6e4e4] pb-[30px] pl-[15px] pr-1 pt-[19px] text-[13px] text-[#fff] duration-300  ${
                            userNavbarOpen
                              ? 'visibility -bottom-[120px] -right-[50px] opacity-100'
                              : 'invisible -bottom-[120px] opacity-0'
                          }`}
                        >
                          <div className='mt-[10px]'>
                            <div className='mt-[25px]'>
                              <a
                                onClick={(e) => {
                                  e.stopPropagation()
                                  signOutUser()
                                }}
                                className=' cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent px-[18px] py-[6px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]'
                              >
                                Sign out
                              </a>
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setUserNavbarOpen(false)
                            }}
                            className='ml-[20px] flex  h-fit cursor-pointer justify-end text-[16px] font-bold text-[#000] hover:text-[#313131]'
                          >
                            x
                          </div>
                        </nav>
                      </div>
                    ) : (
                      <a
                        href={`${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                            ? `/pythia/login`
                            : `${'/login'}`
                        }`}
                        className=' mx-auto my-auto mt-[10px] h-fit w-fit cursor-pointer items-center   border-b  border-[#000] bg-transparent text-[16px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]'
                      >
                        Login
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className='relative mx-auto mb-[20px] hidden h-full w-full max-w-[1800px] items-center  justify-between lg:flex'>
            {pathname.includes('/workspace') && !reviewYourBuild && (
              <div className='flex items-center'>
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/header/user.svg`}
                  alt='image'
                  className='w-[16px] md:w-[19.2px] lg:w-[22.4px] xl:w-[25.5px] 2xl:w-[23px]'
                />
                {isEditing ? (
                  <div className='mt-[20px]'>
                    <div className='flex gap-x-[10px]'>
                      <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className='ml-[5px] bg-[#fff]'
                        autoFocus
                      />
                      <select
                        className='nodrag min-w-[104px] rounded-[6px] bg-[#fff] font-normal md:min-w-[124px] lg:min-w-[145px] xl:min-w-[167px] 2xl:min-w-[208px]'
                        onChange={(option) => setTagXnode(option.target.value)}
                        value={tagXnode}
                        disabled={xnodeType === 'validator'}
                      >
                        {tagsOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='ml-[5px] mt-[10px] flex'>
                      <div> Description: </div>{' '}
                      <input
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className=' ml-[10px] bg-[#fff] text-[#999]'
                        autoFocus
                      />{' '}
                    </div>
                  </div>
                ) : (
                  <div className='ml-[5px] text-[8px] font-bold text-[#313131] md:ml-[6px] md:text-[9.6px] lg:ml-[7px] lg:text-[11.2px] xl:ml-[8px] xl:text-[13px] 2xl:ml-[10px] 2xl:text-[16px]'>
                    {projectName}
                  </div>
                )}
                {isEditing ? (
                  <div
                    onClick={() => setIsEditing(false)}
                    className='ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]'
                  >
                    Save
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditing(true)}
                    className='ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]'
                  >
                    Edit
                  </div>
                )}
                {isViewing ? (
                  <div
                    onClick={() => setIsViewing(false)}
                    className='ml-[7.5px] cursor-pointer text-[7.5px] font-medium  text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]'
                  >
                    Hide
                  </div>
                ) : (
                  <div
                    onClick={() => setIsViewing(true)}
                    className='ml-[7.5px] cursor-pointer text-[7.5px] font-medium text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]'
                  >
                    View
                  </div>
                )}
              </div>
            )}
            <div className='relative ml-auto flex gap-x-[25px] text-[7px] md:gap-x-[30px] md:text-[8.4px] lg:gap-x-[35px]  lg:text-[10px]  xl:gap-x-[40px] xl:text-[11.2px] 2xl:gap-x-[50px] 2xl:text-[14px]'>
              {/* <div className="">
                <div className="text-[7px] font-light md:text-[8.5px] lg:text-[10px] xl:text-[11.2px] 2xl:text-[14px]">
                  Estimated monthly price*
                </div>
                <div className="text-[13px] font-medium md:text-[15.5px] lg:text-[18px] xl:text-[21px] 2xl:text-[26px]">
                  $<span className="font-bold">40</span> / month
                </div>
                <div className="mt-[5px] flex justify-between">
                  <div className="text-[7px] text-[#12AD50]  md:text-[8.4px]  lg:text-[10px]  xl:text-[11.2px] 2xl:text-[14px]">
                    ~$13,000 savings
                  </div>
                  <img
                    src={`/images/header/question.svg`}
                    alt="image"
                    className="mb-[5px] w-[6.5px]  md:w-[7.8px]  lg:w-[9.1px] xl:w-[10.4px] 2xl:w-[13px]"
                  />
                </div>
              </div> */}
              <div className='flex items-center gap-x-[15px] font-medium text-[#000] md:gap-x-[18px] lg:gap-x-[21px] xl:gap-x-[24px] 2xl:gap-x-[30px]'>
                {headerItens.map((option, index) => (
                  <a
                    key={index}
                    href={`${option.href}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    <div className='hover:text-[#313131]'>{option.label}</div>
                  </a>
                ))}
              </div>
              {user?.sessionToken ? (
                <div className='my-auto'>
                  <img
                    src={
                      !user.profilePictureHash
                        ? `${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? process.env.NEXT_PUBLIC_BASE_PATH
                              : ''
                          }/images/lateralNavBar/profile2.svg`
                        : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                    }
                    alt='image'
                    onClick={() => {
                      setUserNavbarOpen(!userNavbarOpen)
                    }}
                    className={`my-auto mr-[15px] w-[15px] cursor-pointer xl:w-[20px] 2xl:mr-[15px] 2xl:w-[25px]`}
                  />
                  <nav
                    className={`navbar absolute right-[10px] z-50 flex w-[150px] rounded-[8px] border-[.5px] bg-[#e6e4e4] pb-[20px] pl-[15px] pr-1 pt-[5px] text-[13px] text-[#fff] duration-300  ${
                      userNavbarOpen
                        ? 'visibility -right-[50px] top-10 opacity-100'
                        : 'invisible top-20 opacity-0'
                    }`}
                  >
                    <div className='mt-[10px]'>
                      <div className='mt-[25px]'>
                        <a
                          onClick={signOutUser}
                          className=' cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent px-[18px] py-[6px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]'
                        >
                          Sign out
                        </a>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setUserNavbarOpen(false)
                      }}
                      className='ml-[20px]  flex cursor-pointer justify-end text-[16px] font-bold text-[#000] hover:text-[#313131]'
                    >
                      x
                    </div>
                  </nav>
                </div>
              ) : (
                <div className='flex items-center'>
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? `/pythia/login`
                        : `${'/login'}`
                    }`}
                    className=' my-auto h-fit cursor-pointer items-center  bg-transparent text-[16px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]'
                  >
                    <div>Login</div>
                  </a>
                  <div className='mx-[10px] text-[#3D3D3D]'>or</div>
                  <div className=''>
                    <div className='mr-2'>
                      {chain && (
                        <span className='text-gray-400 text-xs'>
                          {chain.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => open()}
                      className='mr-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90'
                    >
                      {isConnected
                        ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                        : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* <div className="lg:hidden">
            <Dialog.Root>
              <Dialog.Trigger>
                <List className="text-black" size={24} weight="bold" />
              </Dialog.Trigger>
              <HeaderModal navigationItems={navigationItems} />
            </Dialog.Root>
          </div> */}
          </div>
        </div>
        {isViewing && (
          <div className='pl-[17px]  md:pl-[20px] lg:pl-[23px] xl:pl-[26.4px] 2xl:pl-[33px] '>
            <div className='base:text-[7px] mt-[5px] md:text-[8.4px] lg:text-[9.8px] xl:text-[11.2px] 2xl:text-[14px]'>
              {tagXnode}
            </div>
            <div className='mt-[10px] flex justify-between'>
              <div className='text-[6px] font-medium text-[#8D8D8D] md:text-[7.2px]  lg:text-[8.4px]  xl:text-[9.6px] 2xl:text-[12px]'>
                {projectDescription}
              </div>
              <div className='mt-[5px] md:mt-[6px] lg:mt-[7px] xl:mt-[8px] 2xl:mt-[1px]'>
                <div className='text-[9px] font-medium text-[#000] md:text-[10.8px] lg:text-[12.6px] xl:text-[14.4px] 2xl:text-[18px]'>
                  Est. $<span className='font-bold'>40</span> / month
                </div>
                <div className='relative mx-auto mt-[1px] flex w-fit'>
                  <div className='text-[6px] font-medium  text-[#12AD50] md:text-[7.2px]  lg:text-[8.4px]  xl:text-[11.2px] 2xl:text-[12px]'>
                    ~$13,000 savings
                  </div>
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? process.env.NEXT_PUBLIC_BASE_PATH
                        : ''
                    }/images/header/question.svg`}
                    alt='image'
                    className='absolute -right-[10px] top-0 w-[4px]  md:w-[4.8px]  lg:w-[5.6px] xl:w-[6.4px] 2xl:w-[8px]'
                  />
                </div>
              </div>
            </div>
            <div className='mb-[20px] flex gap-x-[30px]'>
              <img
                src={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? process.env.NEXT_PUBLIC_BASE_PATH
                    : ''
                }/images/header/components.png`}
                alt='image'
                className={`mt-[8.5px] w-[170px] md:mt-[10px] md:w-[204px] lg:mt-[12px] lg:w-[238px] xl:mt-[13.6px] xl:w-[272px] 2xl:mt-[17px] 2xl:w-[340px]`}
              />
              <div className=' mb-[5px] mt-auto'>
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? `/xnode/data-products`
                      : `${'/data-products'}`
                  }`}
                  className=' cursor-pointer text-[6px] font-medium  text-[#0354EC] hover:text-[#023ba5] md:text-[7.2px]  lg:text-[8.4px] xl:text-[11.2px] 2xl:text-[12px]'
                >
                  More
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
