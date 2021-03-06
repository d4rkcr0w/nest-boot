/* eslint-disable no-console */

import { Injectable } from "@nestjs/common";
import { outputFile } from "fs-extra";
import {
  camelize,
  dasherize,
  pluralize,
  tableize,
  underscore,
} from "inflection";
import { Environment, FileSystemLoader } from "nunjucks";
import { resolve } from "path";
import prettier from "prettier";

import { Command, Option, Positional } from "../command.decorator";

@Injectable()
export class CreateCodeCommand {
  readonly template: Environment;

  readonly basePath = resolve(process.cwd(), `./src/app/`);

  constructor() {
    this.template = new Environment(
      new FileSystemLoader(resolve(__dirname, `../../templates/`))
    );

    this.template.addFilter("camelize", (value: string) =>
      camelize(value.replace(/-/g, "_"))
    );

    this.template.addFilter("dasherize", (value: string) =>
      dasherize(value.replace(/-/g, "_"))
    );

    this.template.addFilter("pluralize", (value: string) =>
      pluralize(value.replace(/-/g, "_"))
    );

    this.template.addFilter("tableize", (value: string) =>
      tableize(value.replace(/-/g, "_"))
    );

    this.template.addFilter("underscore", (value: string) =>
      underscore(value.replace(/-/g, "_"))
    );
  }

  @Command({
    command: "create:command <name>",
    describe: "创建一个命令",
  })
  async createCommand(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string
  ): Promise<void> {
    await this.render(
      `console/commands/${dasherize(name).toLowerCase()}.command.ts`,
      "command.njk",
      { name }
    );
  }

  @Command({
    command: "create:controller <name>",
    describe: "创建一个控制器",
  })
  async createController(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string,
    @Option({
      alias: "r",
      describe: "是否创建一个 Rest API 控制器",
      name: "rest",
      type: "boolean",
    })
    rest: boolean
  ): Promise<void> {
    await this.render(
      `http/controllers/${dasherize(name).toLowerCase()}.controller.ts`,
      "controller.njk",
      { name, rest }
    );
  }

  @Command({
    command: "create:entity <name>",
    describe: "创建一个实体",
  })
  async createEntity(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string,
    @Option({
      alias: "s",
      describe: "是否可搜索",
      name: "searchable",
      type: "boolean",
    })
    searchable: boolean
  ): Promise<void> {
    await this.render(
      `database/entities/${dasherize(name).toLowerCase()}.entity.ts`,
      "entity.njk",
      { name, searchable }
    );
  }

  @Command({
    command: "create:service <name>",
    describe: "创建一个服务",
  })
  async createService(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string,
    @Option({
      alias: "s",
      describe: "是否可搜索",
      name: "searchable",
      type: "boolean",
    })
    searchable: boolean
  ): Promise<void> {
    await this.render(
      `service/services/${dasherize(name).toLowerCase()}.service.ts`,
      "service.njk",
      { name, searchable }
    );
  }

  @Command({
    command: "create:data-loader <name>",
    describe: "创建一个 DataLoader",
  })
  async createDataLoader(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string
  ): Promise<void> {
    await this.render(
      `http/data-loaders/${dasherize(name).toLowerCase()}.data-loader.ts`,
      "data-loader.njk",
      { name }
    );
  }

  @Command({
    command: "create:queue <name>",
    describe: "创建一个队列",
  })
  async createQueue(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string
  ): Promise<void> {
    await this.render(
      `queue/queues/${dasherize(name).toLowerCase()}.queue.ts`,
      "queue.njk",
      { name }
    );
  }

  @Command({
    command: "create:resolver <name>",
    describe: "创建一个 GraphQL 解决器",
  })
  async createResolver(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string
  ): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`${name}`);
  }

  @Command({
    command: "create:graphql <name>",
    describe: "创建一组 GraphQL 代码",
  })
  async createGraphql(
    @Positional({
      name: "name",
      describe: "名称",
      type: "string",
    })
    name: string
  ): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`${name}`);
  }

  async render(
    path: string,
    name: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    return await outputFile(
      resolve(this.basePath, path),
      prettier.format(this.template.render(name, context), {
        parser: "typescript",
      }),
      "utf-8"
    );
  }
}
