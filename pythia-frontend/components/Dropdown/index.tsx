import { useEffect, useRef, useState } from 'react'

const Dropdown = ({ onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('US East (Boston)')
  const dropdownRef = useRef(null)

  const valueOptions = [
    'US East (Boston)',
    'US West (Oregon)',
    'US East 1 (N. Virginia)',
    'US West 1 (N. California)',
    'Asia Pacific (Sydney)',
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

  return (
    <div
      className='relative inline-block text-left text-[10px] font-bold text-[#000] md:text-[12x] lg:text-[14px] lg:!leading-[24px] xl:text-[16px] 2xl:text-[20px]'
      ref={dropdownRef}
    >
      <div>
        <button
          type='button'
          className={`inline-flex w-full justify-center gap-x-[5px] rounded-[4px]  pr-4 transition duration-300 ease-in-out hover:text-[#686868] focus:outline-none focus:ring-2  focus:ring-offset-2 lg:gap-x-[10px]
          ${isOpen ? 'bg-[#fdfdfd] text-[#686868]' : ''}`}
          id='options-menu'
          aria-haspopup='true'
          aria-expanded='true'
          onClick={() => setIsOpen(!isOpen)}
        >
          {value}
          <svg
            viewBox='0 0 16 12'
            className='my-auto h-[6px] w-[8px] lg:h-[10px] lg:w-[16px]'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M7.36475 10.6997L0.724121 4.05908C0.265137 3.6001 0.265137 2.85791 0.724121 2.40381L1.82764 1.30029C2.28662 0.841309 3.02881 0.841309 3.48291 1.30029L8.18994 6.00733L12.897 1.30029C13.356 0.841309 14.0981 0.841309 14.5522 1.30029L15.6558 2.40381C16.1147 2.86279 16.1147 3.60498 15.6558 4.05908L9.01514 10.6997C8.56592 11.1587 7.82373 11.1587 7.36475 10.6997Z'
              fill='#CFCFCF'
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition'>
          <div
            className='py-1'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            {valueOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setValue(option)
                  setIsOpen(false)
                  onValueChange(option)
                }}
                className='flex cursor-pointer  px-4 py-2 hover:bg-[#f7f5f5] '
              >
                <div className='block transition' role='menuitem'>
                  {option}
                </div>
                {option === value && (
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

export default Dropdown
