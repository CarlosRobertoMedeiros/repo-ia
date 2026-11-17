import { PageResult } from "@<scope>/shared";
import { User, UserPageParams, UserRepository } from "../../src";

export class FakeUserRepository implements UserRepository {
  private readonly storage = new Map<string, User>();

  constructor(initialUsers: User[] = []) {
    for (const user of initialUsers) {
      this.storage.set(user.id, user);
    }
  }

  get users(): User[] {
    return Array.from(this.storage.values());
  }

  async create(data: User): Promise<User> {
    this.storage.set(data.id, data);
    return data;
  }

  async update(data: User): Promise<User> {
    if (!this.storage.has(data.id)) {
      throw new Error(`User with id "${data.id}" was not found.`);
    }

    this.storage.set(data.id, data);
    return data;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<User | null> {
    return this.storage.get(id) ?? null;
  }

  async findPage(params: UserPageParams): Promise<PageResult<User>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const start = (page - 1) * perPage;
    const items = this.users.slice(start, start + perPage);

    return {
      items,
      page,
      perPage,
      total: this.storage.size,
    };
  }
}
