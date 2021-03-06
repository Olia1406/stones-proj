import { Component, OnInit, TemplateRef } from '@angular/core';
import { IOrder } from 'src/app/shared/interfaces/order.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrdersService } from '../../shared/services/orders.service';

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  styleUrls: ['./admin-order.component.scss']
})

export class AdminOrderComponent implements OnInit {
  adminOrders: Array<IOrder> = [];
  modalRef: BsModalRef;

  totalPrice = 0;
  count = 1;
  currAdmOrder: IOrder;
  statusOption: string;
  constructor(private ordersService: OrdersService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getOrders();
  }

  private getOrders(): void {
    this.ordersService.getFireCloudOrder().subscribe(
      collection => {
        this.adminOrders = collection.map(document => {
          const data = document.payload.doc.data() as IOrder;
          const id = document.payload.doc.id;
          return { id, ...data };
        });
      }
    );
  }

  changeStatus(): void {
    this.currAdmOrder.statusOrder = this.statusOption;
    this.ordersService.updateFireCloudOrder(this.currAdmOrder)
      .then(() => {
        this.getOrders();
      })
      .catch(error => console.log(error))
  }

  openDetailsModal(template: TemplateRef<any>, order: IOrder): void {
    this.currAdmOrder = order;
    this.statusOption = 'В обробці';
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    this.getTotal();
  }

  private getTotal(): void {
    this.totalPrice = this.currAdmOrder.productOrder.reduce((total, prod) => total + (prod.price * prod.count), 0);
  }

  deleteUserOrder(order: IOrder): void {
    if (order.statusOrder == 'Скасовано') {
      if (confirm('Are you sure?')) {
        this.ordersService.deleteFireCloudOrder(order)
          .then(() => {
            this.getOrders();
          })
          .catch(error => console.log(error));
      }
    }
  }
  
//Date formate
readableDate(time) {
  var d = new Date(time);
  let dd = d.getDate();
  let mm = +d.getMonth() +1;
  let yy = d.getFullYear();
  let hh = d.getHours();
  let mmn = d.getMinutes();
  if(mmn>=0 && mmn<10){
  return dd + "/" + mm + "/" + yy + " " + hh + ":0" + mmn;
  }
  else
  return dd + "/" + mm + "/" + yy + " " + hh + ":" + mmn;
}

}