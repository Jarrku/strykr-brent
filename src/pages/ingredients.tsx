import { getIngredientsCollection } from 'lib/firebase'
import { InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import Head from 'next/head'

export const getServerSideProps = async () => {
  const ingredients = await getIngredientsCollection().get()

  return {
    props: {
      ingredients: ingredients.docs.map((doc) => ({ id: doc.id, name: doc.data().name })),
    },
  }
}

export default function Home({ ingredients }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <Head>
        <title>Next.js, TypeScript, Tailwind, Jest</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl text-blue-500 grid grid-flow-col grid-cols-1 gap-2 items-center">
        List of ingredients{' '}
        <Link href="/ingredient/new">
          <a className="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-500 focus:outline-none focus:shadow-outline-blue active:bg-indigo-600 transition duration-150 ease-in-out">
            Create new ingredient
          </a>
        </Link>
      </h1>

      <button></button>
      <ul className="list-disc px-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <Link href={`/ingredient/${ingredient.id}`}>
              <a>{ingredient.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
