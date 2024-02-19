import { PermissionActionsEnum } from "./enums/permission-actions.enum";
import { PermissionSeedObject } from "./master-permission.seed";

/**
 * Method
 */
export type MethodList = "index" | "store" | "show" | "update" | "destroy";

export type methodRoleType =
  | {
      [Property in MethodList]: string[];
    }
  | {};

type MethodsMap = {
  [Property in MethodList]: { name: string; action: PermissionActionsEnum };
};

/**
 * Options
 */
type ResourcePermissionSeedOption = {
  methods: MethodList[];
  role: string[];
  methodRoles: methodRoleType;
};

/**
 * EndpointType
 */
type EndpointTypeList = "gql" | "rest";

type EndpointTypeMap = {
  [Property in EndpointTypeList]: { name: string };
};

export class ResourcePermissionSeed {
  public static METHODS: MethodsMap = {
    index: { name: "لیست", action: PermissionActionsEnum.READ },
    store: { name: "ثبت رکورد", action: PermissionActionsEnum.CREATE },
    show: { name: "مشاهده جزئیات", action: PermissionActionsEnum.READ },
    update: { name: "بروزرسانی", action: PermissionActionsEnum.UPDATE },
    destroy: { name: "حذف", action: PermissionActionsEnum.DELETE },
  };

  public static ENDPOINT_TYPES: EndpointTypeMap = {
    gql: { name: "GraphQL" },
    rest: { name: "Rest" },
  };

  protected module: string | null = null;

  protected subModule: string | null = null;

  protected constructor(
    protected endpointType: EndpointTypeList,
    protected name: string,
    protected displayName: string,
    protected options: ResourcePermissionSeedOption = {
      methods: [],
      role: [],
      methodRoles: {},
    },
  ) {}

  public static make(
    ...args: [
      endpointType: EndpointTypeList,
      name: string,
      displayName: string,
      options?: ResourcePermissionSeedOption,
    ]
  ): ResourcePermissionSeed {
    return new this(...args);
  }

  public only(...methods: MethodList[]): this {
    this.options["methods"] = methods;
    return this;
  }

  public roles(...roles: string[]): this {
    this.options["roles"] = roles;
    return this;
  }

  public methodRoles(
    methods: MethodList | MethodList[],
    roles: string | string[],
  ): this {
    roles = Array.isArray(roles) ? roles : [roles];
    methods = Array.isArray(methods) ? methods : [methods];
    for (const method of methods) {
      const currentMethodRoles = this.options["methodRoles"][method] ?? [];
      this.options["methodRoles"][method] = currentMethodRoles.concat(roles);
    }
    return this;
  }

  public except(...methods: MethodList[]): this {
    this.options["methods"] = (
      this.options["methods"] ?? this.getAllMethods()
    ).filter((item: MethodList) => !methods.includes(item)) as MethodList[];
    return this;
  }

  public setModule(module: string): this {
    this.module = module;
    return this;
  }

  public setSubModule(subModule: string): this {
    this.subModule = subModule;
    return this;
  }

  /**
   * @return array
   */
  public getPermissionsArray(): PermissionSeedObject[] {
    const permissions = (
      this.options["methods"].length == 0
        ? this.getAllMethods()
        : this.options["methods"]
    ).map((method: MethodList) =>
      this.makePermissionSeedArray(
        method,
        ResourcePermissionSeed.METHODS[method].name,
        ResourcePermissionSeed.ENDPOINT_TYPES[this.endpointType].name,
      ),
    );

    // if (this.options['withIndexOwn'] ?? false) {
    //     permissions.push(this.makePermissionSeedArray(
    //         'index.own',
    //         'لیست رکوردهای خود'
    //     ));
    // }

    // if (this.options['withMenu'] ?? false) {
    //     permissions.push(this.makePermissionSeedArray('menu', 'منو'));
    // }

    return permissions;
  }

  public withIndexOwn(): this {
    this.options["withIndexOwn"] = true;
    return this;
  }

  public withMenu(): this {
    this.options["withMenu"] = true;
    return this;
  }

  protected getAllMethods(): MethodList[] {
    return Object.keys(ResourcePermissionSeed.METHODS) as MethodList[];
  }

  protected makePermissionSeedArray(
    method: MethodList,
    methodName: string,
    endpointTypeName: string,
  ): PermissionSeedObject {
    return {
      name: this.generateName(method),
      displayName: `${this.displayName}: ${methodName} (${endpointTypeName})`,
      module: this.module,
      roleNames: (this.options["roles"] ?? []).concat(
        this.options["methodRoles"][method] ?? [],
      ),
      subject: this.name,
      action: ResourcePermissionSeed.METHODS[method].action,
    };
  }

  protected generateName(method: MethodList): string {
    return [
      this.endpointType,
      this.module,
      this.subModule,
      toSnakeCase(this.name),
      method,
    ]
      .filter(string => string)
      .join(".");
  }
}

const toSnakeCase = str =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join("_");
