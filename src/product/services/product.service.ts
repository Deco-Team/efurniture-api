import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ProductRepository } from '@product/repositories/product.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CreateProductDto } from '@product/dto/product.dto'
import { ProductStatus } from '@common/contracts/constant'
import { CategoryRepository } from '@category/repositories/category.repository'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { MongoServerError } from 'mongodb'
import * as _ from 'lodash'

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  public async getAllProducts(paginationParams: PaginationParams) {
    return await this.productRepository.paginate(
      {
        status: {
          $ne: ProductStatus.DELETED
        }
      },
      { ...paginationParams, populate: 'categories' }
    )
  }

  public async getAllPublicProducts(paginationParams: PaginationParams) {
    const result = await this.productRepository.paginate(
      {
        status: {
          $in: ProductStatus.ACTIVE
        }
      },
      {
        ...paginationParams,
        projection: {
          name: 1,
          price: 1,
          rate: 1,
          images: 1
        }
      }
    )
    return result
  }

  public async createProduct(productDto: CreateProductDto) {
    const categories = await this.categoryRepository.findMany({ conditions: { _id: { $in: productDto.categories } } })
    if (categories.length !== productDto.categories.length) throw new AppException(Errors.CATEGORY_NOT_FOUND)
    try {
      return await this.productRepository.create(productDto)
    } catch (err) {
      if (err instanceof MongoServerError) {
        const { code, keyPattern, keyValue } = err
        // validate unique sku in variants
        // err ex: MongoServerError: E11000 duplicate key error collection: variants.sku_1 dup key: { variants.sku: "EF20241011" }
        if (code === 11000 && _.get(keyPattern, 'variants.sku') === 1) {
          throw new BadRequestException(
            `Đã tồn tại sản phẩm với sku: ${_.get(keyValue, 'variants.sku')}. Vui lòng nhập sku khác.`
          )
        }
      }
      console.error(err)
      throw err
    }
  }

  public async getProductsDetail(id: string) {
    const result = await this.productRepository.findOne({
      conditions: {
        _id: id
      },
      projection: {
        status: 0,
        createdAt: 0,
        updatedAt: 0
      }
    })
    if (!result) throw new AppException(Errors.PRODUCT_NOT_FOUND)
    return result
  }
}
