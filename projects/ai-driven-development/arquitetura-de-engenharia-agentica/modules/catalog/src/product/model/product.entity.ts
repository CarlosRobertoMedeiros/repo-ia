import {
  BooleanRule,
  Entity,
  EntityState,
  InRule,
  MaxLengthRule,
  MinLengthRule,
  MinValueRule,
  PrecisionRule,
  RequiredRule,
  Validator,
} from "@sdd/shared";

export const PRODUCT_STATUSES = ["active", "inactive", "draft"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface ProductState extends EntityState {
  name: string;
  description?: string | null;
  price: number;
  status: ProductStatus;
  availableOnline?: boolean;
  featured?: boolean;
  allowsPreOrder?: boolean;
}

export class Product extends Entity<ProductState> {
  constructor(props: ProductState) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  get price(): number {
    return this.props.price;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get availableOnline(): boolean {
    return this.props.availableOnline ?? false;
  }

  get featured(): boolean {
    return this.props.featured ?? false;
  }

  get allowsPreOrder(): boolean {
    return this.props.allowsPreOrder ?? false;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "product.name",
        value: this.name,
        rules: [new RequiredRule(), new MinLengthRule(2), new MaxLengthRule(120)],
      },
      {
        code: "product.description",
        value: this.description,
        rules: [new MaxLengthRule(500)],
      },
      {
        code: "product.price",
        value: this.price,
        rules: [new RequiredRule(), new MinValueRule(0), new PrecisionRule(2)],
      },
      {
        code: "product.status",
        value: this.status,
        rules: [new RequiredRule(), new InRule(PRODUCT_STATUSES)],
      },
      // Valida o valor bruto: o getter devolve `false` quando ausente.
      {
        code: "product.availableOnline",
        value: this.props.availableOnline,
        rules: [new BooleanRule()],
      },
      {
        code: "product.featured",
        value: this.props.featured,
        rules: [new BooleanRule()],
      },
      {
        code: "product.allowsPreOrder",
        value: this.props.allowsPreOrder,
        rules: [new BooleanRule()],
      },
    ]);
  }
}
