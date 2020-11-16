// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getMenuRef, resolveMenu, mapMeals } from 'lib/firebase'
import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
    method,
  } = req

  return new Promise<void>(async (resolve) => {
    if (typeof id !== 'string') {
      res.status(400).end('id is required')
      return resolve()
    }

    const menuRef = getMenuRef(id)

    switch (method) {
      case 'GET':
        const data = await resolveMenu(id)
        res.json(data)
        break
      case 'PUT':
        try {
          const meals = mapMeals(req.body.meals)
          await menuRef.update({ ...req.body, meals })
          res.status(200).end()
        } catch (err) {
          res.status(400).json(err)
        }
        break
      case 'POST':
        try {
          const meals = mapMeals(req.body.meals)
          await menuRef.create({ ...req.body, meals })

          const data = await resolveMenu(id)
          res.status(200).json(data)
        } catch (err) {
          res.status(400).json(err)
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }

    return resolve()
  })
}
