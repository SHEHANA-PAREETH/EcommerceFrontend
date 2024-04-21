import React from 'react'
import { TiStarFullOutline } from "react-icons/ti";
import { FaStarHalfAlt } from "react-icons/fa";
import { ImStarEmpty } from "react-icons/im";
function Rating({value,text}) {
    const fullStars = Math.floor(value)
    const halfStarts = value- fullStars >0.5? 1:0;
    const emptyStars = 5 -fullStars - halfStarts
    console.log(fullStars,halfStarts,emptyStars);
    const stars1 = Array.from({ length: fullStars }, (_, index) => <TiStarFullOutline key={index} />);
    const stars2 = halfStarts ? <FaStarHalfAlt/>:''
    const stars3 = Array.from({ length: emptyStars }, (_, index) => <ImStarEmpty key={index} />);
      return ( 
    <>
      
            <th>{stars1}{stars2}{stars3}</th>
            <td className=''> {text}</td>
       
        
       
    </>
  )
}

export default Rating