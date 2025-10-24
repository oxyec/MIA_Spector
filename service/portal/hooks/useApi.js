// 在React中高效地创建并缓存一个API客户端示例
import {useMemo} from "react";
import { makeApi } from "../api/http";

export default function useApi(baseUrl, apiKey, clientId) {
    return useMemo(() => makeApi(baseUrl, apiKey, clientId), [baseUrl, apiKey, clientId]);
}
