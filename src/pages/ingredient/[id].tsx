import { FirebaseIngredient, getIngredientRef } from 'lib/firebase'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

interface Props {
  ingredient?: Partial<FirebaseIngredient> & { id: string }
}

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async (ctx) => {
  const ingredientId = ctx.params?.id
  if (!ingredientId) return { props: {} }

  if (ingredientId === 'new') return { props: { ingredient: { id: 'new' } } }

  const ingredient = await getIngredientRef(ingredientId).get()

  if (!ingredient.exists) return { props: {} }

  return {
    props: {
      ingredient: { ...ingredient.data()!, id: ingredient.id },
    },
  }
}

export default function Ingredient({ ingredient }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  const [createAnother, setCreateAnother] = useState(false)
  const [lastCreated, setLastCreated] = useState('')

  const [baseAmount, setBaseAmount] = useState(ingredient?.baseAmount ?? 100)
  const [metric, setMetric] = useState<string>(ingredient?.metric ?? 'gram')

  const [name, setName] = useState(ingredient?.name ?? 'New Ingredient')
  const [carboHydrates, setCarboHydrates] = useState(ingredient?.carbohydrates ?? 100)
  const [fat, setFat] = useState(ingredient?.fat ?? 0)
  const [kcal, setKcal] = useState(ingredient?.kcal ?? 0)
  const [protein, setProtein] = useState(ingredient?.protein ?? 0)

  const isNew = ingredient?.id === 'new'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!ingredient) return

    const data: FirebaseIngredient = {
      name,
      carboHydrates,
      fat,
      kcal,
      protein,
      baseAmount,
      // @ts-ignore metric widen
      metric,
    }

    const result = await fetch(`/api/ingredient/${ingredient.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (isNew) {
      const { id } = await result.json()

      createAnother ? resetForm('Created: ' + name) : router.push(`/ingredient/${id}`)
    }
  }

  function resetForm(info: string) {
    setLastCreated(info)
    setBaseAmount(100)
    setMetric('gram')
    setName('New Ingredient')
    setCarboHydrates(100)
    setFat(0)
    setKcal(0)
    setProtein(0)
  }

  if (!ingredient) return <div>Error: Could not find ingredient!</div>

  return (
    <div>
      {ingredient.name && <h4 className="text-orange-500">Editing ingredient: {ingredient.name}</h4>}
      <h4 className={isNew ? 'text-green-500' : 'text-orange-500'}>ID: {ingredient.id}</h4>
      <form onSubmit={onSubmit} className="grid grid-flow-row gap-4">
        <Input label="Name" type="text" value={name} onChange={(value) => setName(value)} />
        <div className="grid grid-flow-col gap-4">
          <Input
            label="Base Amount"
            type="number"
            value={baseAmount}
            onChange={(value) => setBaseAmount(Number.parseFloat(value))}
          />
          <Input label="Metric" type="text" value={metric} onChange={(value) => setMetric(value)} />
        </div>
        <h3>Nutrients</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Carbohydrates"
            type="number"
            value={carboHydrates}
            onChange={(value) => setCarboHydrates(Number.parseFloat(value))}
          />
          <Input label="Fat" type="number" value={fat} onChange={(value) => setFat(Number.parseFloat(value))} />
          <Input label="Kcal" type="number" value={kcal} onChange={(value) => setKcal(Number.parseFloat(value))} />
          <Input
            label="protein"
            type="number"
            value={protein}
            onChange={(value) => setProtein(Number.parseFloat(value))}
          />
        </div>
        {isNew && (
          <div className="flex space-x-2 items-center">
            <label className="text-sm font-medium leading-5 text-gray-700">Create another?</label>
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.currentTarget.checked)}
            />
            {lastCreated && <span className="text-green-500">{lastCreated}</span>}
          </div>
        )}
        <button
          type="submit"
          className="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-500 focus:outline-none focus:shadow-outline-blue active:bg-indigo-600 transition duration-150 ease-in-out"
        >
          {isNew ? 'Create Ingredient' : 'Save Ingredient'}
        </button>
      </form>
      <br />
      <Link href="/ingredients">
        <a className="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-500 focus:outline-none focus:shadow-outline-blue active:bg-indigo-600 transition duration-150 ease-in-out">
          Back to overview
        </a>
      </Link>
    </div>
  )
}

function Input<T extends string | number>({
  label,
  onChange,
  value,
  type,
}: {
  label: string
  onChange: (value: string) => unknown
  value: T
  type: string
}) {
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium leading-5 text-gray-700">
        {label}
      </label>
      <input
        id={label}
        className="mt-1 form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5"
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  )
}
