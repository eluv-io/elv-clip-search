import Feedback from "./Feedback";
import React, { useState } from "react";
import { BsCloudDownload } from "react-icons/bs"
import { BiCopy, BiCheckDouble} from "react-icons/bi";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { set } from "mongoose";

const videoInfo = {
  width: "100%",
  height: "83%",
  display: " flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
};

const shortInfo = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: "12%",
  fontSize: 11,
};

const urlContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "50%",
  backgroundColor: "transparent",
}

const urlDisplay = {
  height: "85%",
  width: "100%",
  backgroundColor: "transparent",
  padding: 5,
  borderRadius: 5,
  overflow:"scroll",
  wordWrap: "break-word",
  fontSize: 9
}


const InfoPad = (props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "15%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            height: "100%",
            width: "10%",
            borderBottom: showDetails ? "solid" : "none",
          }}
          id={`detail_select_${props.clipInfo.rank}`}
          onMouseEnter={() => {
            if (!showDetails) {
              document.getElementById(
                `detail_select_${props.clipInfo.rank}`
              ).style.borderBottom = "dashed";
            }
          }}
          onMouseOut={() => {
            if (!showDetails) {
              document.getElementById(
                `detail_select_${props.clipInfo.rank}`
              ).style.borderBottom = "none";
            }
          }}
          onClick={() => {
            if (!showDetails) {
              setShowDetails(true);
            }
          }}
        >
          Details
        </button>
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            height: "100%",
            width: "10%",
            borderBottom: showDetails ? "none" : "solid",
          }}
          id={`review_select_${props.clipInfo.rank}`}
          onMouseEnter={() => {
            if (showDetails) {
              document.getElementById(
                `review_select_${props.clipInfo.rank}`
              ).style.borderBottom = "dashed";
            }
          }}
          onMouseOut={() => {
            if (showDetails) {
              document.getElementById(
                `review_select_${props.clipInfo.rank}`
              ).style.borderBottom = "none";
            }
          }}
          onClick={() => {
            if (showDetails) {
              setShowDetails(false);
            }
          }}
        >
          Review
        </button>
      </div>
      {showDetails ? (
        <div style={videoInfo}>
          <div style={shortInfo}>
            <div>content id: </div>
            <div>{props.clipInfo.id}</div>
          </div>

          {/* {props.searchAssets === true ? (
            <div style={shortInfo}>
              <div>prefix: </div>
              <div>{props.clipInfo.prefix}</div>
            </div>
          ) : (
            <>
              <div style={shortInfo}>
                <div>time interval: </div>
                <div>
                  {props.clipInfo.start} - {props.clipInfo.end}
                </div>
              </div>

              <div style={shortInfo}>
                <div>shot source count: </div>
                <div>{props.clipInfo.source_count}</div>
              </div>
            </>
          )} */}

          {props.searchVersion === "v2" ? (
            <div style={shortInfo}>
              <div>BM25 rank: </div>
              <div>{props.clipInfo.rank}</div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "76%",
            }}
          >
            <div style={urlContainer} >
              <div 
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <div style={{fontSize: 10, fontWeight: "bold", marginRight: 10}}>Embed URL</div>
                <div style={{cursor: "pointer"}}>
                <CopyToClipboard onCopy={()=> {setCopied(true)}} text={props.clipEmbedUrl || props.assetsUrl}>
                  <BiCopy/>
                </CopyToClipboard>
                </div>
                {copied && <BiCheckDouble />}
              </div>
              <div style={urlDisplay}>
                {props.clipEmbedUrl || props.assetsUrl}
              </div>
            </div>
            
            <div style={urlContainer} >

              <div 
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <div style={{fontSize: 10, fontWeight: "bold", marginRight: 10}}>Download URL</div>
                <div style={{cursor: "pointer"}}>
                  <BsCloudDownload 
                    onClick={() => {
                      let element = document.createElement("a");

                      element.download = `${props.clipInfo.id}_${props.clipInfo.start_time}_${props.clipInfo.end_time}.mp4`;
                      console.log(element.download)
                      element.href = props.clipDownloadUrl;
          
                      element.style.display = "none";
                      document.body.appendChild(element);
                    
                      element.click();
                    
                      document.body.removeChild(element);
                      window.URL.revokeObjectURL(props.clipDownloadUrl);
                    }}
                  />
                </div>
                
                
              </div>
              
              <div style={urlDisplay}>
                {props.clipDownloadUrl}
              </div>
            </div>
          </div>

        </div>

        
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "80%",
          }}
        >
          <Feedback
            dbClient={props.dbClient}
            walletAddr={props.walletAddr}
            searchId={props.searchId}
            searchAssets={props.searchAssets}
            viewTime={props.viewTime}
            clipInfo={props.clipInfo}
            contents={props.contents}
          ></Feedback>
        </div>
      )}
    </div>
  );
};

export default InfoPad;
