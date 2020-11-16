// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getIngredientRef, getIngredientsCollection } from 'lib/firebase'
import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id, name },
    method,
  } = req

  req.body

  return new Promise<void>(async (resolve) => {
    if (typeof id !== 'string') {
      res.status(400).end('id is required')
      return resolve()
    }

    if (id === 'new' && method === 'POST') {
      try {
        const result = await getIngredientsCollection().add(req.body)
        res.status(200).json({ id: result.id })
      } catch (err) {
        res.status(400).json(err)
      }

      return resolve()
    }

    const ingredientRef = getIngredientRef(id)

    switch (method) {
      case 'GET':
        const doc = await ingredientRef.get()
        res.json(doc.data())
        break
      case 'PUT':
        try {
          await ingredientRef.update(req.body)
          res.status(200).end()
        } catch (err) {
          res.status(400).json(err)
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }

    return resolve()
  })
}
