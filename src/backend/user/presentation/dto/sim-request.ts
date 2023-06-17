import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function SimReq(property: string, validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'SimReq',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (value == undefined && relatedValue != undefined)
            return false;

          if (value == undefined && relatedValue == undefined)
            return true;

          return typeof value === 'string' && typeof relatedValue === 'string' && relatedValue == value;
        }
      },
    });
  };
}