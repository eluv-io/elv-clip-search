import React, { useEffect, useState, useRef} from "react";

import userLogo from "../user.png"
import elvLogo from "../elv.png"
import axios from "axios";

const body={
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  height: "100%",
  width: "90%"
}

const title = {
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "5%",
  width: "100%",
}

const messageBox = {
  flexDirection: "column",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "80%",
  width: "100%",
  border: "solid",
  padding: 15,
  borderWidth: 1,
  borderRadius: 5,
  overflow: "scroll",
}

const inputBox = {
  flexDirection: "row",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "7%",
  width: "90%",
}

const Message = ({item}) => {
  return (
    <div style={{
      flexDirection: "column",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    }}>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100%",
          width: "100%",
        }} 
      >
        <img 
          src={item[0] == 0 ? userLogo : elvLogo} 
          width="30px" height="30px"
        ></img>
        <div style={{
          marginLeft: 10,
          fontWeight: "bold"
        }}>
          {item[0] == 0 ? "You" : "Eluvio virtual assistant"} 
        </div>
        
      </div>
      <div style={{
        marginLeft: 50,
      }}>
        {item[1]}
      </div>
    </div>
  )
}
 


const ChatBox = (props) => {
  const [inputValue, setInputValue] = useState(""); 
  const [chatHistory, setChatHistory] = useState([])
  const [scroll, setScroll] = useState(true)
  const [loading, setLoading] = useState(false)
  const sessionId = useRef("")
  const convToken = useRef("")

  const chatBotObjectId = "iq__2NgfyLG6qeZPMDFZsoEnB2C6kpdj"
  const chatBotAddr = {
    "init": `http://localhost:8083/q/${chatBotObjectId}/start_session`,
    "msg": `http://localhost:8083/q/${chatBotObjectId}/message`
  }
  const createToken = async () => {
    const token = await props.client.CreateSignedToken({
      objectId: chatBotObjectId,
      duration: 24 * 60 * 60 * 1000,
    });
    return token
  }

  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    console.log("scrolling to bottom")
    scrollToBottom()
  }, [scroll]);

  // handling the request

  // dummy waiting req
  const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

  const initConv = async () => {
    const startSessionUrl = new URL(chatBotAddr["init"])
    console.log(startSessionUrl)
    const _token = await createToken()
    convToken.current = _token

    startSessionUrl.searchParams.set("authorization", convToken.current)

    const res = await axios.get(startSessionUrl.toString())
    const _sessionId = res.data["session_id"]
    sessionId.current = _sessionId

    console.log(sessionId.current)
  }

  const msgConv = async (text) => {
    const convUrl = new URL(chatBotAddr["msg"])
    convUrl.searchParams.set("message", text)
    convUrl.searchParams.set("authorization", convToken.current)
    
    console.log(convUrl.toString())

    try{
      const res = await axios.get(convUrl.toString(), 
        { withCredentials: true }
      )
      const msg = res.data["response"]
      console.log(msg)
      return msg
    } catch (err) {
      console.log(err)
      console.log("[Err] talk with LLM error")
      return ""
    }
  }


  // 1. send to LLM to rewrite the query
  // 2. use function provide by parent compoennt to get search res
  const handleRequest = async () => {
    // make sure we disabled the buttons in this component 
    setLoading(true)

    // reset the buttons in parent compoennt
    props.statusHandler()

    // record the current chat history
    const _chatHistory = chatHistory

    try{
      if(sessionId.current === ""){
        await initConv()
      }
      const chatbotRes = await msgConv(inputValue.trim())
      console.log(chatbotRes)
      if(chatbotRes.startsWith("SEARCH")){
        // we get the optimized search query, search 
        const _query = chatbotRes.split(".")[0]
        await props.searchHandler(_query.replace("SEARCH", "").trim())
        // push one msg to chat history
        _chatHistory.push([1, "Here are the results for the search"])
      } else {
        // should not do search 
        if(chatbotRes === ""){
          // push one msg to chat history
          _chatHistory.push([1, "Talking with chatbot went wrong, please use the keyword search"])
        }else{
          // push one msg to chat history
          _chatHistory.push([1, chatbotRes])
        }
      }
    } catch (err) {
      // if anything goes wrong: either search / llm
      console.log(err)
      console.log(`[Error] Prompt search err`)
      _chatHistory.push([1, "Prompt search error, please use the keyword search"])
    }

    // update chat history
    setChatHistory(_chatHistory)

    // finish loading process
    setLoading(false)

    // scroll to bottom
    setScroll((v) => !v)
  }

  return (
    <div style={body}>
      {/* title */}
      <div style={title}>
          Search Assistant
      </div>

      {/* chat history */}
      <div style={messageBox}>
        {
          chatHistory.map((item) => {
            return (
              <div style={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 60,
                minHeight: 60,
                maxHeight: 60,
                width: "90%",
                padding: 10,
                margin: 10,
                borderRadius: 10,
              }}>
                <Message item={item}></Message>
              </div>
              
            )
          })
        }
       {loading && "loading"}
        <div ref={messagesEndRef}></div>
      </div>

      {/* input box */}
      <div style={inputBox}>
        <button
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "6%",
            height: "90%",
            backgroundColor: loading ? "gray" : "#3b87eb",
            color: "white",
            borderRadius: 5,
            border: "none"
          }}
          onClick={() => {
            setInputValue("")
            setChatHistory([])
            sessionId.current = ""
          }}
          disabled={loading}
        >
          X
        </button>
        <input
          style={{
            width: "80%",
            height: "90%",
            padding: 10,
            borderRadius: 5,
            borderWidth: 1,
          }}
          id="ObjId"
          onChange={(event) => setInputValue(event.target.value)}
          value={inputValue}
          onKeyDown={(event) => {
            if (event.key === "Enter") {}
          }}
        ></input>
        <button
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "8%",
            height: "90%",
            backgroundColor: loading ? "gray" : "#3b87eb",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
          disabled={loading}
          
          onClick={async () => {
            if (inputValue.trim() !== "") {
              const _chatHistory = chatHistory;
              setInputValue("")
              _chatHistory.push([0, inputValue])
              setChatHistory(_chatHistory)
              setScroll((item) => !item)
              await handleRequest()
            }
          }}
        >
          send
        </button>
      </div>
    </div>
  )
}

export default ChatBox