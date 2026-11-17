import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface UuidProvider {
  generate(): string;
}

@Injectable()
export class NodeUuidProvider implements UuidProvider {
  generate(): string {
    return randomUUID();
  }
}
