import { getTranslation } from "@nest-boot/i18next";
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export enum Comparator {
  EQ = "EQ",
  GT = "GT",
  GTE = "GTE",
  LT = "LT",
  LTE = "LTE",
}

export function ValidateCompareNumber(
  comparator: Comparator,
  compareProperty: string,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (target: unknown, propertyKey: string) => {
    registerDecorator({
      name: "isGreaterThanOrEqual",
      target: target.constructor,
      propertyName: propertyKey,
      constraints: [comparator, compareProperty],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [innerComparator, innerCompareProperty] = args.constraints as [
            Comparator,
            string
          ];

          const compareValue = args.object[innerCompareProperty];

          if (compareValue === undefined || compareValue === null) {
            return true;
          }

          switch (innerComparator) {
            case Comparator.EQ:
              return Number(value) === Number(compareValue);
            case Comparator.GT:
              return Number(value) > Number(compareValue);
            case Comparator.GTE:
              return Number(value) >= Number(compareValue);
            case Comparator.LT:
              return Number(value) < Number(compareValue);
            case Comparator.LTE:
              return Number(value) <= Number(compareValue);
            default:
              return false;
          }
        },
        defaultMessage(args) {
          const t = getTranslation();

          const { property, constraints } = args;
          const [innerComparator, innerCompareProperty] = constraints;

          return t(`validation:is-${innerComparator.toLowerCase()}`, {
            ...args,
            property: t(`property:${property}`),
            compareProperty: t(`property:${innerCompareProperty}`),
          });
        },
      },
    });
  };
}
