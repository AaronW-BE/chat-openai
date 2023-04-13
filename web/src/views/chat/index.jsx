import './index.css'
import React, {useEffect, useRef, useState} from "react";
import {SendChatApi} from "../../api/ChatApi.js";
import {useLoaderData} from "react-router-dom";
import sendBtnImg from '../../assets/send.svg'

function MsgItem(props) {
  const {isSelf, content, time} = props;
  return (
    <div className={`msg-content ${isSelf ? 'self' : ''}`}>
      <MsgBubble content={content} self={isSelf} />
    </div>
  )
}

function MsgBubble(props) {
  return <div className={`msg-bubble ${props.self ? 'right' : 'left'}`}>
    <pre>{props.content}</pre>
  </div>
}

export default function ChatView() {
  // history msg
  const historyMessages = useLoaderData();
  const [message, setMessage] = useState('')
  const ref = useRef();

  // [
  //   {content: '你好,Hello', time: Date.now(), id: 1, self: false},
  //   {content: 'asdfaasdfasdfas1233333333333333333333s', time: Date.now(), id: 2, self: true},
  //   {content: 'bafgv', time: Date.now(), id: 3, self: true},
  //   {content: 'sadfasdfasfd', time: Date.now(), id: 4, self: false},
  // ]

  let id = 0;
  const [msg, setMsg] = useState(
    historyMessages.map(item => ({
      content: item.content,
      time: item.createAt,
      id: ++id,
      self: item.role === 'user'
    }))
  )

  useEffect(() => {
    console.log('changed', msg.length)
    if (ref.current) {
      ref.current.scroll({
        top: ref.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [msg])
  const handleInputContent = (e) => {
    setMessage(e.target.value);
  }
  const handleSubmit = (e) => {
    if (!message) {
      return
    }
    if ((e.type === "keydown" && e.key === 'Enter') || e.type === 'click') {
      // send msg
      let _msg = [...msg];
      _msg.push({
        id: Date.now(),
        content: message,
        time: Date.now(),
        self: true
      });
      setMsg(_msg);
      setMessage('');

      SendChatApi(message).then(result => {
        _msg = [..._msg];
        _msg.push({
          id: Date.now(),
          content: result,
          time: Date.now(),
          self: false
        })
        console.log('response result', result)
        setMsg(_msg);
      }).finally(() => {
        console.log('send success');
      })
    }
  }


  return (
    <div>
      <div className="page-container">
        <div className="msg-wrp" ref={ref}>
          <div>
            {
              msg.map(item => <MsgItem content={item.content} key={item.id} time={item.time} isSelf={item.self} />)
            }
          </div>
        </div>
        <div className="user-panel">
          <input className="msg-input" onInput={handleInputContent}
                 onKeyDown={handleSubmit}
                 value={message} />
          <button className="msg-send-btn" onClick={handleSubmit}>
            <img src={sendBtnImg} alt='send button' />
          </button>
        </div>
      </div>
    </div>
  )
};