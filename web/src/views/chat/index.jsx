import './index.css'
import React, {useEffect, useRef, useState} from "react";

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
  const [message, setMessage] = useState('')
  const ref = useRef();

  const [msg, setMsg] = useState([
    {content: '你好,Hello', time: Date.now(), id: 1, self: false},
    {content: 'asdfaasdfasdfas1233333333333333333333s', time: Date.now(), id: 2, self: true},
    {content: 'bafgv', time: Date.now(), id: 3, self: true},
    {content: 'sadfasdfasfd', time: Date.now(), id: 4, self: false},
  ])

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
      let _msg = [...msg];
      _msg.push({
        id: Date.now(),
        content: message,
        time: Date.now(),
        self: true
      });
      setMessage('');
      setMsg(_msg);
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
          <button className="msg-send-btn" onClick={handleSubmit}>发送</button>
        </div>
      </div>
    </div>
  )
};