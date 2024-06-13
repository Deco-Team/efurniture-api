import { HttpStatus } from '@nestjs/common'
import { ErrorResponse } from '@common/exceptions/app.exception'
export const Errors: Record<string, ErrorResponse> = {
  VALIDATION_FAILED: {
    error: 'VALIDATION_FAILED',
    message: 'Dữ liệu không hợp lệ',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  OBJECT_NOT_FOUND: {
    error: 'OBJECT_NOT_FOUND',
    message: 'Không tìm thấy đối tượng',
    httpStatus: HttpStatus.NOT_FOUND
  },
  WRONG_EMAIL_OR_PASSWORD: {
    error: 'WRONG_EMAIL_OR_PASSWORD',
    message: 'Email hoặc mật khẩu không đúng',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  INACTIVE_ACCOUNT: {
    error: 'INACTIVE_ACCOUNT',
    message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên lạc với admin.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  EMAIL_ALREADY_EXIST: {
    error: 'EMAIL_ALREADY_EXIST',
    message: 'Email đã được sử dụng',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CUSTOMER_NOT_FOUND: {
    error: 'CUSTOMER_NOT_FOUND',
    message: 'Thông tin khách hàng không tồn tại.',
    httpStatus: HttpStatus.NOT_FOUND
  },
  NOT_ENOUGH_QUANTITY_IN_STOCK: {
    error: 'NOT_ENOUGH_QUANTITY_IN_STOCK',
    message: 'Không đủ số lượng trong kho.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_ALREADY_EXIST: {
    error: 'CATEGORY_ALREADY_EXIST',
    message: 'Danh mục đã tồn tại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_NAME_DUPLICATED: {
    error: 'CATEGORY_NAME_DUPLICATED',
    message: 'Tên danh mục đã tồn tại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_NOT_FOUND: {
    error: 'CATEGORY_NOT_FOUND',
    message: 'Không tìm thấy danh mục',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PRODUCT_NOT_FOUND: {
    error: 'PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CART_EMPTY: {
    error: 'CART_EMPTY',
    message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CART_ITEM_INVALID: {
    error: 'CART_ITEM_INVALID',
    message: 'Sản phẩm không có trong giỏ hàng.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_NOT_FOUND: {
    error: 'ORDER_NOT_FOUND',
    message: 'Không tìm thấy đơn hàng',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_ITEMS_INVALID: {
    error: 'ORDER_ITEMS_INVALID',
    message: 'Sản phẩm không có trong giỏ hàng.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_STATUS_INVALID: {
    error: 'ORDER_STATUS_INVALID',
    message: 'Đơn hàng không hợp lệ.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  STAFF_NOT_FOUND: {
    error: 'STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CONSULTANT_BOOKING_NOT_FOUND: {
    error: 'CONSULTANT_BOOKING_NOT_FOUND',
    message: 'Không tìm thấy lịch đặt tư vấn. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CONSULTANT_STAFF_NOT_FOUND: {
    error: 'CONSULTANT_STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên tư vấn. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  DELIVERY_STAFF_NOT_FOUND: {
    error: 'DELIVERY_STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên giao hàng',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_HAS_ASSIGNED_DELIVERY: {
    error: 'ORDER_HAS_ASSIGNED_DELIVERY',
    message: 'Đơn hàng đã được giao cho người vận chuyển',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  SHIPPING_TASK_INVALID: {
    error: 'SHIPPING_TASK_INVALID',
    message: 'Công việc được chọn không hợp lệ',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  VISIT_SHOWROOM_BOOKING_NOT_FOUND: {
    error: 'VISIT_SHOWROOM_BOOKING_NOT_FOUND',
    message: 'Không tìm thấy lịch tham quan showroom. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  TRIPO_3D_AI_ERROR: {
    error: 'TRIPO_3D_AI_ERROR',
    message: 'Có chút lỗi xảy ra. Vui lòng thử lại sau giây lát bạn nhé.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR
  },
  EDEN_AI_ERROR: {
    error: 'EDEN_AI_ERROR',
    message: 'Có chút lỗi xảy ra. Vui lòng thử lại sau giây lát bạn nhé.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR
  },
  NOT_ENOUGH_CREDITS_ERROR: {
    error: 'NOT_ENOUGH_CREDITS_ERROR',
    message: 'Số lượng credits còn lại không đủ. Vui lòng nạp thêm nhé.',
    httpStatus: HttpStatus.BAD_REQUEST
  }
}
