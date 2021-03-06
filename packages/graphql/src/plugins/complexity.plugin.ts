import { HttpException, LoggerService } from "@nestjs/common";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import {
  directiveEstimator,
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from "graphql-query-complexity";

export class ComplexityPlugin {
  constructor(
    readonly gqlSchemaHost: GraphQLSchemaHost,
    readonly logger: LoggerService,
    readonly maxComplexity = 1000,
    readonly defaultComplexity = 0
  ) {}

  async requestDidStart() {
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation: async ({ request, document }) => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            directiveEstimator({
              name: "complexity",
            }),
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: this.defaultComplexity }),
          ],
        });

        if (complexity >= this.maxComplexity) {
          this.logger.error(
            { operationName: request.operationName, complexity },
            "query complexity"
          );

          throw new HttpException(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${this.maxComplexity}`,
            429
          );
        }

        this.logger.log(
          { operationName: request.operationName, complexity },
          "query complexity"
        );
      },
    };
  }
}
