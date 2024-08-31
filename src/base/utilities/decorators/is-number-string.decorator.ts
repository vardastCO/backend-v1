import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsNumberString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isNumberString",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === "string" && !isNaN(Number(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string representing a number`;
        },
      },
    });
  };
}
