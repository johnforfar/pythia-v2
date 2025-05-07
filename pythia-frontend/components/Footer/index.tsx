/* eslint-disable react/no-unescaped-entities */
const Footer = () => {
  const useCasesOptions = [
    'Financial Analysis',
    'Blockchain Transactions',
    'DEXs and CEXs',
    'Gas Optimization',
    'Crypto Liquidity',
  ]
  return (
    <>
      <section
        id="home"
        className="bg-white px-[30px] pt-[36px]  pb-[57px] text-[#000000] md:px-[70px] md:pt-[43px] md:pb-[68px]  lg:px-[157px] lg:pt-[50px] lg:pb-[80px] xl:px-[180px] xl:pt-[58px] xl:pb-[91px] 2xl:px-[225px] 2xl:pt-[73px] 2xl:pb-[114px]"
      >
        <div className="justify-center  md:flex md:gap-x-[30px] lg:gap-x-[157px] xl:gap-x-[180px] 2xl:gap-x-[225px]">
          <div className="lg:max-w-[615px]">
            <div className="text-[16px] font-bold md:text-[19.2px] lg:text-[22.5px] lg:!leading-[39px] xl:text-[25.5px] 2xl:text-[32px]">
              Openmesh
            </div>
            <div className="mt-[10px] text-[12px] font-normal md:mt-[12px] md:text-[14.5px] lg:mt-[14px] lg:text-[17px] lg:!leading-[29px] xl:text-[19px] 2xl:mt-[20px] 2xl:text-[24px]">
              Building open-source decentralized data infrastructure in Web2 and
              Web3 data
            </div>
            <div className="mt-[16px] text-[8px] font-normal   md:mt-[68px]  md:text-[9px] lg:mt-[80px] lg:text-[11px]  lg:!leading-[19px] xl:mt-[91px] xl:text-[13px] 2xl:mt-[114px] 2xl:text-[16px]">
              Openmesh, 2023
            </div>
          </div>
          <div className="gap-x-[20px] text-[9px] font-normal text-[#959595] md:flex md:gap-x-[24px] md:text-[10px] lg:gap-x-[28px] lg:text-[11px] lg:!leading-[150%] xl:gap-x-[32px] xl:text-[13px] 2xl:gap-x-[40px] 2xl:text-[16px]">
            <div className="mt-[26px] border-t-[1px] border-[#D9D9D9] pb-[8px] pt-[4px] md:mt-[0px] lg:pt-[12px] lg:pb-[12px] 2xl:pt-[15px] 2xl:pb-[15px] ">
              <div className="min-w-[100px] md:pr-[4px] lg:pr-[28px] xl:pr-[32px] 2xl:pr-[40px]">
                <div className="pb-[8px]  font-bold text-[#000] lg:pb-[12px] lg:leading-[19px] 2xl:pb-[15px]">
                  Use Cases
                </div>
                <div className="grid grid-cols-2 justify-between gap-y-[5px] md:block md:!leading-[160%] lg:!leading-[220%]">
                  {useCasesOptions.map((useCase, index) => (
                    <a
                      href={'https://www.openmesh.network/xnode/data-products'}
                      key={index}
                    >
                      <div
                        key={index}
                        className={`cursor-pointer text-[#000] hover:text-[#757575]`}
                      >
                        {useCase}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-[16px] text-[8px] md:mt-[0px]  md:max-w-[220px] md:text-[10px] lg:text-[12px]  xl:text-[13px] 2xl:text-[16px]">
              <div className="border-b-[1px] border-t-[1px] border-[#D9D9D9] pb-[8px]  pt-[4px] text-[#000] lg:pt-[12px] lg:pb-[12px]  2xl:pt-[15px] 2xl:pb-[15px] ">
                <div className="pb-[8px] font-bold lg:pb-[12px] lg:leading-[19px] 2xl:pb-[15px]">
                  Suggest a new feature
                </div>
                <div className=" lg:!leading-[150%]">
                  <a
                    href={'https://www.openmesh.network/oec/register'}
                    target="_blank"
                    className="border-b-[1px] font-medium text-[#0354EC]"
                    rel="noreferrer"
                  >
                    Join our community and let us know what you’d like to add!
                  </a>
                </div>
              </div>
              <div className="mt-[8px] pb-[8px] lg:mt-[12px] lg:pb-[12px] 2xl:mt-[15px] 2xl:pb-[15px]">
                <div className="pb-[8px] font-bold  text-[#000] lg:pb-[12px] lg:leading-[19px] 2xl:pb-[15px]">
                  Have more questions?
                </div>
                <div className=" lg:!leading-[150%]">
                  {' '}
                  <a
                    href={'https://calendly.com/openmesh/30min'}
                    target="_blank"
                    className="border-b-[1px] font-medium text-[#0354EC]"
                    rel="noreferrer"
                  >
                    Schedule a call with an Openmesh Expert
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full border-b-[1px] text-[#D4D4D4]"></div>
    </>
  )
}

export default Footer
