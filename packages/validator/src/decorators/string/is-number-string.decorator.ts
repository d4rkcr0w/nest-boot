import { ValidateBy, ValidationOptions } from "class-validator";
import ValidatorJS from "validator";
import isNumericValidator from "validator/lib/isNumeric";

import { buildI18nMessage } from "../../utils";

export const IS_NUMBER_STRING = "isNumberString";

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function isNumberString(
  value: unknown,
  options?: ValidatorJS.IsNumericOptions
): boolean {
  return typeof value === "string" && isNumericValidator(value, options);
}

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function IsNumberString(
  options?: ValidatorJS.IsNumericOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_NUMBER_STRING,
      constraints: [options],
      validator: {
        validate: (value, args): boolean =>
          isNumberString(value, args.constraints[0]),
        defaultMessage: buildI18nMessage(() => "is-number-string"),
      },
    },
    validationOptions
  );
}
