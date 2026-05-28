import { Request, Response, NextFunction } from 'express'

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info, Apikey')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
