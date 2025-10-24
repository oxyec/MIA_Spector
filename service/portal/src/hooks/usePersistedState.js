import { useEffect, useState } from "react";

// 让页面刷新后仍然保留数据 使用localStorage把React状态持久化到浏览器内部

export default function usePersistedState(key, initial) {
  const [v, setV] = useState(() => {
    const s = localStorage.getItem(key);
    return s !== null ? s : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, v);
  }, [key, v]);
  return [v, setV];
}