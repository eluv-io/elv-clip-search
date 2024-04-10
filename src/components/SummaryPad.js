import React, { useEffect, useState } from "react";
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";
import { toTimeString } from "../utils";

const SummaryPad = (props) => {
  const [summaries, setSummaries] = useState([])
  const [displaying, setDisplaying] = useState(0)
  const [summaryTimestamps, setSummaryTimestamps] = useState([])

  useEffect(() => {
    try{
      console.log("paring summarizations")
      const [_summaries, _times] = getSummaryWithTime();
      if (_summaries.length > 0){
        setSummaries(_summaries)
        setSummaryTimestamps(_times)
      } else {
        const _summaries_backup = getSummary();
        setSummaries(_summaries_backup)
      }
    } catch(err) {
      setSummaries([])
      console.log("Parse llava caption failed")
      console.log(err)
    }
  }, [])
  const getSummary = () => {
    const res = []
    for(let source of props.clipInfo.sources){
      if("f_llava_as_string" in source["fields"]){
        for(let summary of source["fields"]["f_llava_as_string"]){
          res.push(summary)
        }
      }
    }
    return res
  }
  const getSummaryWithTime = () => {
    const summaries = []
    const times = []

    const summaries_with_time = []

    try{
      for(let source of props.clipInfo.sources){
        if("f_llava_tag" in source["fields"]){
          for(let summary of source["fields"]["f_llava_tag"]){
            summaries_with_time.push({
              start_time: summary["start_time"], 
              end_time: summary["end_time"],
              text: summary["text"][0]
            })
          }
        }
      }
    } catch (err) {
      console.log("Get summaries with time info failed, possible no time information")
      return [[], []]
    }

    summaries_with_time.sort((a,b) => a.start_time - b.start_time);

    for(let obj of summaries_with_time){
      summaries.push(obj["text"])
      times.push(
        {
          start_time: obj["start_time"], 
          end_time: obj["end_time"]
        }
      )
    }

    return [summaries, times]
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
          backgroundColor: "lightgray",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "30%",
            width: "10%",
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
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: "90%",
            width: "70%",
          }}
        >
          {/* local tag idx */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "90%",
              width: "20%",
            }}
          >
            <div 
              style={{fontSize: 12}}  
            >
              # 
            </div>
            <div 
              style={{fontSize: 20}}  
            >
              {summaryTimestamps.length > 0 ? displaying : ""}
            </div>
          </div>
          {/* global timestamps */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "90%",
              width: "40%",
            }}
          >
            <div 
              style={{fontSize: 12}}  
            >
              Timestamp
            </div>
            <div 
              style={{fontSize: 20, cursor: "pointer"}}  
              onClick={() => {
                if (props.videoElementRef.current) {
                  if((props.fpsDenominator.current > 0) &&  (props.fpsNumerator.current > 0)){
                    const _globalStart = props.clipInfo.start_time 
                    const _globalFrame = Math.round(_globalStart * props.fpsDenominator.current / 1000 /  props.fpsNumerator.current)
                    const _segFrameOffset = _globalFrame % 48  // 48 is a fixed number, fabric is saving 48 frames into a segment
                    const _segSecOffset = _segFrameOffset * props.fpsNumerator.current / props.fpsDenominator.current
                    const _insideOffset = (summaryTimestamps[displaying]["start_time"] - _globalStart) / 1000
                    const t = _insideOffset + _segSecOffset
                    props.videoElementRef.current.pause();
                    props.videoElementRef.current.currentTime = t
                  }
                  
                }                 
              }}
            >
              {summaryTimestamps.length > 0 ? toTimeString(summaryTimestamps[displaying]["start_time"]) : ""}
            </div>
          </div>
        </div>
        
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "30%",
            width: "10%",
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
        {summaries.length > 0 ? summaries[displaying] : ""}
      </div>
    </div>
  )
}

export default SummaryPad;