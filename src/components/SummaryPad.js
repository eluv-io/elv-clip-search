import React, { useEffect, useState } from "react";
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";


const SummaryPad = (props) => {
  const [summaries, setSummaries] = useState([])
  const [displaying, setDisplaying] = useState(0)
  useEffect(() => {
    try{
      const _summaries = getSummary();
      setSummaries(_summaries)
      console.log(_summaries)
    } catch(err) {
      setSummaries([])
      console.log("Parse llava caption failed")
      console.log(err)
    }
  }, [])
  const getSummary = () => {
    const res = []
    for(let source of props.clipInfo.sources){
      if("f_lava" in source["fields"]){
        for(let summary of source["fields"]["f_lava"]){
          res.push(summary)
        }
      }
    }
    return res
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      height: "100%",
      width: "100%",
    }}>
      <div 
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5%",
          height: "15%",
          width: "90%",
          border: "solid"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "30%",
            width: "15%",
            cursor: "pointer"
          }}
          onClick={() => {
            setDisplaying(Math.max(displaying-1, 0))
          }}
        >
          <BsCaretLeftFill/>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "90%",
            width: "65%",
            fontSize: 50,
          }}
        >
          {displaying}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "30%",
            width: "15%",
            cursor: "pointer"
          }}
          onClick={() => {
            setDisplaying(Math.min(displaying+1, summaries.length-1))
          }}
        >
          <BsCaretRightFill/>
        </div>

      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          height: "80%",
          width: "90%",
          fontSize: 13,
          padding: 15,
        }}
      >
        {summaries[displaying]}
      </div>
    </div>
  )
}

export default SummaryPad;