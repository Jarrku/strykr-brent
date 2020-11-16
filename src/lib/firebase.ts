import admin from 'firebase-admin'

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: 'https://strykr-brent.firebaseio.com',
  })
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  if (!/already exists/u.test(error.message)) {
    // eslint-disable-next-line no-console
    console.error('Firebase admin initialization error', error.stack)
  }
}

export interface FirebaseMenu {
  meals: {
    amount: number
    remark: string
    ingredient: FirebaseFirestore.DocumentReference<FirebaseIngredient>
  }[]
  name: string
}

export interface FirebaseIngredient {
  baseAmount: number
  carbohydrates: number
  fat: number
  kcal: number
  metric: 'gram'
  name: string
  protein: number
}

const firebase = admin.firestore()

export function getMenuCollection() {
  return firebase.collection('menus') as FirebaseFirestore.CollectionReference<FirebaseMenu>
}

export function getIngredientsCollection() {
  return firebase.collection('ingredients') as FirebaseFirestore.CollectionReference<FirebaseIngredient>
}

export function getMenuRef(menuId: string) {
  return getMenuCollection().doc(menuId)
}

export function getIngredientRef(ingredientId: string) {
  return getIngredientsCollection().doc(ingredientId)
}

export async function resolveMenu(id: string) {
  // TODO remove ! typecasts
  const doc = await getMenuRef(id).get()

  const menu = doc.data()!

  const meals = await Promise.all(
    menu.meals.map(async (meal) => {
      const ingredient = await meal.ingredient.get().then((snap) => ({ ...snap.data()!, id: snap.id }))
      return {
        ...meal,
        ingredient,
      }
    }),
  )

  return { id: doc.id, ...menu, meals }
}

export interface Meal {
  amount: number
  remark: string
  ingredient: {
    id: string
  } & FirebaseIngredient
}

export async function mapMeals(meals: Meal[]) {
  return meals.map((meal) => ({
    ...meal,
    ingredient: getIngredientRef(meal.ingredient.id),
  }))
}

export default firebase
