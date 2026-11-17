import { UseCase } from "__SHARED_PACKAGE__";
import { __AGGREGATE_CLASS_NAME__ } from "../model";
import { __AGGREGATE_REPOSITORY_NAME__ } from "../provider";

export interface Find__AGGREGATE_CLASS_NAME__ByIdIn {
  id: string;
}

export class Find__AGGREGATE_CLASS_NAME__ById
  implements UseCase<Find__AGGREGATE_CLASS_NAME__ByIdIn, __AGGREGATE_CLASS_NAME__ | null>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(
    input: Find__AGGREGATE_CLASS_NAME__ByIdIn,
  ): Promise<__AGGREGATE_CLASS_NAME__ | null> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.findById(input.id);
  }
}
