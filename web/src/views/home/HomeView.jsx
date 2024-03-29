import {Link} from "react-router-dom";
import {useState} from "react";

export default function HomeView() {
  return (
    <div>
      <div className="tips">当前版本为体验版本，如有意见请使用“问题与反馈”按钮反馈问题</div>
      <div className="head">
        <span className="head-text">Hi, I am Wall-E</span>
      </div>
      <div className="shortcut-btn-group">
        <div className="btn shortcut-btn">
          <Link to={`/chat`}>智能对话</Link>
        </div>
        <div className="btn shortcut-btn">
          <a href="#">图像生成</a>
        </div>
      </div>
      <div className="tips-wrapper">
        <div className="feedback-btn">问题与反馈（暂不可用）</div>
        <div className="model-desc">AI model by OpenAi GPT-3.5 Turbo</div>
      </div>
    </div>
  )
};
