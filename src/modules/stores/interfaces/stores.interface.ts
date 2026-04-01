export abstract class StoreAdapter {
    protected readonly apiEndpoint: string;
    constructor(apiEndpoint: string) {
        this.apiEndpoint = apiEndpoint;
    }
    abstract uploadProduct(): void;
    abstract updateProduct(): void;
    abstract uploadProductImage(): void;

    abstract getProductCategories(): void;
    abstract getProductAttributes(): void;
}