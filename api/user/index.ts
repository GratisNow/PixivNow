import { VercelRequest, VercelResponse } from '@vercel/node'
import cheerio from 'cheerio'
import { handleError, replaceUrl, request } from '../utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  const token = req.cookies.PHPSESSID || req.query.token
  if (!token) {
    return res.status(403).send({ message: '未配置用户密钥。' })
  }

  request('get', '/', req.query, req.headers)
    .then(({ data }) => {
      const $ = cheerio.load(data)
      const $globalData = $('#meta-global-data')
      if (!$globalData.length || !$globalData?.attr('content')) {
        return res.status(403).send({ message: '无效用户密钥。' })
      }
      const { userData } = JSON.parse($globalData.attr('content'))
      return res.send(replaceUrl(userData))
    })
    .catch((err) => {
      return handleError(err, res)
    })
}
