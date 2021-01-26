import { HttpException, HttpModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GumroadResponse } from './interfaces/gumroad.interface'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot(), ConfigService],
      providers: [UsersService],
    }).compile()

    service = module.get<UsersService>(UsersService)

    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('verifyGumroadLicense', () => {
    it('should verify a correct license', async () => {
      const productPermalink = configService.get<string>(
        'TEST_GUMROAD_PRODUCT_PERMALINK'
      )
      const licenseKey = configService.get<string>('TEST_GUMROAD_LICENSE_KEY')

      const data = await service.verifyGumroadLicense(
        productPermalink,
        licenseKey,
        false
      )

      expect(data.success).toBe(true)
    })

    it('should throw HttpException on incorrect license', async () => {
      const productPermalink = 'RandomString'
      const licenseKey = 'This-is-totally-invented'

      await expect(
        service.verifyGumroadLicense(productPermalink, licenseKey, false)
      ).rejects.toThrowError(HttpException)
    })
  })

})
