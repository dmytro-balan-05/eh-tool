export type Warehouse = {
    id: string;
    code: string;
    city: string | null;
    address: string;
};

export type OfferMode = "domestic" | "international";