import { UseCase } from "__SHARED_PACKAGE__";
import { __AGGREGATE_CLASS_NAME__ } from "../model";
import { __AGGREGATE_REPOSITORY_NAME__ } from "../provider";

export interface Update__AGGREGATE_CLASS_NAME__In {
  entity: __AGGREGATE_CLASS_NAME__;
}

export class Update__AGGREGATE_CLASS_NAME__
  implements UseCase<Update__AGGREGATE_CLASS_NAME__In, __AGGREGATE_CLASS_NAME__>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(input: Update__AGGREGATE_CLASS_NAME__In): Promise<__AGGREGATE_CLASS_NAME__> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.update(input.entity);
  }
}
