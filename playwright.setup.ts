// playwright.setup.ts
import {
  PlaywrightTestArgs,
  PlaywrightWorkerArgs,
  test as testBase,
  TestFixture,
} from '@playwright/test'
import { createNetworkFixture, type NetworkFixture } from '@msw/playwright'
import { handlers } from './mocks/handlers.js'
import { faker } from '@faker-js/faker'
import { getResponse } from 'msw'

export { expect } from '@playwright/test'

const createResponse = (request: Request) =>
  new Promise<Response | undefined>(resolve => {
    const response = request.url.includes('/user/')
      ? new Response(
          JSON.stringify({
            userId: faker.database.mongodbObjectId(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            avatarUrl: faker.image.urlPicsumPhotos({
              width: 100,
              height: 100,
            }),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      : undefined

    setTimeout(() => {
      resolve(response)
    }, 1)
  })

const getMockedResponse = async (
  request: Request,
  resolutionContext: { baseUrl?: string }
): Promise<Response | undefined> => {
  try {
    const result = await handlers[0]?.run({
      request,
      requestId: faker.string.nanoid(),
      resolutionContext,
    })

    return result?.response
  } catch (error) {
    console.error('Error in getMockedResponse:', error)
    return undefined
  }
}
interface Fixtures {
  network: NetworkFixture
  testResp: TestFixture<void, PlaywrightTestArgs & PlaywrightWorkerArgs>
  testMSW: TestFixture<void, PlaywrightTestArgs & PlaywrightWorkerArgs>
}

export const test = testBase.extend<Fixtures>({
  // Create a fixture that will control the network in your tests.
  // network: createNetworkFixture({
  //   initialHandlers: handlers,
  // }),

  // testResp: [
  //   async ({ page }, use) => {
  //     await page.route(/.+/, async (route, request) => {
  //       const fetchRequest = new Request(request.url(), {
  //         method: request.method(),
  //         headers: new Headers(await request.allHeaders()),
  //         body: request.postDataBuffer(),
  //       })

  //       const response = await getMockedResponse(fetchRequest, {
  //         baseUrl: page.url() !== 'about:blank' ? page.url() : undefined,
  //       })

  //       if (!response) {
  //         return route.fallback()
  //       }
  //       if (response.status === 0) {
  //         return route.abort()
  //       }
  //       return route.fulfill({
  //         status: response.status,
  //         headers: Object.fromEntries(response.headers),
  //         body: response.body
  //           ? Buffer.from(await response.arrayBuffer())
  //           : undefined,
  //       })
  //     })
  //     await use()
  //     await page.unroute(/.+/)
  //   },
  //   { auto: true },
  // ],

  testMSW: [
    async ({ page }, use) => {
      await page.route(/.+/, async (route, request) => {
        const fetchRequest = new Request(request.url(), {
          method: request.method(),
          headers: new Headers(await request.allHeaders()),
          body: request.postDataBuffer(),
        })
        const baseUrl = page.url() !== 'about:blank' ? page.url() : undefined
        const response = await getResponse(handlers, fetchRequest, { baseUrl })

        if (!response) {
          return route.fallback()
        }
        if (response.status === 0) {
          return route.abort()
        }

        return route.fulfill({
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: response.body
            ? Buffer.from(await response.arrayBuffer())
            : undefined,
        })
      })
      await use()
      await page.unroute(/.+/)
    },
    { scope: 'worker', auto: true },
  ],
})
