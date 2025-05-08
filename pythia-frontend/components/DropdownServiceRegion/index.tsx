/* eslint-disable no-unused-vars */
import {
  optionServerLocation,
  valueOptionsServerLocation,
} from '@/utils/constants'
import { useEffect, useRef, useState } from 'react'

const DropdownServiceRegion = ({ onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(optionServerLocation[0])
  const dropdownRef = useRef(null)

  const valueOptions = [
    {
      title: 'US East',
      enabled: true,
      src: '/images/subNavBarServers/usa.svg',
      style: '2xl:w-[31px] xl:w-[25px] lg:w-[22px]  md:w-[19px] w-[16px]',
    },
    {
      title: 'US West',
      enabled: true,
      src: '/images/subNavBarServers/usa.svg',
      style: '2xl:w-[22px] xl:w-[17.5px] lg:w-[15.5px]  md:w-[13.2px] w-[11px]',
    },
    {
      title: 'Sydney',
      enabled: true,
      src: '/images/subNavBarServers/usa.svg',
      style: '2xl:w-[22px] xl:w-[17.5px] lg:w-[15.5px]  md:w-[13.2px] w-[11px]',
    },
  ]

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getSrcForValue = (val) => {
    const matchedOption = valueOptions.find((option) => option.title === val)
    return matchedOption ? matchedOption.src : '' // Retorne uma string vazia ou algum valor padrão se não for encontrado
  }

  return (
    <div
      className='relative w-[124px] rounded-[5px] border-[1px] border-[#D9D9D9] px-[7px] text-left text-[8px] font-normal text-[#000] focus:outline-none focus:ring-2 focus:ring-offset-2  md:w-[149px] md:px-[8.5px] md:text-[9.6x] lg:w-[174px] lg:px-[10px] lg:text-[11.2px] xl:w-[200px] xl:px-[12px] xl:text-[12.8px] 2xl:w-[248px] 2xl:px-[14px] 2xl:text-[16px]'
      ref={dropdownRef}
    >
      <div className='flex'>
        <button
          type='button'
          className={`inline-flex w-full items-center gap-x-[5px] rounded-[4px] py-[6px] transition duration-300 ease-in-out hover:text-[#686868] md:py-[7.2px] lg:gap-x-[10px] lg:py-[8.5px] xl:py-[9.5px]   2xl:gap-x-[15px] 2xl:py-[12px]
          ${isOpen ? 'bg-[#fdfdfd] text-[#686868]' : ''}`}
          id='options-menu'
          aria-haspopup='true'
          aria-expanded='true'
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* <img
            src={`${
              process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                ? process.env.NEXT_PUBLIC_BASE_PATH
                : ''
            }${getSrcForValue(value)}`}
            alt="image"
            className={`my-auto w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]`}
          /> */}
          {value}
          <svg
            className='my-auto ml-auto w-[6px] lg:w-[9px]'
            viewBox='0 0 9 7'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M4.5 7L0.602886 0.25L8.39711 0.25L4.5 7Z' fill='#676767' />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className='absolute left-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition'>
          <div
            className='py-1'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            {valueOptionsServerLocation.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setValue(option.title)
                  setIsOpen(false)
                  onValueChange(option)
                }}
                className='flex cursor-pointer gap-x-[7.5px] px-4 py-2 hover:bg-[#f7f5f5] md:gap-x-[9px]  lg:gap-x-[10.5px] xl:gap-x-[12px] 2xl:gap-x-[15px] '
              >
                {/* <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }${option.src}`}
                  alt="image"
                  className={`my-auto w-[10px] md:w-[12px] lg:w-[14px] xl:w-[16px] 2xl:w-[20px]`}
                /> */}
                <div className=' transition' role='menuitem'>
                  {option.title}
                </div>
                {option.title === value && (
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? process.env.NEXT_PUBLIC_BASE_PATH
                        : ''
                    }/images/dropdown/check.svg`}
                    alt='image'
                    className='ml-auto w-[20px]'
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownServiceRegion
