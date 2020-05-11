// Classes
import { Danbooru } from './structures/Booru/Booru'
import { CustomError } from '@/util/classes'

// Types
import { Request } from 'express'
import { PostResponse, ProcessedQueries } from './structures/types'

export async function BooruHandler(
  endpoint: string,
  queryObj: Request['query']
): Promise<PostResponse[]> {
  // General
  const { domain, booruType } = queryObj

  // POSTS
  const processedQueries: ProcessedQueries = {
    limit: Number(queryObj.limit ?? 20),
    pageID: Number(queryObj.pid),
    tags: (queryObj.tags as string) ?? '',
    rating: queryObj.rating as string,
    score: Number(queryObj.score),
    order: queryObj.order as string,
    // SINGLE POST
    postID: Number(queryObj.postID),
    // TAGS
    tag: queryObj.tag as string,
  }

  // BOORU
  let API
  switch (booruType) {
    case 'danbooru':
      API = new Danbooru(domain as string)
      break

    default:
      throw new CustomError('No known booru type', 400)
  }

  // ENDPOINT
  switch (endpoint) {
    // POSTS
    case 'posts':
      return await API.getPosts(processedQueries)

    default:
      throw new CustomError('No endpoint specified', 400)
  }
}