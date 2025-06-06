import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'OPTIONS')
    return response.status(200).end();

  if (request.method !== 'POST')
    return response.status(405).json({ message: '只允许 POST 请求' });

  try {
    if (!request.body || typeof request.body !== 'object')
      return response.status(400).json({ code: -1, msg: '请求体无效或为空。' });

    const { id, data } = request.body;

    if (!id || !data)
      return response.status(400).json({ code: -1, msg: '请求参数错误，必须提供 "id" 和 "data" 字段。" });

    await kv.set(`config:${id}`, data);

    return response.status(200).json({ code: 0, msg: '数据存储/更新成功。', id });
  } catch (error) {
    console.error('STORE_DATA_ERROR:', {
      message: error.message,
      stack: error.stack,
      body: request.body
    });
    return response.status(500).json({ code: -2, msg: `数据库操作失败: ${error.message}` });
  }
}