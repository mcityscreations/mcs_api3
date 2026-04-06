export abstract class StoreAdapter {

    constructor() {}
    abstract uploadProduct(): void;
    abstract updateProduct(): void;
    abstract uploadProductImage(): void;

    abstract getProductCategories(): void;
    abstract getProductAttributes(): void;

    abstract getInvoices(): void;
}