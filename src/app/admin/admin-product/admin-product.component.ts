import { Component, OnInit, TemplateRef } from '@angular/core';
import { ICategory } from 'src/app/shared/interfaces/category.interface';
import { IProduct } from 'src/app/shared/interfaces/product.interface';
import { Product } from 'src/app/shared/models/product.model';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, config } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.scss']
})
export class AdminProductComponent implements OnInit {
  categories: Array<ICategory> = [];
  categoryName: string;
  adminProducts: Array<IProduct> = [];
  productID = 1;
  productCategory: ICategory = { id: 1, nameEN: 'necklace', nameUA: 'намиста' };
  productNameEN: string;
  productNameUA: string;
  productDescription: string;
  productLength: string;
  productWidth: string;
  productPrice: number;
  productImage: string;
  productColor: string;
  productZodiac: string;
  productStone: string;

  currProduct: IProduct;
  editStatus: boolean;
  imageStatus: boolean;
  uploadProgress: Observable<number>;

  modalRef: BsModalRef;


  constructor(private catService: CategoryService,
    private prodService: ProductService,
    private afStorage: AngularFireStorage,
    private modalService: BsModalService) { }

  ngOnInit(): void {
    this.adminJSONCategories();
    this.getProducts();
  }

  private adminJSONCategories(): void {
    this.catService.getJSONCategory().subscribe(data => {
      this.categories = data;
    });
  }

  private getProducts(): void {
    this.prodService.getJSONProduct().subscribe(data => {
      this.adminProducts = data;
    });
  }

  setCategory(): void {
    this.productCategory = this.categories.filter(cat => cat.nameEN === this.categoryName)[0];
  }

  addProduct(): void {
    const newProd = new Product(this.productID,
      this.productCategory,
      this.productNameEN,
      this.productNameUA,
      this.productDescription,
      this.productLength,
      this.productWidth,
      this.productPrice,
      this.productImage,
      this.productColor,
      this.productZodiac,
      this.productStone);
    if (this.editStatus == true) {
      this.prodService.updateJSONProduct(newProd).subscribe(() => {
        this.getProducts();
      })
      // this.prodService.updateFireCloudProduct({ ...newProd })
      // .then(message => console.log(message))
      // .catch(err => console.log(err));
      this.editStatus = false;
    }
    else {
      delete newProd.id;
      this.prodService.postJSONProduct(newProd).subscribe(() => {
        this.getProducts();
      });
      // this.prodService.postFireCloudProduct({ ...newProd })
      // .then(message => console.log(message))
      // .catch(err => console.log(err));
    }
    this.resetForm();
  }

  uploadFile(event): void {
    const file = event.target.files[0];
    const type = file.type.slice(file.type.indexOf('/') + 1);
    const name = file.name.slice(0, file.name.lastIndexOf('.')).toLowerCase();
    const filePath = `images/${name}.${type}`;
    const upload = this.afStorage.upload(filePath, file);
    this.uploadProgress = upload.percentageChanges();
    upload.then(image => {
      this.afStorage.ref(`images/${image.metadata.name}`).getDownloadURL().subscribe(url => {
        this.productImage = url;
        this.imageStatus = true;
      });
    });
  }

  deleteImage(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }
  confirmImage(): void {
    this.afStorage.storage.refFromURL(this.productImage).delete();
    this.modalRef.hide();
    this.imageStatus = false;
  }
  decline(): void {
    this.modalRef.hide();
  }

  private resetForm(): void {
    this.productCategory = this.categories[0];
    this.productNameEN = '';
    this.productNameUA = '';
    this.productDescription = '';
    this.productLength = '';
    this.productWidth = '';
    this.productPrice = null;
    this.productImage = '';
    this.productColor = '';
    this.productZodiac = '';
    this.productStone = '';
    this.imageStatus = false;
  }

  deleteProduct(product: IProduct, template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    this.currProduct = product;
  }
  confirmDeleteProduct(product: IProduct): void {
    product = this.currProduct;
    // if (product.image !== 'https://probapera.org/content/publication/PH19623_2.JPG') {
    // this.afStorage.storage.refFromURL(product.image).delete();
    // }
    this.prodService.deleteJSONProduct(product.id).subscribe(() => {
      this.getProducts();
      // this.adminFireCloudProducts();
    });
    // this.prodService.deleteFireCloudProduct(product.id.toString())
    // .then(data => console.log(data))
    // .catch(error => console.log(error))
    this.modalRef.hide();
  }
  editProduct(prod: IProduct): void {
    this.editStatus = true;
    this.productID = prod.id;
    this.productCategory = this.categories.filter(cat => cat.nameEN === prod.category.nameEN)[0];
    this.categoryName = prod.category.nameEN;
    this.productNameEN = prod.nameEN;
    this.productNameUA = prod.nameUA;
    this.productDescription = prod.description;
    this.productLength = prod.length;
    this.productWidth = prod.width;
    this.productPrice = prod.price;
    this.productImage = prod.image;
    this.productColor = prod.color;
    this.productZodiac = prod.zodiac;
    this.productStone = prod.stone;
    this.imageStatus = false;
  }

}