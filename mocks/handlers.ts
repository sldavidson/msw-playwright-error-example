import { delay, http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

const getUser = http.get('/user/:userId', async ({ params }) => {
  await delay()

  return HttpResponse.json({
    userId: params.userId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatarUrl: faker.image.urlPicsumPhotos({ width: 100, height: 100 }),
  })
})

export const handlers = [getUser]
