import { createClient } from 'contentful'

export const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
})

export async function getPosts() {
  const post = await client.getEntries({
    content_type: 'company',
  })
  return post.items.map((item) => item.fields)
}
