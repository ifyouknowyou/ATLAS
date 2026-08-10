import { ValidationError } from '@nestjs/common';
import { ApiValidationIssue } from '@atlas/shared';

/**
 * Flattens class-validator validation errors into a stable
 * `{ field, message }` shape for the API error contract.
 */
export function formatValidationIssues(
  errors: string | unknown[],
): ApiValidationIssue[] {
  if (typeof errors === 'string') {
    return [{ field: 'request', message: errors }];
  }
  const validationErrors = errors.filter(
    (e): e is ValidationError =>
      typeof e === 'object' && e !== null && 'property' in e,
  );
  return validationErrors.flatMap((e) => flattenError(e));
}

function flattenError(error: ValidationError): ApiValidationIssue[] {
  const self: ApiValidationIssue[] = error.constraints
    ? Object.values(error.constraints).map((message) => ({
        field: error.property,
        message,
      }))
    : [];

  const children: ApiValidationIssue[] = Array.isArray(error.children)
    ? error.children.flatMap((child) =>
        flattenError(child).map((issue) => ({
          ...issue,
          field: `${error.property}.${issue.field}`,
        })),
      )
    : [];

  return [...self, ...children];
}