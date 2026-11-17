import { PageResult, UseCase } from "__SHARED_PACKAGE__";
import { __AGGREGATE_CLASS_NAME__ } from "../model";
import {
  __AGGREGATE_CLASS_NAME__PageParams,
  __AGGREGATE_REPOSITORY_NAME__,
} from "../provider";

export type Find__AGGREGATE_CLASS_NAME__PageIn = __AGGREGATE_CLASS_NAME__PageParams;

export class Find__AGGREGATE_CLASS_NAME__Page
  implements UseCase<Find__AGGREGATE_CLASS_NAME__PageIn, PageResult<__AGGREGATE_CLASS_NAME__>>
{
  constructor(
    private readonly __AGGREGATE_VARIABLE_NAME__Repository: __AGGREGATE_REPOSITORY_NAME__,
  ) {}

  async execute(
    input: Find__AGGREGATE_CLASS_NAME__PageIn,
  ): Promise<PageResult<__AGGREGATE_CLASS_NAME__>> {
    return this.__AGGREGATE_VARIABLE_NAME__Repository.findPage(input);
  }
}
