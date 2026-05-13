import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrderDTO } from '../../../dtos/order/order.dto';
import { OrderResponse } from '../../../responses/order/order.response';
import { OrderService } from '../../../services/order.service';
import { ApiResponse } from '../../../responses/api.response';

@Component({
  selector: 'app-detail-order-admin',
  templateUrl: './detail.order.admin.component.html',
  styleUrls: ['./detail.order.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DetailOrderAdminComponent implements OnInit {
  orderId: number = 0;
  orderResponse: OrderResponse = {
    id: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    user_id: 0,
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0,
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [],
  };
  private orderService = inject(OrderService);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }
  getOrderDetails(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (apiResponse: any) => {
        // Lưu ý: Kiểm tra xem apiResponse là Object Order hay là { data: Order }
        const response = apiResponse.data ? apiResponse.data : apiResponse;

        // 2. Gán thông tin đơn hàng (đã chạy đúng)
        this.orderResponse.id = response.id;
        this.orderResponse.full_name =
          response.fullName || response.user?.fullName || 'N/A';
        this.orderResponse.email = response.email || response.user?.email || '';
        this.orderResponse.phone_number =
          response.phoneNumber || response.user?.phoneNumber || '';
        this.orderResponse.address =
          response.address || response.user?.address || '';
        this.orderResponse.status = response.status;
        this.orderResponse.order_date = new Date(response.orderDate);
        this.orderResponse.total_money = response.totalMoney;

        // 3. Map chi tiết đơn hàng - PHẦN QUAN TRỌNG NHẤT
        if (response.orderDetails && Array.isArray(response.orderDetails)) {
          this.orderResponse.order_details = response.orderDetails.map(
            (detail: any) => {
              // LỖI Ở ĐÂY: Bạn phải debug chính xác xem 'productResponse'
              // nằm ở đâu trong biến 'detail' này.
              const pInfo = detail.productResponse;

              console.log(
                'Thông tin sản phẩm tìm thấy trong item ' + detail.id + ':',
                pInfo,
              );

              return {
                ...detail,
                product: {
                  // Thay vì dùng gán mặc định ngay, hãy ép kiểu để chắc chắn
                  name: pInfo ? pInfo.name : detail.product_id || detail.id,
                  thumbnail: pInfo?.thumbnail
                    ? `${environment.apiBaseUrl}/products/images/${pInfo.thumbnail}`
                    : '',
                },
                number_of_products:
                  detail.numberOfProducts || detail.number_of_product,
                price: detail.price,
                total_money: detail.totalMoney || detail.total_money,
              };
            },
          );
        }
        console.log('DỮ LIỆU CUỐI CÙNG:', this.orderResponse);
      },
      error: (error: any) => {
        console.error('Lỗi API:', error);
      },
    });
  }

  saveOrder(): void {
    debugger;
    this.orderService
      .updateOrder(this.orderId, new OrderDTO(this.orderResponse))
      .subscribe({
        next: (response: ApiResponse) => {
          debugger;
          // Handle the successful update
          //console.log('Order updated successfully:', response);
          // Navigate back to the previous page
          //this.router.navigate(['/admin/orders']);
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        complete: () => {
          debugger;
        },
        error: (error: any) => {
          // Handle the error
          debugger;
          console.error('Error updating order:', error);
          this.router.navigate(['../'], { relativeTo: this.route });
        },
      });
  }
}
