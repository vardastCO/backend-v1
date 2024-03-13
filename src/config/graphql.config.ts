import {
  ApolloDriver,
  ApolloDriverAsyncConfig,
  ApolloDriverConfig,
} from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLFormattedError } from "graphql";
import { I18nService } from "nestjs-i18n";
// import { join } from "path";
export const graphqlAsyncConfig: ApolloDriverAsyncConfig = {
  driver: ApolloDriver,
  imports: [ConfigModule],
  inject: [ConfigService, I18nService],
  useFactory: async (
      configService: ConfigService,
      i18nService: I18nService,
  ): Promise<ApolloDriverConfig> => ({
    autoSchemaFile: true,
    introspection: true, 
    nodeEnv: configService.get<string>("APP_ENVIRONMENT"),
    formatError: function (
        formattedError: GraphQLFormattedError,
        error: unknown,
    ): GraphQLFormattedError {
      formattedError.extensions.displayMessage =
          formattedError.extensions.code === "BAD_REQUEST"
              ? formattedError.message
              : i18nService.t(`exceptions.${formattedError.extensions.code}`);

      if (!formattedError.extensions.hasOwnProperty("displayErrors")) {
        formattedError.extensions.displayErrors = [
          formattedError.extensions.displayMessage,
        ];
      }
      if (
          formattedError.extensions.code === "BAD_REQUEST" &&
          formattedError.extensions?.originalError.hasOwnProperty("message") &&
          Array.isArray(formattedError.extensions?.originalError["message"])
      ) {
        formattedError.extensions.displayErrors =
            formattedError.extensions?.originalError["message"];
      }
      return formattedError;
    },
    // context: async ({ req, res }: { req: Request; res: Response }) => {
    //   // Log the start time
    //   const startTime = new Date();
    
    //   // Log the incoming GraphQL request
    //   console.log(`Received GraphQL request: ${JSON.stringify(req.body)}`);
    //   // console.log(`Request headers: ${JSON.stringify(req.headers)}`);
    
    //   // // Return the context object
    //   // const contextObject = { req, res };
    
    //   // // Log the time it took to process the context
    //   // const endTime = new Date();
    //   // const executionTime = endTime.getTime() - startTime.getTime();
    //   // console.log(`Context execution time: ${executionTime} ms`);
    
    //   return contextObject;
    // },
  }),


};

