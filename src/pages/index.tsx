/// <reference types="@emotion/react/types/css-prop" />
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Ingredients</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl text-blue-600">Welcome to Your App</h1>
      <Link href="/ingredients">
        <a className="py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-500 focus:outline-none focus:shadow-outline-blue active:bg-indigo-600 transition duration-150 ease-in-out">
          Go to ingredients overview
        </a>
      </Link>
    </div>
  )
}
