import { Component, OnInit, Input } from "@angular/core";
import { CartService } from "../cart.service";
import { FavoritesService } from "../favorites.service";
declare global {
    interface Window { dataLayer: any[]; }
  }

@Component({
    selector: "[app-products]",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.css"],
})
export class ProductsComponent implements OnInit {
    @Input() product: any = {};
    @Input() loadedProducts = [];
    @Input() cartItems = [];
    @Input() i: number;
    @Input() favorites = [];

    constructor(
        private cart: CartService,
        private favorite: FavoritesService
    ) {}

    ngOnInit() {
               
    }

    onChangeOption(event: any, i: number) {
        //this.loadedProducts[i].pivot.price = event.target.selectedOption;
        let option_index = event.target.selectedOptions[0].index;
        this.loadedProducts[i].selected_option = option_index;
    }

    getProductPrice(id: number) {
        // console.log(this.loadedProducts);
        let price =
            this.loadedProducts[id].pivot.price +
            (this.loadedProducts[id].pivot.type == 0
                ? this.loadedProducts[id].options[
                      this.loadedProducts[id].selected_option
                  ]
                    ? this.loadedProducts[id].options[
                          this.loadedProducts[id].selected_option
                      ].pivot.price
                    : 0
                : 0);

        return price;
    }
    onAddToCart(id: string) {
        let cartRow = this.cartItems.find(
            (product) => product.attributes.id == id
        );

        let product = this.loadedProducts.find((product) => product.id == id);
        if (product.pivot.type == 1) {
            if (cartRow) {
                this.cart.updateQuantity(cartRow.id, 1);
            } else {
                let attributes: any = { id: product.id };
                let price = product.pivot.price;
                let add_product = {
                    id: product.id,
                    name: product.name,
                    price: price,
                    quantity: 1,
                    attributes: attributes,
                };

                this.cart.addToCart(add_product);
            }
        } else {
            if (
                cartRow &&
                cartRow.attributes.option ==
                    product.options[product.selected_option].name
            ) {
                this.cart.updateQuantity(cartRow.id, 1);
            } else {
                let attributes: any = { id: product.id };
                let price = product.pivot.price;
                attributes.option =
                    product.options[product.selected_option].name;
                price += product.options[product.selected_option].pivot.price;

                let add_product = {
                    id: product.id,
                    name: product.name,
                    price: price,
                    quantity: 1,
                    attributes: attributes,
                };

                this.cart.addToCart(add_product);
            }
        }
    }

    onFavoriteProduct(id: number) {
        let index = this.favorites.indexOf(id);
        if (index > -1) {
            //console.log(1);

            this.favorites.splice(index, 1);
            //console.log(this.favorites);
            this.favorite.removeFromFavorites(id);
        } else {
            this.favorite.addToFavorites(id);
        }
    }

    checkFavorite(id: number) {
        if (this.favorites.includes(id)) {
            return "favorite";
        } else {
            return "favorite_outline";
        }
    }
}
