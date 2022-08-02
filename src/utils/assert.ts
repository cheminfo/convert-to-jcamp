import { MeasurementXYVariables } from 'cheminfo-types';

export type PartialMeasurementXYVariables = Partial<MeasurementXYVariables>;
export function assertMeasurementXYVariables(
  variables: PartialMeasurementXYVariables,
): asserts variables is MeasurementXYVariables {
  assertVariablesHasX(variables);
  assertVariablesHasY(variables);
}

export type MeasurementXYVariablesWithX = Omit<
  PartialMeasurementXYVariables,
  'x'
> &
  Pick<MeasurementXYVariables, 'x'>;

export function assertVariablesHasX(
  variables: PartialMeasurementXYVariables,
): asserts variables is MeasurementXYVariablesWithX {
  if (!variables.x) {
    throw new Error('variables has not x');
  }
}

export type MeasurementXYVariablesWithY = Omit<
  PartialMeasurementXYVariables,
  'y'
> &
  Pick<MeasurementXYVariables, 'y'>;

export function assertVariablesHasY(
  variables: PartialMeasurementXYVariables,
): asserts variables is MeasurementXYVariablesWithY {
  if (!variables.y) {
    throw new Error('variables has not y');
  }
}

export function variablesHasXY(
  variables: PartialMeasurementXYVariables,
): variables is MeasurementXYVariables {
  return variables.x && variables.y ? true : false;
}
