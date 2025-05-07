export function responsive(dimensionAndUnitType) {
  const value = parseInt(dimensionAndUnitType, 10)
  return `w-[${value}] 2xl:w-full xl:w-[${value * 0.8}] lg:w-[${
    value * 0.7
  }] md:w-[${value * 0.6}] sm:w-[${value * 0.5}]`
}
// This function only receives 1 string as a parameter and by now only redimension pixels units, vh,rm,em and others are no supported at the moment
// To use you need to import it where you at and call it in a template string for use, ex:
/*
import responsive from /utils/responsive.js


const bla = ()=>{
  <>
  <div className=`responsive('20px')`>bli</div>
  <>
}
*/
