import React from 'react'

const URL_SPLIT = /(https?:\/\/[^\s]+)/g
const isUrl = (s: string) => /^https?:\/\//.test(s)

// 將多行文字渲染為 React 節點：保留換行、網址自動轉為可點連結（新分頁開啟）。
export function linkify(text: string): React.ReactNode {
  return text.split('\n').map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split(URL_SPLIT).map((part, i) =>
        isUrl(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline break-all hover:text-blue-800"
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </React.Fragment>
  ))
}
