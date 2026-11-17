import { Entity, EntityState } from "__SHARED_PACKAGE__";

export interface __AGGREGATE_CLASS_NAME__State extends EntityState {}

export class __AGGREGATE_CLASS_NAME__ extends Entity<__AGGREGATE_CLASS_NAME__State> {
  constructor(props: __AGGREGATE_CLASS_NAME__State) {
    super(props);
  }

  validate(): void {
    // Placeholder intencional para futuras validacoes do agregado.
  }
}
