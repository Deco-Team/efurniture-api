import { BadRequestException, Injectable } from '@nestjs/common'
import { ProductRepository } from '@product/repositories/product.repository'
import { PaginationParams } from '@common/decorators/pagination.decorator'
import { CreateProductDto, UpdateProductDto } from '@product/dto/product.dto'
import { ProductStatus, Status } from '@common/contracts/constant'
import { CategoryRepository } from '@category/repositories/category.repository'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { MongoServerError } from 'mongodb'
import * as _ from 'lodash'
import { FilterQuery } from 'mongoose'
import { Product } from '@product/schemas/product.schema'
import { SuccessResponse } from '@common/contracts/dto'

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  private populateCategories = {
    path: 'categories',
    model: 'Category',
    select: {
      _id: 1,
      name: 1,
      image: 1
    }
  }

  public async getAllProducts(filter: FilterQuery<Product>, paginationParams: PaginationParams) {
    return await this.productRepository.paginate(
      {
        status: {
          $ne: ProductStatus.DELETED
        },
        ...filter
      },
      {
        ...paginationParams,
        populate: this.populateCategories
      }
    )
  }

  public async getAllPublicProducts(filter: FilterQuery<Product>, paginationParams: PaginationParams) {
    const result = await this.productRepository.paginate(
      {
        status: {
          $in: [ProductStatus.ACTIVE]
        },
        ...filter
      },
      {
        ...paginationParams,
        populate: this.populateCategories,
        projection: {
          name: 1,
          rate: 1,
          images: 1,
          modelUrl: 1,
          arPlacement: 1,
          variants: 1,
          categories: 1,
          slug: 1,
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

  public async getProductsDetail(filter: FilterQuery<Product>) {
    const result = await this.productRepository.findOne({
      conditions: {
        ...filter
      },
      projection: {
        status: 0,
        createdAt: 0,
        updatedAt: 0
      },
      populates: [this.populateCategories]
    })
    if (!result) throw new AppException(Errors.PRODUCT_NOT_FOUND)
    return result
  }

  public async updateProduct(filter: FilterQuery<Product>, productDto: UpdateProductDto) {
    let result = await this.productRepository.findOne({
      conditions: {
        ...filter,
        status: {
          $in: [ProductStatus.ACTIVE]
        }
      }
    })
    if (!result) throw new AppException(Errors.PRODUCT_NOT_FOUND)
    result = await this.productRepository.findOneAndUpdate(filter, productDto)
    return result
  }

  public async deleteProduct(filter: FilterQuery<Product>) {
    let result = await this.productRepository.findOne({
      conditions: {
        ...filter,
        status: {
          $in: [ProductStatus.ACTIVE]
        }
      }
    })
    if (!result) throw new AppException(Errors.PRODUCT_NOT_FOUND)
    result = await this.productRepository.findOneAndUpdate(filter, { status: Status.DELETED })
    return new SuccessResponse(true)
  }
}
