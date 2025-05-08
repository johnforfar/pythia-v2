/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, ChangeEvent, FC, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import nookies, { parseCookies, setCookie } from 'nookies'
import 'react-toastify/dist/ReactToastify.css'
import 'react-quill/dist/quill.snow.css' // import styles
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import 'react-datepicker/dist/react-datepicker.css'
import { AccountContext } from '../../contexts/AccountContext'

import { TextField, Autocomplete } from '@mui/material'

type RegisterForm = {
  firstName: string
  lastName: string
  companyName: string
  foundingYear: number
  location: string
  website: string
  personalBlog?: string
  githubLink?: string
  tags: string[]
  description: string
  scheduleCalendlyLink: string
}

type Payment = {
  tokenContract: string
  amount: string
}

type FileListProps = {
  files: File[]
  onRemove(index: number): void
}

const Profile = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false)
  const [logoProfileHadChange, setLogoProfileHadChange] =
    useState<boolean>(false)
  const { user, setUser } = useContext(AccountContext)

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const { push } = useRouter()

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 133 }, (_, index) => currentYear - index)

  const skillOptions = [
    'IoT',
    'Web development',
    'Consultancy',
    'UI / UX',
    'Marketing',
  ]

  const validSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    companyName: Yup.string().notRequired(),
    foundingYear: Yup.number().notRequired(),
    personalBlog: Yup.string().notRequired(),
    githubLink: Yup.string().notRequired(),
    website: Yup.string().notRequired(),
    description: Yup.string().required('Description is required'),
    location: Yup.string().required('Location is required'),
    scheduleCalendlyLink: Yup.string().notRequired(),
    tags: Yup.array()
      .of(Yup.string())
      .min(3, 'At least three tags are required')
      .max(5, 'You can select up to 5 skills'),
  })
  const {
    register,
    handleSubmit,
    setValue,
    control, // Adicione esta linha
    // eslint-disable-next-line no-unused-vars
    reset,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver<any>(validSchema),
  })

  useEffect(() => {
    if (errors.tags) {
      const element = document.getElementById('tagsId')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [errors])

  const FileList: FC<FileListProps> = ({ files, onRemove }) => {
    return (
      <ul className='mt-4 max-h-[190px] max-w-[300px] overflow-y-auto text-[#000000]'>
        {files.map((file, index) => (
          <li key={`selected-${index}`} className='mb-2 ml-4 mr-2 flex'>
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }${imagePreview}`}
              alt='Preview'
              className={`h-[150px] w-[150px] cursor-pointer rounded-[100%] `}
            />
            <button
              type='button'
              onClick={() => onRemove(index)}
              disabled={isLoading}
              className='ml-2 flex h-fit items-start rounded px-1 py-0.5 text-sm  font-extrabold text-[#ff0000]  hover:text-[#6b0101] lg:text-[16px]'
            >
              X
            </button>
          </li>
        ))}
      </ul>
    )
  }

  const handlePreFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      let validFiles = true
      const allowedMimeTypes = ['image/jpeg', 'image/png']
      const maxFileSize = 10 * 1024 * 1024 // 10 MB

      if (newFiles.length > 1) {
        toast.error(`Only 1 file per task for the MVP.`)
        return
      }

      newFiles.forEach((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
          validFiles = false
          toast.error(`Only JPG, JPEG, PNG allowed for the MVP.`)
          return
        }
        if (file.size > maxFileSize) {
          validFiles = false
          toast.error(`The file ${file.name} is too heavy. Max of 10 MB.`)
          return
        }
        const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 15)
        setSelectedFiles(combinedFiles)
        const imageURL = URL.createObjectURL(event.target.files[0])
        console.log(imageURL)
        setImagePreview(imageURL)
      })
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      let validFiles = true
      const allowedMimeTypes = ['image/jpeg', 'image/png']
      const maxFileSize = 10 * 1024 * 1024 // 10 MB

      if (newFiles.length > 1) {
        toast.error(`Only 1 file per task for the MVP.`)
        return
      }

      newFiles.forEach((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
          validFiles = false
          toast.error(`Only JPG, JPEG, PNG allowed for the MVP.`)
          return
        }
        if (file.size > maxFileSize) {
          validFiles = false
          toast.error(`The file ${file.name} is too heavy. Max of 10 MB.`)
          return
        }
        const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 15)
        setSelectedFiles(combinedFiles)
        const imageURL = URL.createObjectURL(event.target.files[0])
        console.log(imageURL)
        setImagePreview(imageURL)
        setLogoProfileHadChange(true)
      })
    }
  }
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    setLogoProfileHadChange(true)
  }

  async function handleFileUploadIPFS() {
    const file = selectedFiles[0]
    const formData = new FormData()
    formData.append('file', file)

    const pinataAxios = axios.create({
      baseURL: 'https://api.pinata.cloud/pinning/',
      headers: {
        pinata_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
        pinata_secret_api_key: `${process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    const response = await pinataAxios.post('pinFileToIPFS', formData)

    const ipfsHash = response.data.IpfsHash

    console.log('File uploaded to IPFS with hash', ipfsHash)

    return ipfsHash
  }

  async function updateUser(data: any) {
    const { userSessionToken } = parseCookies()
    const config = {
      method: 'post' as const,
      url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/updateUser`,
      headers: {
        'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
        'X-Parse-Session-Token': userSessionToken,
        'Content-Type': 'application/json',
      },
      data,
    }

    let dado

    await axios(config).then(function (response) {
      if (response.data) {
        dado = response.data
        console.log(dado)
      }
    })

    return dado
  }

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true)

    let finalData
    if (logoProfileHadChange) {
      let fileIPFSHash = ''
      if (selectedFiles.length > 0) {
        try {
          fileIPFSHash = await handleFileUploadIPFS()
        } catch (err) {
          toast.error('Something ocurred on the image upload')
          console.log(err)
          setIsLoading(false)
          return
        }
      }
      finalData = {
        ...data,
        profilePictureHash: fileIPFSHash,
      }
    } else {
      finalData = {
        ...data,
      }
    }

    try {
      const res = await updateUser(finalData)
      toast.success('Account updated succesfully')
      await new Promise((resolve) => setTimeout(resolve, 2500))
      setIsLoading(false)
      push(
        `${
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD' ? `/xnode/oec` : `/oec`
        }`
      )
    } catch (err) {
      console.log(err)
      if (err.response.data.message === 'Email already in use') {
        toast.error('Email already in use')
        const element = document.getElementById('emailId')
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        toast.error('something ocurred')
      }
      console.log(err.response.data.message)
      setIsLoading(false)
    }
  }
  async function urlToFile(url, filename, mimeType) {
    const response = await fetch(url)
    const data = await response.blob()
    return new File([data], filename, { type: mimeType })
  }
  function getProfile() {
    // setValue('name', user.name, {
    //   shouldValidate: true,
    //   shouldDirty: true,
    // })
    setValue('firstName', user.firstName)
    setValue('lastName', user.lastName)
    setValue('companyName', user.companyName)
    setValue('foundingYear', user.foundingYear)
    setValue('website', user.website)
    setValue('description', user.description)
    setValue('location', user.location)
    setValue('scheduleCalendlyLink', user.calendly)
    setValue('tags', user.tags)
    setValue('githubLink', user.githubLink)
    setValue('personalBlog', user.personalBlog)
    // reset({
    //   name: user.name,
    //   email: user.email,
    //   companyName: user.companyName,
    //   foundingYear: user.foundingYear,
    //   website: user.website,
    //   description: user.description,
    //   location: user.location,
    //   scheduleCalendlyLink: user.calendly,
    //   tags: user.tags,
    // })
  }
  useEffect(() => {
    setIsPageLoading(true)
    if (userHasAnyCookie) {
      if (user) {
        getProfile()
        if (user.profilePictureHash) {
          const mimeType = 'image/jpeg'
          urlToFile(
            `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`,
            'profilePic.jpg',
            mimeType
          ).then((file) => {
            handlePreFileChange({ target: { files: [file] } } as any)
            setIsPageLoading(false)
          })
        }
      }
    } else {
      push(
        `${
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD' ? `/xnode/oec` : `/oec`
        }`
      )
    }

    setIsPageLoading(false)
  }, [user])

  if (isPageLoading) {
    return (
      <section className='px-32 py-16 text-black md:py-20 lg:pt-40'>
        <div className='container flex h-60 animate-pulse px-0 pb-12'>
          <div className='mr-10 w-3/4 animate-pulse bg-[#dfdfdf]'></div>
          <div className='w-1/4 animate-pulse bg-[#dfdfdf]'></div>
        </div>
        <div className='container h-96 animate-pulse bg-[#dfdfdf] pb-12'></div>
      </section>
    )
  }

  if (user && !isPageLoading) {
    return (
      <>
        <section className='border-b border-[#CFCFCF] px-32 pb-[33px] pt-[50px]'>
          <div className='container'>
            <div className='-mx-4 flex flex-wrap items-start'>
              <div className='w-full px-4 lg:w-2/3'>
                <div className='mb-1'>
                  <h3 className='text-[15px] font-bold !leading-[150%] text-[#000000] lg:text-[24px]'>
                    Update account
                  </h3>
                </div>
                <div className='mt-[20px] text-[#000]'>{user.email}</div>
              </div>
            </div>
          </div>
        </section>
        <section className='mb-[0px] mt-12 px-[20px] pt-[15px] text-[11px]  font-medium !leading-[17px] text-[#000000] lg:mb-24 lg:px-[100px] lg:pt-[30px]  lg:text-[14px]'>
          <div className='flex gap-x-[70px] lg:gap-x-[200px] lg:px-[150px]'>
            <form onSubmit={handleSubmit(onSubmit)} className=''>
              <div className=''>
                <div>
                  <div id='emailId' className=''>
                    <div className='mt-[20px]'>
                      <span className='flex flex-row'>
                        First name
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.firstName?.message}
                        </p>
                      </span>
                      <input
                        disabled={isLoading}
                        className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                        type='text'
                        maxLength={100}
                        placeholder={user.firstName}
                        {...register('firstName')}
                      />
                    </div>
                    <div className='mt-[20px]'>
                      <span className='flex flex-row'>
                        Last name
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.lastName?.message}
                        </p>
                      </span>
                      <input
                        disabled={isLoading}
                        className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                        type='text'
                        maxLength={100}
                        placeholder={user.lastName}
                        {...register('lastName')}
                      />
                    </div>
                    {user.isCompany && (
                      <div className='mt-[20px]'>
                        <span className='flex flex-row'>
                          Company name
                          <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                            {errors.companyName?.message}
                          </p>
                        </span>
                        <input
                          disabled={isLoading}
                          className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                          type='text'
                          maxLength={100}
                          placeholder=''
                          {...register('companyName')}
                        />
                      </div>
                    )}
                    {user.isCompany && (
                      <div className='mt-[20px]'>
                        <span className='flex flex-row'>
                          Founding year
                          <p className='ml-[8px] text-[10px] font-normal text-[#ff0000]'>
                            {errors.foundingYear?.message}
                          </p>
                        </span>
                        <Controller
                          name='foundingYear'
                          control={control}
                          defaultValue={null}
                          rules={{ required: 'Founding year is required' }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              options={years}
                              disableClearable
                              getOptionLabel={(option) => option.toString()}
                              onChange={(e, newValue) =>
                                field.onChange(newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant='outlined'
                                  placeholder='Select a year'
                                  error={Boolean(errors.foundingYear)}
                                  helperText={errors.foundingYear?.message}
                                  sx={{
                                    width: isSmallScreen ? '280px' : '500px',
                                    fieldset: {
                                      height: '50px',
                                      borderColor: '#D4D4D4',
                                      borderRadius: '10px',
                                      marginTop: '7px',
                                    },
                                    input: { color: 'black' },
                                  }}
                                />
                              )}
                            />
                          )}
                        />
                      </div>
                    )}
                    <div id='tagsId' className='mt-[20px]'>
                      <span className='flex flex-row'>
                        Location
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.location?.message}
                        </p>
                      </span>
                      <input
                        disabled={isLoading}
                        className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                        type='text'
                        maxLength={100}
                        placeholder='new york, us'
                        {...register('location')}
                      />
                    </div>
                    {user.isCompany && (
                      <div className='mt-[20px]'>
                        <span className='flex flex-row'>
                          Website
                          <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                            {errors.website?.message}
                          </p>
                        </span>
                        <input
                          disabled={isLoading}
                          className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                          type='text'
                          maxLength={100}
                          placeholder=''
                          {...register('website')}
                        />
                      </div>
                    )}
                    {!user.isCompany && (
                      <div className='mt-[20px]'>
                        <span className='flex flex-row'>
                          Personal blog
                          <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                            {errors.personalBlog?.message}
                          </p>
                        </span>
                        <input
                          disabled={isLoading}
                          className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                          type='text'
                          maxLength={100}
                          placeholder=''
                          {...register('personalBlog')}
                        />
                      </div>
                    )}
                    {!user.isCompany && (
                      <div className='mt-[20px]'>
                        <span className='flex flex-row'>
                          Github
                          <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                            {errors.githubLink?.message}
                          </p>
                        </span>
                        <input
                          disabled={isLoading}
                          className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white px-[12px] text-[17px] font-normal outline-0 lg:w-[500px]'
                          type='text'
                          maxLength={100}
                          placeholder=''
                          {...register('githubLink')}
                        />
                      </div>
                    )}
                    <div className='mt-[20px]'>
                      <span className='flex flex-row'>
                        Calendly link
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.scheduleCalendlyLink?.message}
                        </p>
                      </span>
                      <div className='relative flex items-center'>
                        <span className='absolute left-3 top-[25px] self-center text-[17px] font-normal'>
                          calendly.com/
                        </span>
                        <input
                          disabled={isLoading}
                          className='mt-[10px] h-[45px] w-[280px] rounded-[10px] border border-[#D4D4D4] bg-white pl-[123px] pr-[10px] text-[17px] font-normal outline-0 lg:w-[500px]'
                          type='text'
                          maxLength={100}
                          placeholder=''
                          {...register('scheduleCalendlyLink')}
                        />
                      </div>
                    </div>
                    <div className={`mt-[20px]`}>
                      <span className='flex flex-row'>
                        Service tags
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.tags?.message}
                        </p>
                      </span>
                      <Controller
                        name='tags'
                        control={control}
                        defaultValue={[]}
                        rules={{
                          required: 'At least three tags are required',
                          validate: (value) =>
                            value.length >= 3 ||
                            'At least three tags are required',
                        }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            multiple
                            disabled={isLoading}
                            className='mt-[10px]'
                            options={skillOptions}
                            size='small'
                            getOptionLabel={(option) => `${option}`}
                            filterOptions={(options, state) =>
                              options.filter((option) =>
                                option
                                  .toLowerCase()
                                  .includes(state.inputValue.toLowerCase())
                              )
                            }
                            onChange={(e, newValue) => {
                              if (newValue.length <= 5) {
                                field.onChange(newValue)
                              } else {
                                toast.error('Only 5 tags', {
                                  position: toast.POSITION.TOP_RIGHT,
                                })
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant='outlined'
                                id='margin-none'
                                sx={{
                                  width: isSmallScreen ? '280px' : '500px',
                                  marginBottom: `${
                                    field.value.length >= 2 ? '50px' : ''
                                  }`,
                                  height: `${
                                    field.value.length >= 2 ? '100px' : '45px'
                                  }`,
                                  fieldset: {
                                    height: `${
                                      field.value.length >= 2 ? '100px' : '45px'
                                    }`,
                                    borderColor: '#D4D4D4',
                                    borderRadius: '10px',
                                  },
                                  input: { color: 'black' },
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </div>
                    <div className='mt-[20px]'>
                      <span className='flex flex-row'>
                        {!user.isCompany
                          ? 'Provide a short description about yourself'
                          : 'Provide a short description about your organization'}
                        <p className='ml-[8px] text-[10px] font-normal text-[#ff0000] '>
                          {errors.description?.message}
                        </p>
                      </span>
                      <textarea
                        disabled={isLoading}
                        className='mt-[10px] h-[200px] w-[380px] rounded-[10px] border border-[#D4D4D4] bg-white px-[20px] py-[25px] text-[17px] font-normal outline-0 lg:w-[500px]'
                        maxLength={100}
                        placeholder=''
                        {...register('description')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className='mt-[60px] flex pb-[10px] lg:pb-60'>
                  <button
                    disabled={true}
                    className=' mr-[15px] h-[50px] w-[250px] rounded-[10px] bg-[#7a89a5] px-[25px] py-[12px] text-[12px] font-bold text-white  lg:text-[16px]'
                    onClick={handleSubmit(onSubmit)}
                  >
                    <span className=''>Update account</span>
                  </button>
                  <svg
                    className='mt-1 animate-spin'
                    height='40px'
                    id='Icons'
                    version='1.1'
                    viewBox='0 0 80 80'
                    width='40px'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M58.385,34.343V21.615L53.77,26.23C50.244,22.694,45.377,20.5,40,20.5c-10.752,0-19.5,8.748-19.5,19.5S29.248,59.5,40,59.5  c7.205,0,13.496-3.939,16.871-9.767l-4.326-2.496C50.035,51.571,45.358,54.5,40,54.5c-7.995,0-14.5-6.505-14.5-14.5  S32.005,25.5,40,25.5c3.998,0,7.617,1.632,10.239,4.261l-4.583,4.583H58.385z' />
                  </svg>
                </div>
              ) : (
                <div className='mt-[60px] pb-60'>
                  <button
                    type='submit'
                    onClick={handleSubmit(onSubmit)}
                    className={`h-[50px] w-[250px] rounded-[10px] border border-[#0354EC] px-[25px] py-[12px] text-[12px] font-bold text-[#0354EC] hover:bg-[#0354EC] hover:text-[#fff] lg:text-[16px]`}
                  >
                    <span className=''>Update account</span>
                  </button>
                </div>
              )}
            </form>
            {/* <div className="flex h-fit">
              {selectedFiles.length === 0 ? (
                <label className="">
                  <div className="">
                    <img
                      src={`${
                        process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                          ? process.env.NEXT_PUBLIC_BASE_PATH
                          : ''
                      }/images/register/user-logo.svg`}
                      alt="image"
                      className={`mr-[25px] w-[107px] cursor-pointer`}
                    />

                    <input
                      type="file"
                      disabled={isLoading}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <FileList files={selectedFiles} onRemove={removeFile} />
              )}
              {selectedFiles.length === 0 ? (
                <p className="flex items-center">Upload Picture</p>
              ) : (
                <div> </div>
              )}
            </div> */}
          </div>
        </section>
      </>
    )
  }
}

export default Profile
