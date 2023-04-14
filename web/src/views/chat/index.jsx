import './index.css'
import React, {useEffect, useRef, useState} from "react";
import {nanoid} from 'nanoid'
import {SendChatApi} from "../../api/ChatApi.js";
import {useLoaderData} from "react-router-dom";
import sendBtnImg from '../../assets/send.svg'
import config from '../../config/app';
import {EventSourcePolyfill} from 'event-source-polyfill'
import spinIcon from '../../assets/spin.gif'

function MsgItem(props) {
  const {isSelf, content, time, state} = props;
  return (
    <div className={`msg-content ${isSelf ? 'self' : ''}`}>
      {state === 'sending' && isSelf && <img src={spinIcon} alt="msg-sending"/>}
      <MsgBubble content={content} self={isSelf} />
    </div>
  )
}

function MsgBubble(props) {
  return <div className={`msg-bubble ${props.self ? 'right' : 'left'}`}>
    <pre>{props.content}</pre>
  </div>
}

let eventSource

export default function ChatView() {
  // history msg
  const historyMessages = useLoaderData();
  const [msg, setMsg] = useState(
    historyMessages.map(item => ({
      content: item.content,
      time: item.createAt,
      id: nanoid(),
      self: item.role === 'user'
    }))
  )

  const [message, setMessage] = useState('')
  const ref = useRef();

  const storeMsg = (content, self, state) => {
    let id = nanoid();
    // send msg
    setMsg((preMsg) => {
      let _msg = [...preMsg];
      _msg.push({
        id,
        content: content,
        time: Date.now(),
        state: self ? state : 'success',
        self
      });
      console.log(_msg)
      return _msg;
    });
    setMessage('');
    return id;
  }

  const changeState = (id, state) => {
    setMsg((preMsg) => {
      let _msg = [...preMsg];
      _msg.forEach(item => {
        if (item.id === id) {
          item.state = state
        }
      })
      return _msg;
    });
  }

  useEffect(() => {
    if (!eventSource) {
      eventSource = new EventSourcePolyfill(config.host + "/msg-sub", {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        heartbeatTimeout: 120000,
      })
      eventSource.onopen = (e) => {
        console.log('open', e)
      }
      eventSource.onerror = (e) => {
        console.log('sse error', e)
        eventSource.close();
      }
      eventSource.addEventListener('chat', (e) => {
        console.log('[ssd-chat] received msg', e.data)
        storeMsg(e.data, false)
      });
    }
    window.addEventListener('beforeunload', function () {
      eventSource.removeEventListener('chat', (e) => {
      });
      eventSource.close();
    });
  }, [])

  // [
  //   {content: '你好,Hello', time: Date.now(), id: 1, self: false},
  //   {content: 'asdfaasdfasdfas1233333333333333333333s', time: Date.now(), id: 2, self: true},
  //   {content: 'bafgv', time: Date.now(), id: 3, self: true},
  //   {content: 'sadfasdfasfd', time: Date.now(), id: 4, self: false},
  // ]

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
      let mid = storeMsg(message, true, 'sending');

      SendChatApi(message).then(result => {
        // mark message send success
        changeState(mid, 'success')
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
              msg.map(item => <MsgItem content={item.content} key={item.id} time={item.time} isSelf={item.self} state={item.state} />)
            }
          </div>
        </div>
        <div className="user-panel">
          <input className="msg-input" onInput={handleInputContent}
                 onKeyDown={handleSubmit}
                 value={message} />
          <div className="msg-send-btn" onClick={handleSubmit}>
            <img src={sendBtnImg} alt='send button' />
          </div>
        </div>
      </div>
    </div>
  )
};
