/**
 * Contract Validators
 * 
 * Provides validation functions for artifacts against their schemas
 */

import { ArtifactType } from './registry.js';

export interface Validator {
  validate(data: any): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Get a validator for a specific artifact type
 * 
 * In the future, this will integrate with a JSON schema validator like Ajv
 * For now, it returns a basic validator that always passes
 */
export function getValidatorForArtifact(artifactType: ArtifactType): Validator {
  // Stub implementation - in production, load and compile the JSON schema
  return {
    validate(data: any): ValidationResult {
      // Basic checks that data exists and is an object
      if (!data || typeof data !== 'object') {
        return {
          valid: false,
          errors: [
            {
              path: '/',
              message: 'Artifact data must be an object',
            },
          ],
        };
      }

      // TODO: Implement actual JSON schema validation using Ajv
      // const ajv = new Ajv();
      // const schema = loadSchema(artifactType);
      // const validate = ajv.compile(schema);
      // const valid = validate(data);
      // return { valid, errors: validate.errors };

      return {
        valid: true,
        errors: [],
      };
    },
  };
}

/**
 * Validate artifact data against its type schema
 */
export function validateArtifact(artifactType: ArtifactType, data: any): ValidationResult {
  const validator = getValidatorForArtifact(artifactType);
  return validator.validate(data);
}
